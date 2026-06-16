// Surface 2 — Search modes + Natural-language UI.
// Faithful MUI implementation of the design's segmented mode control, the
// progressive-disclosure controls (hybrid alpha, semantic distance, NL model),
// the "Translated to" inspector, the per-result vector_distance badge, and the
// "unavailable" notices. Presentational/controlled — the search route owns the
// state and wires these to InstantSearch params via buildSearchModeParams.

import { Badge, primaryButtonSx, smallButtonSx } from '@/components/redesign';
import { designTokens } from '@/theme/themePrimitives';
import type { SearchMode } from '@/utils';
import {
  AddRounded,
  AutoAwesomeRounded,
  CloseRounded,
  ContentCopyRounded,
  GrainRounded,
  SearchRounded,
  SettingsRounded,
  TuneRounded,
  WarningAmberRounded,
} from '@mui/icons-material';
import {
  Box,
  Button,
  IconButton,
  MenuItem,
  Slider,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useMediaQuery,
  type SvgIconProps,
  type Theme,
} from '@mui/material';
import type { ComponentType, ReactNode } from 'react';

const MODE_META: {
  id: SearchMode;
  label: string;
  Icon: ComponentType<SvgIconProps>;
}[] = [
  { id: 'keyword', label: 'Keyword', Icon: SearchRounded },
  { id: 'semantic', label: 'Semantic', Icon: GrainRounded },
  { id: 'hybrid', label: 'Hybrid', Icon: TuneRounded },
  { id: 'nl', label: 'Natural language', Icon: AutoAwesomeRounded },
];

// ── Segmented mode control ────────────────────────────────────────────────
export interface SearchModeControlProps {
  mode: SearchMode;
  onChange: (mode: SearchMode) => void;
  /** Modes that can't be used (e.g. no embedding field / no NL model). */
  disabled?: SearchMode[];
  /**
   * Fired when a user clicks/taps a disabled mode. Lets the parent reveal the
   * notice explaining why that mode is unavailable (instead of switching to it).
   */
  onDisabledClick?: (mode: SearchMode) => void;
}

