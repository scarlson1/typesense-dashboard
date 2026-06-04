import { SectionCard } from '@/components/redesign';
import { useTypesenseClient } from '@/hooks';
import { designTokens } from '@/theme/themePrimitives';
import { formatBytes } from '@/utils';
import { Box, Stack, Typography } from '@mui/material';
import { useSuspenseQuery } from '@tanstack/react-query';
import type { MetricsResponse } from 'typesense/lib/Typesense/Metrics';
import { useMemo } from 'react';

// Maps Typesense's `typesense_memory_*_bytes` metrics to the "Memory breakdown"
// card from the redesign — one labelled bar per allocator segment, normalised
// against the largest segment so the bars read as relative proportions.
const BREAKDOWN_ROWS: { key: keyof MetricsResponse; label: string }[] = [
  { key: 'typesense_memory_active_bytes', label: 'Active' },
  { key: 'typesense_memory_allocated_bytes', label: 'Allocated' },
  { key: 'typesense_memory_mapped_bytes', label: 'Mapped' },
  { key: 'typesense_memory_resident_bytes', label: 'Resident' },
  { key: 'typesense_memory_metadata_bytes', label: 'Metadata' },
  { key: 'typesense_memory_retained_bytes', label: 'Retained' },
];

export function MemoryBreakdown() {
  const [client, clientId] = useTypesenseClient();
  const { data } = useSuspenseQuery({
    queryKey: [clientId, 'server', 'metrics'],
    queryFn: () => client.metrics.retrieve(),
    staleTime: 1000 * 4,
    refetchInterval: 5000,
  });

  const rows = useMemo(() => {
    const parsed = BREAKDOWN_ROWS.map(({ key, label }) => ({
      label,
      bytes: Number(data[key] ?? 0),
    })).filter((r) => Number.isFinite(r.bytes));
    const max = Math.max(1, ...parsed.map((r) => r.bytes));
    return parsed.map((r) => ({ ...r, pct: r.bytes / max }));
  }, [data]);

  return (
    <SectionCard title='Memory breakdown'>
      <Stack spacing={1} sx={{ fontFeatureSettings: '"tnum"' }}>
        {rows.map(({ label, bytes, pct }) => (
          <Stack
            key={label}
            direction='row'
            spacing={1.25}
            sx={{ alignItems: 'center' }}
          >
            <Typography
              sx={{
                flex: '0 0 80px',
                fontSize: 12,
                color: designTokens.textMuted,
              }}
            >
              {label}
            </Typography>
            <Box
              sx={{
                flex: 1,
                height: 5,
                minWidth: 0,
                background: designTokens.surfaceMuted,
                borderRadius: '2px',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  width: `${pct * 100}%`,
                  height: '100%',
                  background: designTokens.accent,
                  borderRadius: '2px',
                  transition: 'width 240ms ease',
                }}
              />
            </Box>
            <Typography
              sx={{
                flex: '0 0 72px',
                textAlign: 'right',
                fontFamily: designTokens.fontMono,
                fontSize: 11.5,
                color: designTokens.text,
              }}
            >
              {formatBytes(bytes)}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </SectionCard>
  );
}
