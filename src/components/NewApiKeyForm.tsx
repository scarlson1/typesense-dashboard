import { collectionQueryKeys } from '@/constants';
import { useTypesenseClient } from '@/hooks';
import {
  fieldChipSx,
  fieldInputSx,
  FormField,
  primaryButtonSx,
} from '@/components/redesign';
import { designTokens } from '@/theme/themePrimitives';
import {
  collectionActions as zCollectionActions,
  documentActions as zDocumentActions,
  aliasActions as zAliasActions,
  synonymActions as zSynonymActions,
  overrideActions as zOverrideActions,
  stopwordsActions as zStopwordsActions,
  keysActions as zKeysActions,
  analyticsActions as zAnalyticsActions,
  analyticsRulesActions as zAnalyticsRulesActions,
  analyticsEventsActions as zAnalyticsEventsActions,
  miscActions as zMiscActions,
  presetActions as zPresetActions,
  streamingDictActions as zStemmingActions,
  operationsActions as zOperationsActions,
  convoModelOpsActions as zConvoModelActions,
  naturalLangSearchActions as zNlSearchActions,
  configOpsActions as zConfigActions,
} from '@/types';
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Stack,
  TextField,
  type Theme,
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { KeyCreateSchema } from 'typesense/lib/Typesense/Key';

interface ActionOption {
  value: string;
  group: string;
}

const ACTION_GROUPS: { label: string; values: readonly string[] }[] = [
  { label: 'Documents', values: zDocumentActions.options },
  { label: 'Collections', values: zCollectionActions.options },
  { label: 'Aliases', values: zAliasActions.options },
  { label: 'Synonyms', values: zSynonymActions.options },
  { label: 'Overrides', values: zOverrideActions.options },
  { label: 'Stopwords', values: zStopwordsActions.options },
  { label: 'Presets', values: zPresetActions.options },
  { label: 'API keys', values: zKeysActions.options },
  { label: 'Analytics', values: zAnalyticsActions.options },
  { label: 'Analytics rules', values: zAnalyticsRulesActions.options },
  { label: 'Analytics events', values: zAnalyticsEventsActions.options },
  { label: 'Stemming dictionaries', values: zStemmingActions.options },
  { label: 'Operations', values: zOperationsActions.options },
  { label: 'Conversation models', values: zConvoModelActions.options },
  { label: 'NL search models', values: zNlSearchActions.options },
  { label: 'Config', values: zConfigActions.options },
  { label: 'Misc & wildcard', values: zMiscActions.options },
];

const ACTION_OPTIONS: ActionOption[] = ACTION_GROUPS.flatMap((g) =>
  g.values.map((v) => ({ value: v, group: g.label })),
);

interface NewApiKeyFormProps {
  values: KeyCreateSchema;
  onChange: (next: KeyCreateSchema) => void;
  onSubmit: () => void;
  submitting: boolean;
}

const NewApiKeyForm = ({
  values,
  onChange,
  onSubmit,
  submitting,
}: NewApiKeyFormProps) => {
  const [client, clusterId] = useTypesenseClient();

  const { data: collections } = useQuery({
    queryKey: collectionQueryKeys.all(clusterId),
    queryFn: () => client.collections().retrieve(),
  });

  const collectionOptions = useMemo<string[]>(
    () => ['*', ...(collections?.map((c) => c.name) ?? [])],
    [collections],
  );

  const selectedActions = useMemo<ActionOption[]>(
    () =>
      (values.actions ?? []).map((v) => {
        const found = ACTION_OPTIONS.find((o) => o.value === v);
        return found ?? { value: v, group: 'Custom' };
      }),
    [values.actions],
  );

  const expiresDate = useMemo(() => {
    if (!values.expires_at) return null;
    const d = new Date(values.expires_at * 1000);
    return Number.isFinite(d.getTime()) ? d : null;
  }, [values.expires_at]);

  const update = <K extends keyof KeyCreateSchema>(
    key: K,
    val: KeyCreateSchema[K],
  ) => {
    onChange({ ...values, [key]: val });
  };

  const autocompletePaperSx = {
    border: (theme: Theme) => `1px solid ${theme.palette.divider}`,
  };

  const canSubmit =
    !submitting && (values.actions?.length ?? 0) > 0 && (values.collections?.length ?? 0) > 0;

  return (
    <Stack spacing={2}>
      <FormField label='Description' htmlFor='api-key-description'>
        <TextField
          id='api-key-description'
          placeholder='e.g. Internal indexer · v2'
          value={values.description ?? ''}
          onChange={(e) => update('description', e.target.value)}
          sx={fieldInputSx}
          fullWidth
        />
      </FormField>

      <FormField
        label='Actions'
        helperText='Pick one or more actions this key is allowed to perform.'
      >
        <Autocomplete<ActionOption, true, false, false>
          multiple
          disableCloseOnSelect
          options={ACTION_OPTIONS}
          value={selectedActions}
          groupBy={(o) => o.group}
          getOptionLabel={(o) => o.value}
          isOptionEqualToValue={(a, b) => a.value === b.value}
          onChange={(_, next) =>
            update(
              'actions',
              next.map((o) => o.value),
            )
          }
          slotProps={{
            paper: { sx: autocompletePaperSx },
          }}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => {
              const { key, ...tagProps } = getTagProps({ index });
              return (
                <Chip
                  key={key}
                  size='small'
                  label={option.value}
                  sx={fieldChipSx}
                  {...tagProps}
                />
              );
            })
          }
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={selectedActions.length ? '' : 'Add action…'}
              sx={fieldInputSx}
            />
          )}
        />
      </FormField>

      <FormField
        label='Collections'
        helperText='Use * to scope this key to every collection.'
      >
        <Autocomplete<string, true, false, true>
          multiple
          freeSolo
          disableCloseOnSelect
          options={collectionOptions}
          value={values.collections ?? []}
          onChange={(_, next) => update('collections', next as string[])}
          slotProps={{
            paper: { sx: autocompletePaperSx },
          }}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => {
              const { key, ...tagProps } = getTagProps({ index });
              return (
                <Chip
                  key={key}
                  size='small'
                  label={option}
                  sx={fieldChipSx}
                  {...tagProps}
                />
              );
            })
          }
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={
                (values.collections ?? []).length ? '' : 'Add collection…'
              }
              sx={fieldInputSx}
            />
          )}
        />
      </FormField>

      <FormField
        label='Expires'
        helperText='Leave empty for a key that never expires.'
      >
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            value={expiresDate}
            onChange={(d) => {
              if (!d || !Number.isFinite(d.getTime())) {
                const { expires_at: _omit, ...rest } = values;
                onChange(rest);
                return;
              }
              update('expires_at', Math.floor(d.getTime() / 1000));
            }}
            slotProps={{
              textField: {
                placeholder: 'Never',
                sx: fieldInputSx,
                fullWidth: true,
              },
              nextIconButton: { size: 'small' },
              previousIconButton: { size: 'small' },
              field: { clearable: true },
            }}
          />
        </LocalizationProvider>
      </FormField>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, pt: 0.5 }}>
        <Button
          variant='contained'
          onClick={onSubmit}
          disabled={!canSubmit}
          sx={{
            ...primaryButtonSx,
            color: designTokens.onAccent,
          }}
        >
          {submitting ? 'Creating…' : 'Create key'}
        </Button>
      </Box>
    </Stack>
  );
};

export default NewApiKeyForm;