export const SearchModeControl = ({
  mode,
  onChange,
  disabled = [],
  onDisabledClick,
}: SearchModeControlProps) => {
  const mobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  if (mobile) {
    return (
      <Box
        sx={{
          display: 'flex',
          gap: 0.75,
          overflowX: 'auto',
          py: 0.25,
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none',
        }}
      >
        {MODE_META.map(({ id, label, Icon }) => {
          const active = id === mode;
          const off = disabled.includes(id);
          return (
            <Box
              key={id}
              component='button'
              type='button'
              onClick={() => (off ? onDisabledClick?.(id) : onChange(id))}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.625,
                height: 30,
                px: 1.375,
                flexShrink: 0,
                borderRadius: '16px',
                fontFamily: 'inherit',
                fontSize: 12,
                fontWeight: active ? 600 : 500,
                cursor: 'pointer',
                color: off
                  ? designTokens.textSubtle
                  : active
                    ? designTokens.accent
                    : designTokens.textMuted,
                background: active
                  ? designTokens.accentSoft
                  : designTokens.surface,
                border: `1px solid ${active ? designTokens.accentBorder : designTokens.border}`,
                opacity: off ? 0.55 : 1,
                whiteSpace: 'nowrap',
              }}
            >
              <Icon
                sx={{
                  fontSize: 12,
                  color: off
                    ? designTokens.textSubtle
                    : active
                      ? designTokens.accent
                      : designTokens.textFaint,
                }}
              />
              {label}
              {off ? (
                <Box
                  component='span'
                  sx={{
                    fontSize: 8.5,
                    fontFamily: designTokens.fontMono,
                    color: designTokens.textSubtle,
                    border: `1px solid ${designTokens.border}`,
                    borderRadius: '3px',
                    px: 0.375,
                    lineHeight: '12px',
                  }}
                >
                  off
                </Box>
              ) : null}
            </Box>
          );
        })}
      </Box>
    );
  }
  return (
    <ToggleButtonGroup
      exclusive
      size='small'
      value={mode}
      onChange={(_, next: SearchMode | null) => {
        if (!next) return;
        if (disabled.includes(next)) onDisabledClick?.(next);
        else onChange(next);
      }}
      sx={{
        border: `1px solid ${designTokens.border}`,
        borderRadius: '8px',
        overflow: 'hidden',
        background: designTokens.surface,
        boxShadow: designTokens.shadowButton,
        '& .MuiToggleButtonGroup-grouped': {
          border: 'none',
          borderRadius: 0,
          height: 28,
          px: 1.625,
          textTransform: 'none',
          fontSize: 11,
          fontWeight: 500,
          color: designTokens.textMuted,
          gap: 0.75,
          borderLeft: `1px solid ${designTokens.border}`,
          '&:first-of-type': { borderLeft: 'none' },
          '&.Mui-selected': {
            fontWeight: 600,
            color: designTokens.accent,
            background: designTokens.accentSoft,
            '&:hover': { background: designTokens.accentSoft },
          },
          '&.Mui-disabled': { color: designTokens.textSubtle },
        },
      }}
    >
      {MODE_META.map(({ id, label, Icon }) => {
        const off = disabled.includes(id);
        return (
        // Kept clickable (not `disabled`) so tapping an off mode can reveal the
        // notice explaining why it's unavailable; the off styling is applied
        // manually since the native disabled state no longer drives it.
        <ToggleButton
          key={id}
          value={id}
          sx={off ? { color: `${designTokens.textSubtle} !important` } : undefined}
        >
          <Icon sx={{ fontSize: 14 }} />
          {label}
          {off ? (
            <Box
              component='span'
              sx={{
                ml: 0.25,
                fontSize: 8.5,
                fontFamily: designTokens.fontMono,
                color: designTokens.textSubtle,
                border: `1px solid ${designTokens.border}`,
                borderRadius: '3px',
                px: 0.375,
                lineHeight: '12px',
              }}
            >
              off
            </Box>
          ) : null}
        </ToggleButton>
        );
      })}
    </ToggleButtonGroup>
  );
};

// shared pill container for the inline controls
const controlShellSx = {
  display: 'flex',
  alignItems: 'center',
  gap: 1.25,
  px: 1.5,
  height: 32,
  border: `1px solid ${designTokens.border}`,
  borderRadius: '8px',
  background: designTokens.surface,
  // Full-width stacked controls on mobile; inline pills on desktop.
  width: { xs: '100%', md: 'auto' },
} as const;

// ── Hybrid alpha slider ───────────────────────────────────────────────────
export const HybridAlphaControl = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) => (
  <Box sx={controlShellSx}>
    <Typography
      sx={{ fontSize: 11, color: designTokens.textFaint, fontWeight: 500 }}
    >
      keyword
    </Typography>
    <Slider
      size='small'
      min={0}
      max={1}
      step={0.05}
      value={value}
      onChange={(_, v) => onChange(v as number)}
      sx={{
        width: { xs: 'auto', md: 150 },
        flex: { xs: 1, md: 'none' },
        color: designTokens.accent,
        py: 0,
      }}
    />
    <Typography
      sx={{ fontSize: 11, color: designTokens.accent, fontWeight: 500 }}
    >
      vector
    </Typography>
    <Box
      component='span'
      sx={{
        fontFamily: designTokens.fontMono,
        fontSize: 11,
        color: designTokens.text,
        background: designTokens.surfaceMuted,
        border: `1px solid ${designTokens.border}`,
        borderRadius: '5px',
        px: 0.875,
        py: 0.25,
        fontWeight: 500,
      }}
    >
      α {value.toFixed(2)}
    </Box>
  </Box>
);

