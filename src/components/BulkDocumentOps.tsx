import {
  dangerButtonSx,
  ghostButtonSx,
  SectionCard,
  smallButtonSx,
} from '@/components/redesign';
import {
  buildFilterBy,
  DEFAULT_MONACO_OPTIONS,
  emptyCondition,
  fieldKind,
  OPERATORS,
  operatorsByKind,
  updateFilterFormOpts,
  type FieldKind,
} from '@/constants';
import {
  useAppForm,
  useAsyncToast,
  useDeleteByQuery,
  useDialog,
  useSchema,
  useTypesenseClient,
  useUpdateByQuery,
  withForm,
} from '@/hooks';
import { designTokens } from '@/theme/themePrimitives';
import type { TypesenseFieldType } from '@/types';
import type { OnMount } from '@monaco-editor/react';
import { AddRounded, CloseRounded } from '@mui/icons-material';
import {
  Box,
  Button,
  Divider,
  IconButton,
  Skeleton,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useStore } from '@tanstack/react-form';
import { editor } from 'monaco-editor';
import { lazy, Suspense, useCallback, useMemo, useRef, useState } from 'react';
import type { Client } from 'typesense';

const JsonEditor = lazy(() => import('./JsonEditor'));

type PendingCount = 'delete' | 'update' | null;

// Map a Typesense field type to a JSON-schema fragment so Monaco can validate
// a patch value against the field's declared type.
const fieldTypeToJsonSchema = (
  type: TypesenseFieldType,
): Record<string, unknown> => {
  switch (type) {
    case 'string':
    case 'string*':
    case 'image':
      return { type: 'string' };
    case 'int32':
    case 'int64':
      return { type: 'integer' };
    case 'float':
      return { type: 'number' };
    case 'bool':
      return { type: 'boolean' };
    case 'string[]':
      return { type: 'array', items: { type: 'string' } };
    case 'int32[]':
    case 'int64[]':
      return { type: 'array', items: { type: 'integer' } };
    case 'float[]':
      return { type: 'array', items: { type: 'number' } };
    case 'bool[]':
      return { type: 'array', items: { type: 'boolean' } };
    case 'geopoint':
      return {
        type: 'array',
        items: { type: 'number' },
        minItems: 2,
        maxItems: 2,
      };
    case 'geopoint[]':
      return {
        type: 'array',
        items: { type: 'array', items: { type: 'number' } },
      };
    case 'geopolygon':
      return { type: 'array', items: { type: 'number' } };
    case 'object':
      return { type: 'object' };
    case 'object[]':
      return { type: 'array', items: { type: 'object' } };
    case 'auto':
    default:
      return {}; // accept anything
  }
};

interface SchemaField {
  name: string;
  type: TypesenseFieldType;
}

interface FieldNode {
  type?: TypesenseFieldType;
  children: Map<string, FieldNode>;
}

// Turn a field tree node into a JSON-schema fragment. Nodes with children are
// the nested object fields (`address` -> `address.state`); they rebuild into
// real nested `properties` so the editor can autocomplete sub-keys.
const nodeToJsonSchema = (node: FieldNode): Record<string, unknown> => {
  if (node.children.size === 0) {
    return node.type ? fieldTypeToJsonSchema(node.type) : {};
  }
  const properties: Record<string, unknown> = {};
  for (const [name, child] of node.children) {
    properties[name] = nodeToJsonSchema(child);
  }
  const objectSchema = { type: 'object', properties };
  // An `object[]` parent holds an array of these nested objects.
  return node.type?.endsWith('[]')
    ? { type: 'array', items: objectSchema }
    : objectSchema;
};

