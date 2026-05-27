import {
  EMPTY_PRESET_PARAMS,
  presetQueryKeys,
  presetType,
} from '@/constants';
import { useAsyncToast, useTypesenseClient } from '@/hooks';
import { designTokens } from '@/theme/themePrimitives';
import { queryClient } from '@/utils';
import { AddRounded } from '@mui/icons-material';
import { Box, Button, Stack, Typography } from '@mui/material';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import type {
  DocumentSchema,
  SearchParams,
} from 'typesense/lib/Typesense/Documents';
import type { MultiSearchRequestsSchema } from 'typesense/lib/Typesense/MultiSearch';
import { ErrorFallback } from './ErrorFallback';
import { UpdatePreset } from './UpdatePreset';

const NEW_PRESET_KEY = '__new__';

interface PresetDescriptor {
  name: string;
  isMulti: boolean;
  paramCount: number;
}

export function PresetsList() {
  const [client, clusterId] = useTypesenseClient();
  const { data: presets } = useSuspenseQuery({
    queryKey: presetQueryKeys.all(clusterId),
    queryFn: async () => {
      const { presets } = await client.presets().retrieve();
      return presets;
    },
  });

  const deleteMutation = useDeletePreset();

  const descriptors: PresetDescriptor[] = useMemo(
    () =>
      presets.map((p) => {
        const isMulti = isMultiSearch(p.value);
        const paramCount = isMulti
          ? (p.value as MultiSearchRequestsSchema<DocumentSchema, string>)
              .searches.length
          : Object.keys(p.value).length;
        return {
          name: p.name,
          isMulti,
          paramCount,
        };
      }),
    [presets],
  );

  const totalParams = useMemo(
    () => descriptors.reduce((sum, d) => sum + d.paramCount, 0),
    [descriptors],
  );

  const [selectedKey, setSelectedKey] = useState<string>(() =>
    descriptors[0]?.name ?? NEW_PRESET_KEY,
  );

  useEffect(() => {
    if (
      selectedKey !== NEW_PRESET_KEY &&
      !descriptors.find((d) => d.name === selectedKey)
    ) {
      setSelectedKey(descriptors[0]?.name ?? NEW_PRESET_KEY);
    }
  }, [descriptors, selectedKey]);

  const selectedPreset =
    selectedKey === NEW_PRESET_KEY
      ? null
      : presets.find((p) => p.name === selectedKey) ?? null;
  const selectedDescriptor = descriptors.find((d) => d.name === selectedKey);

  const editorKey =
    selectedKey === NEW_PRESET_KEY
      ? `${NEW_PRESET_KEY}-${descriptors.length}`
      : selectedKey;

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        alignItems: 'flex-start',
        width: '100%',
      }}
    >
      <Sidebar
        descriptors={descriptors}
        totalParams={totalParams}
        selectedKey={selectedKey}
        onSelect={setSelectedKey}
      />

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense>
            {selectedKey === NEW_PRESET_KEY || !selectedPreset ? (
              <UpdatePreset
                key={editorKey}
                isNew
                mutationProps={{
                  onSuccess: (data) => {
                    if (data?.name) setSelectedKey(data.name);
                  },
                }}
              />
            ) : (
              <UpdatePreset
                key={editorKey}
                presetName={selectedPreset.name}
                presetMeta={{
                  type: selectedDescriptor?.isMulti ? 'multi' : 'single',
                  paramCount: selectedDescriptor?.paramCount ?? 0,
                }}
                defaultValues={buildDefaultValues(selectedPreset)}
                onDelete={() => deleteMutation.mutate(selectedPreset.name)}
                isDeleting={
                  deleteMutation.isPending &&
                  deleteMutation.variables === selectedPreset.name
                }
                onDuplicate={() => setSelectedKey(NEW_PRESET_KEY)}
              />
            )}
          </Suspense>
        </ErrorBoundary>
      </Box>
    </Box>
  );
}

interface SidebarProps {
  descriptors: PresetDescriptor[];
  totalParams: number;
  selectedKey: string;
  onSelect: (key: string) => void;
}