// ── Semantic distance threshold ───────────────────────────────────────────
export const SemanticThresholdControl = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) => (
  <Box sx={controlShellSx}>
    <GrainRounded sx={{ fontSize: 14, color: designTokens.textFaint }} />
    <Typography
      sx={{ fontSize: 11, color: designTokens.textFaint, fontWeight: 500 }}
    >
      Max distance
    </Typography>
    <TextField
      size='small'
      type='number'
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      slotProps={{ htmlInput: { step: 0.05, min: 0, max: 2 } }}
      sx={{
        width: 72,
        '& .MuiOutlinedInput-root': {
          fontFamily: designTokens.fontMono,
          fontSize: 12,
          '& input': { py: '2px' },
        },
      }}
    />
  </Box>
);

// ── NL model picker ───────────────────────────────────────────────────────
export const NlModelPicker = ({
  models,
  value,
  onChange,
}: {
  models: string[];
  value: string;
  onChange: (value: string) => void;
}) => (
  <Box sx={{ ...controlShellSx, gap: 1 }}>
    <AutoAwesomeRounded sx={{ fontSize: 14, color: designTokens.textFaint }} />
    <Typography
      sx={{ fontSize: 11, color: designTokens.textFaint, fontWeight: 500 }}
    >
      NL model
    </Typography>
    <TextField
      select
      variant='standard'
      value={value}
      onChange={(e) => onChange(e.target.value)}
      slotProps={{ input: { disableUnderline: true } }}
      sx={{
        // Push the model + chevron to the right edge on mobile.
        ml: { xs: 'auto', md: 0 },
        '& .MuiSelect-select': {
          fontFamily: designTokens.fontMono,
          fontSize: 12,
          color: designTokens.text,
          fontWeight: 500,
          py: 0,
          pr: '20px !important',
        },
      }}
    >
      {models.map((m) => (
        <MenuItem key={m} value={m}>
          {m}
        </MenuItem>
      ))}
    </TextField>
  </Box>
);

// ── "Translated to" inspector (NL mode) ───────────────────────────────────
const codeValueColor = (v: unknown) =>
  typeof v === 'number' ? designTokens.codeNum : designTokens.codeStr;

const formatCodeValue = (v: unknown) =>
  typeof v === 'number' ? String(v) : JSON.stringify(v);

export interface TranslatedToPanelProps {
  /** Generated params from the response's `parsed_nl_query`. */
  params?: Record<string, unknown>;
  loading?: boolean;
  modelName?: string;
  parseTimeMs?: number;
  onCopy?: () => void;
  onEditRaw?: () => void;
}