// A valid update-by-filter patch is any subset of the collection's fields, each
// constrained to its declared type. Dotted field names (`address.state`) are
// split so nested object fields rebuild into nested schemas, which is what
// enables sub-key autocomplete. No `additionalProperties: false` — Typesense
// documents may carry stored-only keys absent from the indexed schema.
const buildPatchSchema = (fields: SchemaField[] = []) => {
  const root: FieldNode = { children: new Map() };
  for (const field of fields) {
    if (field.name === '.*') continue; // auto-detect marker, not a real field
    let node = root;
    for (const part of field.name.split('.')) {
      let child = node.children.get(part);
      if (!child) {
        child = { children: new Map() };
        node.children.set(part, child);
      }
      node = child;
    }
    node.type = field.type;
  }
  return nodeToJsonSchema(root);
};

const monoInputSlotProps = {
  input: { sx: { fontFamily: designTokens.fontMono, fontSize: 12.5 } },
} as const;

/**
 * Bulk write operations against a collection's documents: update-by-filter
 * and delete-by-filter. Both preview the match count and confirm before
 * touching anything.
 */
export const BulkDocumentOpsCard = ({
  collectionId,
}: {
  collectionId: string;
}) => {
  const [client] = useTypesenseClient();

  return (
    <SectionCard
      title='Bulk document operations'
      description='Update or delete every document matching a filter. The match count is previewed before anything runs.'
    >
      <Typography
        sx={{ fontSize: 12.5, fontWeight: 600, color: designTokens.text }}
        gutterBottom
      >
        Update by filter
      </Typography>
      <UpdateByQuery collectionId={collectionId} client={client} />

      <Divider />

      <Typography
        sx={{ fontSize: 12.5, fontWeight: 600, color: designTokens.danger }}
        gutterBottom
      >
        Delete by filter
      </Typography>
      <DeleteByFilter collectionId={collectionId} client={client} />
    </SectionCard>
  );
};

