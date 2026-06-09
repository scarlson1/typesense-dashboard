import { FormField, primaryButtonSx } from '@/components/redesign';
import { collectionQueryKeys } from '@/constants';
import {
  dividerPaperSx as autocompletePaperSx,
  fieldChipSx,
  fieldInputSx,
} from '@/constants/redesignSx';
import { useTypesenseClient } from '@/hooks';
import { designTokens } from '@/theme/themePrimitives';
import {
  aliasActions as zAliasActions,
  analyticsActions as zAnalyticsActions,
  analyticsEventsActions as zAnalyticsEventsActions,
  analyticsRulesActions as zAnalyticsRulesActions,
  collectionActions as zCollectionActions,
  configOpsActions as zConfigActions,
  convoModelOpsActions as zConvoModelActions,
  documentActions as zDocumentActions,
  keysActions as zKeysActions,
  miscActions as zMiscActions,
  naturalLangSearchActions as zNlSearchActions,
  operationsActions as zOperationsActions,
  overrideActions as zOverrideActions,
  presetActions as zPresetActions,
  streamingDictActions as zStemmingActions,
  stopwordsActions as zStopwordsActions,
  synonymActions as zSynonymActions,
} from '@/types';
import {
  Autocomplete,
  Box,
  Button,
  Stack,
  TextField,
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
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

  const canSubmit =
    !submitting &&
    (values.actions?.length ?? 0) > 0 &&
    (values.collections?.length ?? 0) > 0;

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
        <Autocomplete
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
            chip: { size: 'small', sx: fieldChipSx },
          }}
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
        <Autocomplete
          multiple
          freeSolo
          disableCloseOnSelect
          options={collectionOptions}
          value={values.collections ?? []}
          onChange={(_, next) => update('collections', next as string[])}
          slotProps={{
            paper: { sx: autocompletePaperSx },
            chip: { size: 'small', sx: fieldChipSx },
          }}
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
                sx: [
                  // fieldInputSx,
                  ...(Array.isArray(fieldInputSx)
                    ? fieldInputSx
                    : [fieldInputSx]),
                  {
                    '& .MuiOutlinedInput-root': {
                      py: 0,
                      '& .MuiPickersSectionList-root': {
                        padding: '4px 4px',
                        fontSize: 13,
                        fontFamily: designTokens.fontMono,
                        color: designTokens.text,
                      },
                      '& .MuiPickersSectionList-section': {
                        fontSize: 13,
                        fontFamily: designTokens.fontMono,
                      },
                      '& .MuiPickersSectionList-sectionContent': {
                        fontSize: 13,
                        fontFamily: designTokens.fontMono,
                      },
                      '& .MuiInputAdornment-root': {
                        marginLeft: 0,
                        '& button': {
                          padding: '4px',
                          color: designTokens.textFaint,
                        },
                      },
                    },
                  },
                ],
                fullWidth: true,
              },
              nextIconButton: { size: 'small' },
              previousIconButton: { size: 'small' },
              field: { clearable: true },
            }}
          />
        </LocalizationProvider>
      </FormField>

      <Box
        sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, pt: 0.5 }}
      >
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
