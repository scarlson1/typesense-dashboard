// Connected Surface 2 bar: owns search-mode state, detects the collection's
// embedding field + available NL models, applies the resulting Typesense
// params to InstantSearch, and renders the mode control + progressive
// controls + unavailable notices + the NL "Translated to" inspector.

import {
  EmbeddingUnavailableNotice,
  HybridAlphaControl,
  NlModelPicker,
  NlUnavailableNotice,
  SearchModeControl,
  SemanticThresholdControl,
  TranslatedToPanel,
} from '@/components/search/SearchModes';
import { nlSearchModelQueryKeys } from '@/constants';
import {
  useCollectionSchema,
  useSearch,
  useSearchParams,
  useTypesenseClient,
} from '@/hooks';
import { designTokens } from '@/theme/themePrimitives';
import { buildSearchModeParams, type SearchMode } from '@/utils';
import { Box, Stack, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';

export function SearchModesBar({ collectionId }: { collectionId: string }) {
  const [, updateParams] = useSearchParams();
  const { data: searchData, isFetching } = useSearch();
  const { data: schema, queryByOptions } = useCollectionSchema();
  const [client, clusterId] = useTypesenseClient();
  const navigate = useNavigate();

  // A `float[]` field with either an embed config or explicit dimensions.
  const embeddingField = useMemo(
    () =>
      schema?.fields?.find(
        (f) =>
          f.type === 'float[]' &&
          ((f as { embed?: unknown }).embed != null || f.num_dim != null),
      )?.name,
    [schema],
  );

  const { data: nlModels } = useQuery({
    queryKey: nlSearchModelQueryKeys.all(clusterId),
    queryFn: () => client.nlSearchModels().retrieve(),
    retry: false,
    staleTime: 60_000,
  });

  const [mode, setMode] = useState<SearchMode>('keyword');
  const [alpha, setAlpha] = useState(0.7);
  const [threshold, setThreshold] = useState(0.45);
  const [nlModel, setNlModel] = useState('');

  const nlModelIds = useMemo(() => (nlModels ?? []).map((m) => m.id), [nlModels]);
  const effectiveNlModel = nlModel || nlModelIds[0] || '';

  const disabled = useMemo<SearchMode[]>(() => {
    const d: SearchMode[] = [];
    if (!embeddingField) d.push('semantic', 'hybrid');
    if (!nlModelIds.length) d.push('nl');
    return d;
  }, [embeddingField, nlModelIds.length]);

  // Apply the mode's params to the live search whenever inputs change.
  const textKey = queryByOptions.join(',');
  useEffect(() => {
    updateParams(
      buildSearchModeParams({
        mode,
        textQueryBy: queryByOptions,
        embeddingField,
        alpha: mode === 'hybrid' ? alpha : undefined,
        distanceThreshold: mode === 'semantic' ? threshold : undefined,
        nlModelId: mode === 'nl' ? effectiveNlModel : undefined,
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, alpha, threshold, effectiveNlModel, embeddingField, textKey]);

  const nl = searchData?.parsed_nl_query;

  return (
    <Box sx={{ flexShrink: 0 }}>
      <Stack
        direction='row'
        sx={{ alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}
      >
        <Typography
          sx={{
            fontSize: 10.5,
            fontWeight: 700,
            color: designTokens.textFaint,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          Mode
        </Typography>
        <SearchModeControl mode={mode} onChange={setMode} disabled={disabled} />
        {mode === 'hybrid' && (
          <HybridAlphaControl value={alpha} onChange={setAlpha} />
        )}
        {mode === 'semantic' && (
          <SemanticThresholdControl value={threshold} onChange={setThreshold} />
        )}
        {mode === 'nl' && nlModelIds.length > 0 && (
          <NlModelPicker
            models={nlModelIds}
            value={effectiveNlModel}
            onChange={setNlModel}
          />
        )}
      </Stack>

      {!embeddingField ? (
        <EmbeddingUnavailableNotice
          collectionName={collectionId}
          onConfigure={() =>
            navigate({
              to: '/collections/$collectionId/config' as never,
              params: { collectionId } as never,
            })
          }
        />
      ) : !nlModelIds.length ? (
        <NlUnavailableNotice />
      ) : null}

      {mode === 'nl' && (isFetching || nl) && (
        <Box sx={{ mt: 1.5 }}>
          <TranslatedToPanel
            params={nl?.generated_params as Record<string, unknown> | undefined}
            loading={isFetching && !nl}
            modelName={effectiveNlModel}
            parseTimeMs={nl?.parse_time_ms}
          />
        </Box>
      )}
    </Box>
  );
}