function UpdateByQuery({
  collectionId,
  client,
}: {
  collectionId: string;
  client: Client;
}) {
  const toast = useAsyncToast();
  const dialog = useDialog();

  const [counting, setCounting] = useState<PendingCount>(null);
  // Builder vs. raw escape hatch. The structured builder can't express mixed
  // AND/OR precedence, geo, or object fields — raw mode covers those.
  const [rawMode, setRawMode] = useState(false);
  const [rawFilter, setRawFilter] = useState('');

  const { data } = useSchema(collectionId);
  const patchSchema = useMemo(
    () => buildPatchSchema(data?.fields as SchemaField[] | undefined),
    [data?.fields],
  );

  const fields = (data?.fields ?? []) as SchemaField[];
  // Read field kinds from a ref so the form's onSubmit closure always sees the
  // latest schema without re-creating the form.
  const fieldsRef = useRef<SchemaField[]>(fields);
  fieldsRef.current = fields;
  const kindOf = useCallback((name: string): FieldKind => {
    const f = fieldsRef.current.find((x) => x.name === name);
    return f ? fieldKind(f.type) : 'unsupported';
  }, []);

  // Monaco markers gate the document patch. Mirror them in a ref for the async
  // submit path (where the state value would be stale).
  const editorRef = useRef<editor.IStandaloneCodeEditor>(null);
  const markersRef = useRef<editor.IMarker[]>([]);
  const [markers, setMarkers] = useState<editor.IMarker[]>([]);
  const handleValidate = useCallback((m: editor.IMarker[]) => {
    markersRef.current = m;
    setMarkers(m);
  }, []);
  const handleMount: OnMount = useCallback((ed) => {
    editorRef.current = ed;
  }, []);

  const updateMutation = useUpdateByQuery();

  const countMatches = useCallback(
    async (filterBy: string) => {
      const res = await client
        .collections(collectionId)
        .documents()
        .search({ q: '*', filter_by: filterBy, per_page: 0 });
      return res.found;
    },
    [client, collectionId],
  );

  const runUpdate = useCallback(
    async (filterBy: string) => {
      filterBy = filterBy.trim();
      if (!filterBy) return void toast.warn('a filter condition is required');
      if (markersRef.current.length)
        return void toast.warn('fix the highlighted JSON errors', {
          id: 'monaco-validation',
        });

      const raw = editorRef.current?.getValue()?.trim();
      if (!raw) return void toast.warn('document patch is required');

      let document: Record<string, unknown>;
      try {
        document = JSON.parse(raw);
      } catch {
        return void toast.warn('document patch is not valid JSON');
      }
      if (
        !document ||
        Array.isArray(document) ||
        typeof document !== 'object' ||
        !Object.keys(document).length
      ) {
        return void toast.warn(
          'document patch must be a JSON object with at least one field',
        );
      }

      setCounting('update');
      let found: number;
      try {
        found = await countMatches(filterBy);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : 'error counting matches',
        );
        return;
      } finally {
        setCounting(null);
      }

      if (!found) return void toast.info('no documents match this filter');

      try {
        await dialog.prompt({
          variant: 'danger',
          catchOnCancel: true,
          title: `Update ${found.toLocaleString()} documents?`,
          description: `The fields ${Object.keys(document).join(', ')} will be patched onto every document in "${collectionId}" matching ${filterBy}.`,
          slotProps: {
            cancelButton: { children: 'cancel' },
            acceptButton: { children: `update ${found.toLocaleString()} docs` },
          },
        });
      } catch (err) {
        console.log('cancelled update by query', err);
        return;
      }

      updateMutation.mutate({ collectionId, document, filterBy });
    },
    [collectionId, countMatches, dialog, toast, updateMutation],
  );

  const form = useAppForm({
    ...updateFilterFormOpts,
    onSubmit: async ({ value }) => {
      await runUpdate(buildFilterBy(value, kindOf));
    },
  });

  return (
    <Stack direction='column' spacing={1}>
      <Stack
        direction='row'
        sx={{ justifyContent: 'space-between', alignItems: 'center' }}
      >
        <Typography
          sx={{
            // fontSize: 11.5, color: designTokens.textMuted
            fontSize: 10.5,
            fontWeight: 700,
            color: designTokens.textFaint,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.08em',
            pb: 0.75,
          }}
        >
          Update filter (filter_by)
        </Typography>
        <Button
          size='small'
          // sx={smallButtonSx}
          sx={ghostButtonSx}
          onClick={() => setRawMode((m) => !m)}
        >
          {rawMode ? 'Use builder' : 'Raw filter'}
        </Button>
      </Stack>

      {rawMode ? (
        <TextField
          label='Raw filter (filter_by)'
          placeholder='e.g. (num_employees:>1000 && country:=US) || featured:=true'
          value={rawFilter}
          onChange={(e) => setRawFilter(e.target.value)}
          size='small'
          fullWidth
          slotProps={monoInputSlotProps}
        />
      ) : (
        <Suspense fallback={<Skeleton variant='rounded' height={96} />}>
          <form.AppField name='join'>
            {({ state, handleChange }) => (
              <ToggleButtonGroup
                exclusive
                size='small'
                value={state.value}
                onChange={(_, v) => v && handleChange(v)}
                sx={{
                  alignSelf: 'flex-start',
                  mb: 1,
                  '& .MuiToggleButton-root': {
                    textTransform: 'none',
                    px: 1,
                    py: 0.5,
                  },
                }}
              >
                <ToggleButton value='&&'>Match All</ToggleButton>
                <ToggleButton value='||'>Match Any</ToggleButton>
              </ToggleButtonGroup>
            )}
          </form.AppField>

          <form.Field name='conditions' mode='array'>
            {(arrayField) => (
              <Stack spacing={1}>
                {arrayField.state.value.map((_, i) => (
                  <ConditionRow
                    key={i}
                    form={form}
                    index={i}
                    fields={fields}
                    canRemove={arrayField.state.value.length > 1}
                    onRemove={() => arrayField.removeValue(i)}
                  />
                ))}
                <Button
                  size='small'
                  startIcon={<AddRounded sx={{ fontSize: 14 }} />}
                  sx={{ ...ghostButtonSx, alignSelf: 'flex-start' }}
                  onClick={() => arrayField.pushValue({ ...emptyCondition })}
                >
                  Add condition
                </Button>
              </Stack>
            )}
          </form.Field>

          <form.Subscribe selector={(s) => s.values}>
            {(v) => (
              <Typography
                sx={{
                  fontFamily: designTokens.fontMono,
                  fontSize: 11.5,
                  color: designTokens.textMuted,
                  wordBreak: 'break-all',
                }}
              >
                filter_by: {buildFilterBy(v, kindOf) || '—'}
              </Typography>
            )}
          </form.Subscribe>
        </Suspense>
      )}

      <Stack sx={{ gap: 0.5 }}>
        <Typography
          sx={{
            // fontSize: 11.5, color: designTokens.textMuted
            fontSize: 10.5,
            fontWeight: 700,
            color: designTokens.textFaint,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.08em',
            pb: 0.75,
          }}
        >
          Document patch (JSON)
        </Typography>
        <Box
          data-testid='update-patch-editor'
          sx={{
            border: `1px solid ${designTokens.border}`,
            borderRadius: 0.875,
            overflow: 'hidden',
          }}
        >
          <Suspense fallback={<Skeleton variant='rounded' height={140} />}>
            <JsonEditor
              height={140}
              defaultValue={'{\n  \n}'}
              onMount={handleMount}
              onValidate={handleValidate}
              options={DEFAULT_MONACO_OPTIONS}
              schema={patchSchema}
            />
          </Suspense>
        </Box>
      </Stack>
      <Button
        variant='outlined'
        size='small'
        sx={smallButtonSx}
        onClick={() =>
          rawMode ? void runUpdate(rawFilter) : void form.handleSubmit()
        }
        disabled={Boolean(markers.length)}
        loading={counting === 'update' || updateMutation.isPending}
      >
        Preview &amp; update matches
      </Button>
    </Stack>
  );
}