function Sidebar({
  descriptors,
  totalParams,
  selectedKey,
  onSelect,
}: SidebarProps) {
  return (
    <Box sx={{ width: 260, flexShrink: 0 }}>
      <Stack
        direction='row'
        sx={{ alignItems: 'center', mb: 0.875, px: '2px' }}
      >
        <Typography
          sx={{
            flex: 1,
            fontSize: 11,
            fontWeight: 600,
            color: designTokens.textFaint,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          Saved presets
        </Typography>
        <Typography
          sx={{
            fontSize: 11,
            color: designTokens.textFaint,
            fontFamily: designTokens.fontMono,
          }}
        >
          {descriptors.length} · {totalParams} params
        </Typography>
      </Stack>

      <Stack spacing={0.625}>
        {descriptors.map((d) => {
          const selected = selectedKey === d.name;
          return (
            <Box
              key={d.name}
              component='button'
              type='button'
              onClick={() => onSelect(d.name)}
              sx={{
                width: '100%',
                textAlign: 'left',
                px: 1.5,
                py: 1.125,
                borderRadius: '7px',
                background: selected
                  ? designTokens.accentSoft
                  : designTokens.surface,
                border: `1px solid ${
                  selected ? designTokens.accentBorder : designTokens.border
                }`,
                cursor: 'pointer',
                font: 'inherit',
                transition: 'background 120ms ease, border-color 120ms ease',
                '&:hover': {
                  borderColor: selected
                    ? designTokens.accentBorder
                    : designTokens.borderStrong,
                  background: selected
                    ? designTokens.accentSoft
                    : designTokens.surfaceMuted,
                },
              }}
            >
              <Typography
                sx={{
                  fontFamily: designTokens.fontMono,
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: selected ? designTokens.accentDeep : designTokens.text,
                  mb: 0.5,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {d.name}
              </Typography>
              <Stack
                direction='row'
                spacing={0.75}
                sx={{
                  alignItems: 'center',
                  fontSize: 11,
                  color: designTokens.textMuted,
                }}
              >
                <Box component='span'>
                  {d.isMulti ? 'multi-search' : 'single-collection'}
                </Box>
                <Box component='span'>·</Box>
                <Box component='span'>
                  {d.paramCount} param{d.paramCount === 1 ? '' : 's'}
                </Box>
              </Stack>
            </Box>
          );
        })}

        <Button
          type='button'
          onClick={() => onSelect(NEW_PRESET_KEY)}
          startIcon={<AddRounded sx={{ fontSize: 14 }} />}
          sx={{
            mt: 0.75,
            justifyContent: 'flex-start',
            px: 1.5,
            py: 1.125,
            borderRadius: '7px',
            border: `1px dashed ${
              selectedKey === NEW_PRESET_KEY
                ? designTokens.accent
                : designTokens.borderStrong
            }`,
            background:
              selectedKey === NEW_PRESET_KEY
                ? designTokens.accentSoft
                : 'transparent',
            color:
              selectedKey === NEW_PRESET_KEY
                ? designTokens.accentDeep
                : designTokens.textMuted,
            fontSize: 12.5,
            fontWeight: 500,
            textTransform: 'none',
            '&:hover': {
              background:
                selectedKey === NEW_PRESET_KEY
                  ? designTokens.accentSoft
                  : designTokens.surfaceMuted,
              color: designTokens.text,
              borderColor: designTokens.accent,
            },
          }}
        >
          New preset
        </Button>
      </Stack>
    </Box>
  );
}

function buildDefaultValues(preset: {
  name: string;
  value:
    | SearchParams<DocumentSchema, string>
    | MultiSearchRequestsSchema<DocumentSchema, string>;
}) {
  const isMulti = isMultiSearch(preset.value);
  return {
    presetId: preset.name,
    presetType: isMulti
      ? presetType.enum['Multi-Search']
      : presetType.enum['Single-Collection'],
    searchParameters: isMulti
      ? [EMPTY_PRESET_PARAMS]
      : Object.entries(preset.value).map(([k, v]) => ({
          name: k,
          value: String(v),
        })),
    multiSearchParams: isMulti
      ? (preset.value as MultiSearchRequestsSchema<DocumentSchema, string>)
          .searches.map((x) =>
            Object.entries(x).map(([k, v]) => ({
              name: k,
              value: String(v),
            })),
          )
      : [[EMPTY_PRESET_PARAMS], [EMPTY_PRESET_PARAMS]],
  };
}

function useDeletePreset() {
  const [client, clusterId] = useTypesenseClient();
  const toast = useAsyncToast();

  return useMutation({
    mutationFn: (name: string) => client.presets(name).delete(),
    onMutate: (vars) => {
      toast.success(`deleting ["${vars}"]`, { id: `${vars}-delete` });
    },
    onSuccess: (_, vars) => {
      toast.success(`"${vars}" deleted`, { id: `${vars}-delete` });
    },
    onError: (_, vars) => {
      toast.success(`failed to delete rule ["${vars}"]`, {
        id: `${vars}-delete`,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: presetQueryKeys.all(clusterId),
      });
    },
  });
}

function isMultiSearch(
  val:
    | SearchParams<DocumentSchema, string>
    | MultiSearchRequestsSchema<DocumentSchema, string>,
): val is MultiSearchRequestsSchema<DocumentSchema, string> {
  return (
    (val as MultiSearchRequestsSchema<DocumentSchema, string>).searches !==
    undefined
  );
}
