import { smallButtonSx } from '@/components/redesign';
import {
  collectionQueryKeys,
  isConversationHistoryCollection,
} from '@/constants';
import { dividerPaperSx, fieldInputSx } from '@/constants/redesignSx';
import { useCreateHistoryCollection, useTypesenseClient } from '@/hooks';
import { designTokens } from '@/theme/themePrimitives';
import { AddRounded, WarningAmberRounded } from '@mui/icons-material';
import { Autocomplete, Box, Button, Stack, TextField, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

/**
 * History-collection picker for conversation models. Lists only collections
 * whose schema satisfies the conversation-history requirements; when the typed
 * name matches no option, offers to create it with the fixed schema.
 */
export function HistoryCollectionField({
  value,
  onChange,
}: {
  value: string;
  onChange: (name: string) => void;
}) {
  const [client, clusterId] = useTypesenseClient();
  const { data: collections } = useQuery({
    queryKey: collectionQueryKeys.all(clusterId),
    queryFn: () => client.collections().retrieve(),
  });

  const validNames = useMemo(
    () =>
      (collections ?? [])
        .filter((c) => isConversationHistoryCollection(c))
        .map((c) => c.name),
    [collections],
  );
  const allNames = useMemo(
    () => new Set((collections ?? []).map((c) => c.name)),
    [collections],
  );

  const [inputValue, setInputValue] = useState(value);

  const create = useCreateHistoryCollection({
    onSuccess: (data) => {
      setInputValue(data.name);
      onChange(data.name);
    },
  });

  const trimmed = inputValue.trim();
  const matchesValid = validNames.includes(trimmed);
  const existsButInvalid = allNames.has(trimmed) && !matchesValid;
  const canCreate = Boolean(trimmed) && !matchesValid && !existsButInvalid;

  return (
    <Stack sx={{ gap: 0.75 }}>
      <Autocomplete
        freeSolo
        size='small'
        options={validNames}
        value={value || null}
        inputValue={inputValue}
        onInputChange={(_, v) => {
          setInputValue(v);
          onChange(v);
        }}
        onChange={(_, v) => onChange(typeof v === 'string' ? v : '')}
        slotProps={{ paper: { sx: dividerPaperSx } }}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder='e.g. conversation_store'
            sx={fieldInputSx}
          />
        )}
      />

      {canCreate ? (
        <Button
          size='small'
          variant='outlined'
          startIcon={<AddRounded sx={{ fontSize: 13 }} />}
          onClick={() => create.mutate(trimmed)}
          loading={create.isPending}
          sx={{ ...smallButtonSx, alignSelf: 'flex-start' }}
        >
          Create &ldquo;{trimmed}&rdquo;
        </Button>
      ) : existsButInvalid ? (
        <Stack direction='row' sx={{ alignItems: 'center', gap: 0.75 }}>
          <WarningAmberRounded sx={{ fontSize: 13, color: designTokens.warning }} />
          <Typography sx={{ fontSize: 11, color: designTokens.warningDeep }}>
            A collection named{' '}
            <Box component='span' sx={{ fontFamily: designTokens.fontMono }}>
              {trimmed}
            </Box>{' '}
            exists but is missing the required conversation-history fields.
          </Typography>
        </Stack>
      ) : (
        <Typography sx={{ fontSize: 11, color: designTokens.textFaint }}>
          Required — an existing collection that stores conversation turns
          (conversation_id, role, message, …).
        </Typography>
      )}
    </Stack>
  );
}