/**
 * One `field <operator> value` row of the filter builder. Pulled into its own
 * `withForm` component so each row subscribes only to its own slice of state —
 * changing one row doesn't re-render the others, and the value control's shape
 * stays derived from the selected field's kind.
 */
const ConditionRow = withForm({
  ...updateFilterFormOpts,
  props: {
    index: 0,
    fields: [] as SchemaField[],
    canRemove: false,
    onRemove: () => {},
  },
  render: function ConditionRow({ form, index, fields, canRemove, onRemove }) {
    const base = `conditions[${index}]` as const;

    const fieldName = useStore(
      form.store,
      (s) => s.values.conditions[index]?.field,
    );
    const operator = useStore(
      form.store,
      (s) => s.values.conditions[index]?.operator,
    );

    const kind = useMemo<FieldKind>(() => {
      const f = fields.find((x) => x.name === fieldName);
      return f ? fieldKind(f.type) : 'unsupported';
    }, [fields, fieldName]);

    // Only fields the builder can actually filter; geo/object need raw mode.
    const fieldOptions = useMemo(
      () =>
        fields
          .filter((f) => operatorsByKind[fieldKind(f.type)].length > 0)
          .map((f) => f.name),
      [fields],
    );
    const operatorOptions = operatorsByKind[kind].map((op) => ({
      value: op,
      label: OPERATORS[op].label,
    }));
    const inputKind = OPERATORS[operator]?.input ?? 'single';

    return (
      <Stack direction='row' spacing={1} sx={{ alignItems: 'flex-start' }}>
        <form.AppField
          name={`${base}.field`}
          listeners={{
            // Reset operator + value when the field changes so we never keep an
            // operator that's illegal for the new field's kind.
            onChange: ({ value }) => {
              const f = fields.find((x) => x.name === value);
              const k = f ? fieldKind(f.type) : 'unsupported';
              form.setFieldValue(
                `${base}.operator`,
                operatorsByKind[k][0] ?? 'eq',
              );
              form.setFieldValue(`${base}.value`, '');
              form.setFieldValue(`${base}.valueMax`, '');
              form.setFieldValue(`${base}.values`, []);
            },
          }}
        >
          {({ Select }) => (
            <Select label='Field' options={fieldOptions} size='small' />
          )}
        </form.AppField>

        <form.AppField name={`${base}.operator`}>
          {({ Select }) => (
            <Select label='Operator' options={operatorOptions} size='small' />
          )}
        </form.AppField>

        {kind === 'bool' ? (
          <form.AppField name={`${base}.value`}>
            {({ Select }) => (
              <Select label='Value' options={['true', 'false']} size='small' />
            )}
          </form.AppField>
        ) : inputKind === 'multi' ? (
          <form.AppField name={`${base}.values`}>
            {({ Autocomplete }) => (
              <Autocomplete label='Values' multiple freeSolo options={[]} />
            )}
          </form.AppField>
        ) : inputKind === 'range' ? (
          <>
            <form.AppField name={`${base}.value`}>
              {({ TextField }) => (
                <TextField label='Min' type='number' size='small' />
              )}
            </form.AppField>
            <form.AppField name={`${base}.valueMax`}>
              {({ TextField }) => (
                <TextField label='Max' type='number' size='small' />
              )}
            </form.AppField>
          </>
        ) : (
          <form.AppField name={`${base}.value`}>
            {({ TextField }) => (
              <TextField
                label='Value'
                type={kind === 'numeric' ? 'number' : 'text'}
                size='small'
              />
            )}
          </form.AppField>
        )}

        <IconButton
          size='small'
          disabled={!canRemove}
          onClick={onRemove}
          aria-label='remove condition'
        >
          <CloseRounded sx={{ fontSize: 16 }} />
        </IconButton>
      </Stack>
    );
  },
});

