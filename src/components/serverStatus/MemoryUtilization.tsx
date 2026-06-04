import { Badge, SectionCard } from '@/components/redesign';
import { useTypesenseClient } from '@/hooks';
import { designTokens } from '@/theme/themePrimitives';
import { formatBytes } from '@/utils';
import { Box, Stack, Typography } from '@mui/material';
import { useSuspenseQuery } from '@tanstack/react-query';

// "Resource utilization" card from the redesign — system memory and disk used
// vs. total, each with a proportional fill bar and a used / free split.
// Sources the same `system_memory_*` / `system_disk_*` metrics shown in the
// top stat strip.
export function MemoryUtilization() {
  const [client, clientId] = useTypesenseClient();
  const { data } = useSuspenseQuery({
    queryKey: [clientId, 'server', 'metrics'],
    queryFn: () => client.metrics.retrieve(),
    staleTime: 1000 * 4,
    refetchInterval: 5000,
  });

  return (
    <SectionCard title='Resource utilization'>
      <Stack spacing={2}>
        <UtilizationSection
          label='Memory'
          used={Number(data.system_memory_used_bytes ?? 0)}
          total={Number(data.system_memory_total_bytes ?? 0)}
        />
        <UtilizationSection
          label='Disk'
          used={Number(data.system_disk_used_bytes ?? 0)}
          total={Number(data.system_disk_total_bytes ?? 0)}
        />
      </Stack>
      <Box>
        <Typography
          variant='overline'
          sx={{
            fontSize: 11.5,
            fontWeight: 600,
            color: designTokens.textFaint,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          System Network
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <Stack direction='row' spacing={0.5}>
            <Typography sx={{ fontSize: 11.5, color: designTokens.textMuted }}>
              Received:
            </Typography>
            <Typography
              sx={{
                fontFamily: designTokens.fontMono,
                fontSize: 11.5,
                color: designTokens.text,
              }}
            >
              {formatBytes(Number(data.system_network_received_bytes))}
            </Typography>
          </Stack>
          <Stack direction='row' spacing={0.5}>
            <Typography sx={{ fontSize: 11.5, color: designTokens.textMuted }}>
              Sent:
            </Typography>
            <Typography
              sx={{
                fontFamily: designTokens.fontMono,
                fontSize: 11.5,
                color: designTokens.text,
              }}
            >
              {formatBytes(Number(data.system_network_sent_bytes))}
            </Typography>
          </Stack>
        </Stack>
      </Box>
    </SectionCard>
  );
}

function UtilizationSection({
  label,
  used,
  total,
}: {
  label: string;
  used: number;
  total: number;
}) {
  const free = Math.max(0, total - used);
  const pct = total ? used / total : 0;

  return (
    <Box>
      <Stack direction='row' spacing={1} sx={{ alignItems: 'baseline', mb: 1 }}>
        <Typography
          sx={{
            fontSize: 11.5,
            fontWeight: 600,
            color: designTokens.textFaint,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {label}
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Typography
          sx={{
            fontSize: 18,
            fontWeight: 600,
            color: designTokens.text,
            fontFeatureSettings: '"tnum"',
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}
        >
          {formatBytes(used)}
        </Typography>
        <Typography sx={{ fontSize: 12.5, color: designTokens.textMuted }}>
          of {formatBytes(total)}
        </Typography>
        <Badge tone={pct >= 0.85 ? 'warn' : 'neutral'}>
          {(pct * 100).toFixed(1)}%
        </Badge>
      </Stack>

      <Box
        sx={{
          height: 8,
          background: designTokens.surfaceMuted,
          borderRadius: '4px',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            width: `${pct * 100}%`,
            height: '100%',
            background: designTokens.accent,
            borderRadius: '4px',
            transition: 'width 240ms ease',
          }}
        />
      </Box>

      <Stack
        direction='row'
        spacing={2}
        sx={{ mt: 1, fontFeatureSettings: '"tnum"' }}
      >
        <MemoryLegend
          color={designTokens.accent}
          label='Used'
          value={formatBytes(used)}
        />
        <MemoryLegend
          color={designTokens.surfaceMuted}
          label='Free'
          value={formatBytes(free)}
          outlined
        />
      </Stack>
    </Box>
  );
}

function MemoryLegend({
  color,
  label,
  value,
  outlined,
}: {
  color: string;
  label: string;
  value: string;
  outlined?: boolean;
}) {
  return (
    <Stack direction='row' spacing={0.75} sx={{ alignItems: 'center' }}>
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: '2px',
          background: color,
          border: outlined ? `1px solid ${designTokens.border}` : 'none',
          flexShrink: 0,
        }}
      />
      <Typography sx={{ fontSize: 11.5, color: designTokens.textMuted }}>
        {label}
      </Typography>
      <Typography
        sx={{
          fontFamily: designTokens.fontMono,
          fontSize: 11.5,
          color: designTokens.text,
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
}