export const TranslatedToPanel = ({
  params,
  loading = false,
  modelName,
  parseTimeMs,
  onCopy,
  onEditRaw,
}: TranslatedToPanelProps) => {
  const entries = Object.entries(params ?? {}).filter(
    ([, v]) => v !== undefined && v !== null && v !== '',
  );
  return (
    <Box
      sx={{
        background: designTokens.surface,
        border: `1px solid ${designTokens.border}`,
        borderRadius: '8px',
        overflow: 'hidden',
        mb: 1,
      }}
    >
      <Stack
        direction='row'
        sx={{
          alignItems: 'center',
          gap: 1.25,
          px: 2,
          py: 1,
          borderBottom: `1px solid ${designTokens.border}`,
        }}
      >
        <AutoAwesomeRounded sx={{ fontSize: 14, color: designTokens.accent }} />
        <Typography
          sx={{ fontSize: 12, fontWeight: 600, color: designTokens.text }}
        >
          Translated to
        </Typography>
        <Badge tone='indigo'>read-only</Badge>
        <Box sx={{ flex: 1 }} />
        {loading ? (
          <Typography sx={{ fontSize: 11, color: designTokens.accent }}>
            translating…
          </Typography>
        ) : parseTimeMs != null ? (
          <Typography
            sx={{
              fontSize: 11,
              color: designTokens.textFaint,
              fontFamily: designTokens.fontMono,
            }}
          >
            parsed in {parseTimeMs} ms
          </Typography>
        ) : null}
        <Tooltip title='Copy params'>
          <IconButton
            size='small'
            onClick={onCopy}
            sx={{
              width: 26,
              height: 26,
              border: `1px solid ${designTokens.border}`,
              borderRadius: '6px',
              color: designTokens.textFaint,
            }}
          >
            <ContentCopyRounded sx={{ fontSize: 13 }} />
          </IconButton>
        </Tooltip>
      </Stack>

      <Box sx={{ background: designTokens.codeSurface, px: 2, py: 1.5 }}>
        {loading ? (
          <Stack sx={{ gap: 1.125 }}>
            {[70, 95, 55].map((w) => (
              <Box
                key={w}
                sx={{
                  height: 10,
                  width: `${w}%`,
                  borderRadius: '4px',
                  background: designTokens.codeSurfaceMuted,
                }}
              />
            ))}
          </Stack>
        ) : entries.length === 0 ? (
          <Typography
            sx={{
              fontFamily: designTokens.fontMono,
              fontSize: 11,
              color: designTokens.codeFaint,
            }}
          >
            no parameters generated
          </Typography>
        ) : (
          entries.map(([k, v], i) => (
            <Box
              key={k}
              sx={{
                display: 'flex',
                py: '3px',
                borderBottom:
                  i === entries.length - 1
                    ? 'none'
                    : `1px solid ${designTokens.codeSurfaceMuted}`,
              }}
            >
              <Box
                component='span'
                sx={{
                  color: designTokens.codeKey,
                  fontFamily: designTokens.fontMono,
                  fontSize: 12,
                  width: 96,
                  flexShrink: 0,
                }}
              >
                {k}
              </Box>
              <Box
                component='span'
                sx={{
                  color: designTokens.codeFaint,
                  fontFamily: designTokens.fontMono,
                  fontSize: 12,
                  mr: 0.75,
                }}
              >
                :
              </Box>
              <Box
                component='span'
                sx={{
                  fontFamily: designTokens.fontMono,
                  fontSize: 12,
                  color: codeValueColor(v),
                  wordBreak: 'break-word',
                  lineHeight: 1.5,
                }}
              >
                {formatCodeValue(v)}
              </Box>
            </Box>
          ))
        )}
      </Box>

      <Stack
        direction='row'
        sx={{
          alignItems: 'center',
          gap: 1,
          px: 2,
          py: 1,
          background: designTokens.surfaceTinted,
          borderTop: `1px solid ${designTokens.border}`,
        }}
      >
        <Typography sx={{ fontSize: 11, color: designTokens.textFaint }}>
          Generated{modelName ? ' by ' : ''}
          {modelName ? (
            <Box
              component='span'
              sx={{
                fontFamily: designTokens.fontMono,
                color: designTokens.textMuted,
              }}
            >
              {modelName}
            </Box>
          ) : null}{' '}
          from your plain-English query
        </Typography>
        <Box sx={{ flex: 1 }} />
        {onEditRaw ? (
          <Button
            onClick={onEditRaw}
            sx={{
              minWidth: 0,
              p: 0,
              textTransform: 'none',
              color: designTokens.accent,
              fontSize: 11.5,
              fontWeight: 500,
            }}
          >
            Edit as raw params
          </Button>
        ) : null}
      </Stack>
    </Box>
  );
};

// ── Per-result vector_distance badge (semantic/hybrid) ─────────────────────
export const VectorDistanceBadge = ({ value }: { value: number | string }) => (
  <Box
    component='span'
    sx={{
      fontFamily: designTokens.fontMono,
      fontSize: 10,
      color: designTokens.textFaint,
      background: designTokens.surfaceMuted,
      border: `1px solid ${designTokens.border}`,
      borderRadius: '4px',
      px: 0.625,
      py: '1px',
    }}
  >
    vector_distance {typeof value === 'number' ? value.toFixed(3) : value}
  </Box>
);

