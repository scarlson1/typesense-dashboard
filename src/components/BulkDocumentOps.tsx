import {
  dangerButtonSx,
  SectionCard,
  smallButtonSx,
} from '@/components/redesign';
import { DEFAULT_MONACO_OPTIONS } from '@/constants';
import {
  useAsyncToast,
  useDeleteByQuery,
  useDialog,
  useSchema,
  useTypesenseClient,
  useUpdateByQuery,
} from '@/hooks';
import { designTokens } from '@/theme/themePrimitives';
import type { TypesenseFieldType } from '@/types';
import type { OnMount } from '@monaco-editor/react';
import {
  Box,
  Button,
  Divider,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
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

// A valid update-by-filter patch is any non-empty subset of the collection's
// fields, each constrained to its declared type. `additionalProperties: false`
// makes typo'd field names surface in the editor instead of silently no-op'ing.
const buildPatchSchema = (fields: SchemaField[] = []) => {
  const properties: Record<string, unknown> = { id: { type: 'string' } };
  for (const f of fields) {
    if (f.name.includes('.')) continue; // nested child; covered by its object parent
    properties[f.name] = fieldTypeToJsonSchema(f.type);
  }
  return {
    type: 'object',
    properties,
    additionalProperties: false,
    minProperties: 1,
  };
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

  const [updateFilter, setUpdateFilter] = useState('');
  const [counting, setCounting] = useState<PendingCount>(null);

  const { data } = useSchema(collectionId);
  const patchSchema = useMemo(
    () => buildPatchSchema(data?.fields as SchemaField[] | undefined),
    [data?.fields],
  );

  const editorRef = useRef<editor.IStandaloneCodeEditor>(null);
  const [markers, setMarkers] = useState<editor.IMarker[]>([]);
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

  const handleUpdate = useCallback(async () => {
    const filterBy = updateFilter.trim();
    if (!filterBy) return void toast.warn('filter_by is required');
    if (markers.length)
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
  }, [
    collectionId,
    countMatches,
    dialog,
    markers.length,
    toast,
    updateFilter,
    updateMutation,
  ]);

  return (
    <Stack
      direction='column'
      spacing={1.25}
      // sx={{ gap: 1.25 }}
    >
      <TextField
        label='Update filter (filter_by)'
        // placeholder='e.g. in_stock:false'
        placeholder='e.g. num_employees:>1000'
        value={updateFilter}
        onChange={(e) => setUpdateFilter(e.target.value)}
        size='small'
        fullWidth
        slotProps={monoInputSlotProps}
      />
      <Stack sx={{ gap: 0.5 }}>
        <Typography sx={{ fontSize: 11.5, color: designTokens.textMuted }}>
          Document patch (JSON)
        </Typography>
        <Box
          sx={{
            border: `1px solid ${designTokens.border}`,
            borderRadius: 0.875,
            overflow: 'hidden',
          }}
        >
          <Suspense fallback={<Skeleton variant='rounded' height={160} />}>
            <JsonEditor
              height={160}
              defaultValue={'{\n  \n}'}
              onMount={handleMount}
              onValidate={(m) => setMarkers(m)}
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
        onClick={() => void handleUpdate()}
        disabled={Boolean(markers.length)}
        loading={counting === 'update' || updateMutation.isPending}
      >
        Preview &amp; update matches
      </Button>
    </Stack>
  );
}

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
        label='Delete filter (filter_by)'
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