function DeleteByFilter({
  collectionId,
  client,
}: {
  collectionId: string;
  client: Client;
}) {
  const toast = useAsyncToast();
  const dialog = useDialog();

  const [deleteFilter, setDeleteFilter] = useState('');

  const [counting, setCounting] = useState<PendingCount>(null);

  const deleteMutation = useDeleteByQuery({
    onSuccess: () => setDeleteFilter(''),
  });

  const countMatches = useCallback(
    async (filterBy: string) => {
      const res = await client
        .collections(collectionId)
        .documents()
        .search({ q: '*', filter_by: filterBy, per_page: 0 });
      return res.found;
    },
    [client, collectionId],
  );

  const handleDelete = useCallback(async () => {
    const filterBy = deleteFilter.trim();
    if (!filterBy) return void toast.warn('filter_by is required');

    setCounting('delete');
    let found: number;
    try {
      found = await countMatches(filterBy);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'error counting matches',
      );
      return;
    } finally {
      setCounting(null);
    }

    if (!found) return void toast.info('no documents match this filter');

    try {
      await dialog.prompt({
        variant: 'danger',
        catchOnCancel: true,
        title: `Delete ${found.toLocaleString()} documents?`,
        description: `Documents in "${collectionId}" matching ${filterBy} will be permanently deleted. This action cannot be undone.`,
        slotProps: {
          cancelButton: { children: 'cancel' },
          acceptButton: { children: `delete ${found.toLocaleString()} docs` },
        },
      });
    } catch (err) {
      console.log('cancelled delete by query', err);
      return;
    }

    deleteMutation.mutate({ collectionId, filterBy });
  }, [collectionId, countMatches, deleteFilter, deleteMutation, dialog, toast]);

  return (
    <Stack sx={{ gap: 1.25 }}>
      <TextField
        // label='Delete filter (filter_by)'
        placeholder='e.g. num_employees:<10'
        value={deleteFilter}
        onChange={(e) => setDeleteFilter(e.target.value)}
        size='small'
        fullWidth
        slotProps={monoInputSlotProps}
      />
      <Button
        variant='outlined'
        size='small'
        sx={dangerButtonSx}
        onClick={() => void handleDelete()}
        loading={counting === 'delete' || deleteMutation.isPending}
      >
        Preview &amp; delete matches
      </Button>
    </Stack>
  );
}
