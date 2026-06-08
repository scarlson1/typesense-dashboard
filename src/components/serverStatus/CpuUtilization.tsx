import { SectionCard } from '@/components/redesign';
import { useTypesenseClient } from '@/hooks';
import { designTokens } from '@/theme/themePrimitives';
import { formatBytes } from '@/utils';
import { Box, Stack, Tooltip, Typography } from '@mui/material';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

// "CPU utilization" card from the redesign — one vertical bar per core, filled
// proportionally to that core's `system_cpu{n}_active_percentage`, with the
// busiest core highlighted. Footer summarises avg / peak load and the system
// network throughput. Shares the `server/metrics` query with the other cards.

// Per-core keys look like `system_cpu1_active_percentage`; the bare
// `system_cpu_active_percentage` is the rolled-up average, which we exclude
// from the per-core bars and surface separately.
const CORE_KEY = /^system_cpu(\d+)_active_percentage$/;

export function CpuUtilization() {
  const [client, clientId] = useTypesenseClient();
  const { data } = useSuspenseQuery({
    queryKey: [clientId, 'server', 'metrics'],
    queryFn: () => client.metrics.retrieve(),
    staleTime: 1000 * 4,
    refetchInterval: 5000,
  });

  const { cores, avg, peak } = useMemo(() => {
    const parsed = Object.entries(data)
      .map(([key, val]) => {
        const match = key.match(CORE_KEY);
        return match
          ? { id: Number(match[1]), pct: Number(val) || 0 }
          : null;
      })
      .filter((c): c is { id: number; pct: number } => c !== null)
      .sort((a, b) => a.id - b.id);

    const peakValue = parsed.reduce((max, c) => Math.max(max, c.pct), 0);
    const avgValue = parsed.length
      ? parsed.reduce((sum, c) => sum + c.pct, 0) / parsed.length
      : 0;

    return { cores: parsed, avg: avgValue, peak: peakValue };
  }, [data]);

  const received = Number(data.system_network_received_bytes ?? 0);
  const sent = Number(data.system_network_sent_bytes ?? 0);

  return (
    <SectionCard
      title={`CPU utilization · ${cores.length} core${cores.length === 1 ? '' : 's'}`}
    >
      <Stack spacing={1.5}>
        <Stack
          direction='row'
          spacing={0.75}
          sx={{ alignItems: 'flex-end', minHeight: 88 }}
        >
          {cores.map(({ id, pct }) => (
            <CoreBar key={id} id={id} pct={pct} isPeak={pct === peak && pct > 0} />
          ))}
        </Stack>

        <Stack
          direction='row'
          spacing={2}
          sx={{
            alignItems: 'baseline',
            flexWrap: 'wrap',
            pt: 1.25,
            borderTop: `1px solid ${designTokens.border}`,
            fontFeatureSettings: '"tnum"',
          }}
        >
          <Summary label='Avg' value={`${avg.toFixed(1)}%`} />
          <Summary label='Peak' value={`${peak.toFixed(0)}%`} />
          <Box sx={{ flex: 1 }} />
          <Stack direction='row' spacing={0.5} sx={{ alignItems: 'baseline' }}>
            <Typography sx={{ fontSize: 11.5, color: designTokens.textMuted }}>
              Net
            </Typography>
            <Typography
              sx={{
                fontFamily: designTokens.fontMono,
                fontSize: 11.5,
                color: designTokens.text,
              }}
            >
              ↓{formatBytes(received)}
            </Typography>
            <Typography
              sx={{
                fontFamily: designTokens.fontMono,
                fontSize: 11.5,
                color: designTokens.text,
              }}
            >
              ↑{formatBytes(sent)}
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    </SectionCard>
  );
}

function CoreBar({
  id,
  pct,
  isPeak,
}: {
  id: number;
  pct: number;
  isPeak: boolean;
}) {
  const fill = Math.max(0, Math.min(100, pct));

  return (
    <Tooltip title={`Core ${id} · ${pct.toFixed(1)}%`} arrow placement='top'>
      <Stack spacing={0.75} sx={{ flex: 1, minWidth: 0, alignItems: 'center' }}>
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: 64,
            background: designTokens.surfaceMuted,
            borderRadius: '3px',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: `${fill}%`,
              background: isPeak
                ? designTokens.warning
                : designTokens.accent,
              borderRadius: '3px',
              transition: 'height 240ms ease',
            }}
          />
        </Box>
        <Typography
          sx={{
            fontFamily: designTokens.fontMono,
            fontSize: 10.5,
            color: designTokens.textMuted,
          }}
        >
          {id}
        </Typography>
      </Stack>
    </Tooltip>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction='row' spacing={0.5} sx={{ alignItems: 'baseline' }}>
      <Typography sx={{ fontSize: 11.5, color: designTokens.textMuted }}>
        {label}
      </Typography>
      <Typography
        sx={{
          fontFamily: designTokens.fontMono,
          fontSize: 11.5,
          fontWeight: 600,
          color: designTokens.text,
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
}