// ── Inline "unavailable" notices ──────────────────────────────────────────
const NoticeShell = ({
  icon,
  tone,
  children,
  action,
  onDismiss,
}: {
  icon: ReactNode;
  tone: 'warning' | 'neutral';
  children: ReactNode;
  action?: ReactNode;
  onDismiss?: () => void;
}) => (
  <Stack
    direction='row'
    sx={{
      mt: 1.5,
      px: 1.625,
      py: 1.25,
      borderRadius: '8px',
      alignItems: 'flex-start',
      gap: 1.25,
      background:
        tone === 'warning'
          ? designTokens.warningSoft
          : designTokens.surfaceMuted,
      border: `1px solid ${tone === 'warning' ? designTokens.warningBorder : designTokens.border}`,
    }}
  >
    <Box sx={{ flexShrink: 0, display: 'flex', mt: '1px' }}>{icon}</Box>
    {/* Text and action share a wrapping row so that on a narrow panel the
        action drops below the text instead of overlapping it. */}
    <Stack
      direction='row'
      sx={{
        flex: 1,
        minWidth: 0,
        alignItems: 'center',
        flexWrap: 'wrap',
        rowGap: 1,
        columnGap: 1.25,
      }}
    >
      <Box
        sx={{
          flex: '1 1 auto',
          minWidth: 0,
          fontSize: 12.5,
          color: designTokens.textMuted,
          lineHeight: 1.4,
        }}
      >
        {children}
      </Box>
      {action ? <Box sx={{ flexShrink: 0 }}>{action}</Box> : null}
    </Stack>
    {onDismiss ? (
      <Tooltip title='Dismiss'>
        <IconButton
          size='small'
          onClick={onDismiss}
          aria-label='Dismiss'
          sx={{ flexShrink: 0, color: designTokens.textFaint, ml: 0.25 }}
        >
          <CloseRounded sx={{ fontSize: 15 }} />
        </IconButton>
      </Tooltip>
    ) : null}
  </Stack>
);

export const EmbeddingUnavailableNotice = ({
  collectionName,
  onConfigure,
  onDismiss,
}: {
  collectionName?: string;
  onConfigure?: () => void;
  onDismiss?: () => void;
}) => (
  <NoticeShell
    tone='warning'
    onDismiss={onDismiss}
    icon={
      <WarningAmberRounded sx={{ fontSize: 15, color: designTokens.warning }} />
    }
    action={
      <Button
        size='small'
        variant='outlined'
        startIcon={<SettingsRounded sx={{ fontSize: 13 }} />}
        onClick={onConfigure}
        sx={smallButtonSx}
      >
        Configure&nbsp;embeddings
      </Button>
    }
  >
    <Box
      component='strong'
      sx={{ color: designTokens.warningDeep, fontWeight: 600 }}
    >
      Semantic &amp; Hybrid need an embedding field.
    </Box>{' '}
    {collectionName ? (
      <Box component='span' sx={{ fontFamily: designTokens.fontMono }}>
        {collectionName}
      </Box>
    ) : (
      'This collection'
    )}{' '}
    has no{' '}
    <Box component='span' sx={{ fontFamily: designTokens.fontMono }}>
      float[]
    </Box>{' '}
    embedding field configured.
  </NoticeShell>
);

export const NlUnavailableNotice = ({
  onCreate,
  onDismiss,
}: {
  onCreate?: () => void;
  onDismiss?: () => void;
}) => (
  <NoticeShell
    tone='neutral'
    onDismiss={onDismiss}
    icon={
      <AutoAwesomeRounded
        sx={{ fontSize: 15, color: designTokens.textFaint }}
      />
    }
    action={
      <Button
        size='small'
        variant='contained'
        startIcon={<AddRounded sx={{ fontSize: 13 }} />}
        onClick={onCreate}
        sx={primaryButtonSx}
      >
        Create NL model
      </Button>
    }
  >
    <Box component='strong' sx={{ color: designTokens.text, fontWeight: 600 }}>
      Natural language needs an NL model.
    </Box>{' '}
    Configure one to translate plain-English queries into Typesense parameters.
  </NoticeShell>
);
