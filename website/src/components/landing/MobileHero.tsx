import { CheckIcon, GithubIcon, PlayIcon } from '#/components/icons';
import { DEMO_URL, REPO_URL } from '#/components/landing/links';
import { Box, Button, IconButton, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

// Mobile hero — ported from the "Mobile Hero Variants" design (Variant A:
// stacked + sticky CTA). Rendered only at MUI xs/sm; the desktop <Hero> takes
// over from md up (see routes/index.tsx). The design's phone bezel + status bar
// are mockup chrome and intentionally omitted here. Visual tokens come from the
// MUI theme (theme.vars.palette.design.*), which tracks the data-theme toggle.

const LockIcon = () => (
  <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2}>
    <rect x='3' y='11' width='18' height='11' rx='2' />
    <path d='M7 11V7a5 5 0 0 1 10 0v4' />
  </svg>
);

interface StatProps {
  k: string;
  value: ReactNode;
  sub: ReactNode;
}

const Stat = ({ k, value, sub }: StatProps) => (
  <Box
    sx={(theme) => ({
      border: `1px solid ${theme.vars.palette.design.border}`,
      borderRadius: '11px',
      background: theme.vars.palette.design.bg,
      // padding: '11px 12px', // { sx: '8px 9px', sm: '11px 12px' },
      px: { xs: '8px', sm: '11px' },
      py: { xs: '9px', sm: '12px' },
    })}
  >
    <Box
      sx={(theme) => ({
        fontSize: { xs: 8, sm: 9 },
        fontWeight: 700,
        letterSpacing: '.07em',
        textTransform: 'uppercase',
        color: theme.vars.palette.design.textFaint,
      })}
    >
      {k}
    </Box>
    <Box
      sx={{
        fontSize: { xs: 16, sm: 21 },
        fontWeight: 700,
        letterSpacing: '-0.02em',
        margin: { xs: '4px 0 2px', sm: '5px 0 3px' },
        '& small': (theme) => ({
          fontSize: { xs: 9, sm: 11 },
          color: theme.vars.palette.design.textFaint,
          fontWeight: 600,
        }),
      }}
    >
      {value}
    </Box>
    <Box
      sx={(theme) => ({
        fontSize: { xs: 8, sm: 10 },
        color: theme.vars.palette.design.textFaint,
        '& .up': { color: theme.vars.palette.design.success, fontWeight: 600 },
      })}
    >
      {sub}
    </Box>
  </Box>
);

// --- quick-action icons (mirrored from the desktop hero's cluster card) ---
const qaStroke = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};
const PlusIcon = () => (
  <svg {...qaStroke}>
    <line x1='12' y1='5' x2='12' y2='19' />
    <line x1='5' y1='12' x2='19' y2='12' />
  </svg>
);
const KeyIcon = () => (
  <svg {...qaStroke}>
    <circle cx='7.5' cy='15.5' r='4.5' />
    <path d='m10.7 12.3 8.3-8.3M16 5l3 3' />
  </svg>
);
const BackupIcon = () => (
  <svg {...qaStroke}>
    <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
    <polyline points='7 10 12 15 17 10' />
    <line x1='12' y1='15' x2='12' y2='3' />
  </svg>
);
const AliasIcon = () => (
  <svg {...qaStroke}>
    <polyline points='17 1 21 5 17 9' />
    <path d='M3 11V9a4 4 0 0 1 4-4h14' />
    <polyline points='7 23 3 19 7 15' />
    <path d='M21 13v2a4 4 0 0 1-4 4H3' />
  </svg>
);

const TOP_SEARCHES: Array<{ rk: number; q: string; w: string; ct: string }> = [
  { rk: 1, q: 'vanderbilt', w: '100%', ct: '1,284' },
  { rk: 2, q: 'east nashville', w: '77%', ct: '982' },
  { rk: 3, q: 'downtown loft', w: '58%', ct: '740' },
  // { rk: 4, q: 'belmont 2br', w: '43%', ct: '553' },
  // { rk: 5, q: 'pet friendly', w: '33%', ct: '421' },
];

const CLUSTER_ROWS: Array<{
  label: string;
  w: string;
  amt: string;
  warn?: boolean;
}> = [
  { label: 'Memory', w: '41%', amt: '3.11 / 7.65 GB' },
  { label: 'Disk', w: '88%', amt: '405 / 460 GB', warn: true },
  { label: 'CPU', w: '8%', amt: '1.0% · 11 cores' },
];

// const QUICK_ACTIONS: Array<{ label: string; icon: ReactNode }> = [
//   { label: 'New collection', icon: <PlusIcon /> },
//   { label: 'API key', icon: <KeyIcon /> },
//   { label: 'Backup', icon: <BackupIcon /> },
//   { label: 'Create alias', icon: <AliasIcon /> },
// ];

// Thin progress bar shared by both panels.
const Bar = ({ w, warn }: { w: string; warn?: boolean }) => (
  <Box
    sx={(theme) => ({
      height: 6,
      borderRadius: '4px',
      background: theme.vars.palette.design.surface2,
      overflow: 'hidden',
    })}
  >
    <Box
      sx={(theme) => ({
        height: '100%',
        width: w,
        borderRadius: '4px',
        background: warn
          ? theme.vars.palette.design.warning
          : `linear-gradient(90deg, ${theme.vars.palette.design.accent}, ${theme.vars.palette.design.accentHover})`,
      })}
    />
  </Box>
);

// Shared card shell for the two dashboard panels.
const Panel = ({ children }: { children: ReactNode }) => (
  <Box
    sx={(theme) => ({
      border: `1px solid ${theme.vars.palette.design.border}`,
      borderRadius: '12px',
      background: theme.vars.palette.design.surface,
      padding: '14px 15px',
    })}
  >
    {children}
  </Box>
);

const PanelHead = ({ title, right }: { title: string; right: ReactNode }) => (
  <Stack
    direction='row'
    sx={{
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '4px',
    }}
  >
    <Box component='h4' sx={{ fontSize: 14, fontWeight: 600, margin: 0 }}>
      {title}
    </Box>
    {right}
  </Stack>
);

const TopSearchesPanel = () => (
  <Panel>
    <PanelHead
      title='Top searches'
      right={
        <Stack
          direction='row'
          sx={(theme) => ({
            gap: '2px',
            border: `1px solid ${theme.vars.palette.design.border}`,
            borderRadius: '8px',
            padding: '2px',
            '& b': {
              fontSize: { xs: 9, sm: 11 },
              fontWeight: 600,
              color: theme.vars.palette.design.textFaint,
              padding: '3px 8px',
              px: { xs: '6px', sm: '8px' },
              py: { xs: '2px', sm: '3px' },
              borderRadius: '6px',
            },
            '& b.on': {
              background: theme.vars.palette.design.accentSoft,
              color: theme.vars.palette.design.accent,
            },
          })}
        >
          <b>1h</b>
          <b>6h</b>
          <b className='on'>24h</b>
          <b>7d</b>
        </Stack>
      }
    />
    <Box
      sx={(theme) => ({
        fontSize: 11,
        color: theme.vars.palette.design.textFaint,
        marginBottom: '6px',
      })}
    >
      last 24 hours · 14,208 queries
    </Box>
    <Box
      sx={(theme) => ({
        marginTop: '6px',
        '& .row': {
          display: 'grid',
          gridTemplateColumns: {
            xs: '14px minmax(0,1fr) 40px 34px',
            sm: '16px minmax(0,1fr) 48px 40px',
          },
          alignItems: 'center',
          gap: { xs: '7px', sm: '10px' }, // '10px',
          padding: { xs: '5px 0', sm: '7px 0' },
        },
        '& .row + .row': {
          borderTop: `1px solid ${theme.vars.palette.design.border}`,
        },
        '& .rk': {
          fontFamily: 'var(--mono)',
          fontSize: { xs: 8, sm: 10 }, // 11,
          color: theme.vars.palette.design.textSubtle,
          textAlign: 'center',
        },
        '& .q': {
          fontSize: { xs: 9, sm: 12 }, // 12.5,
          fontWeight: 500,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        },
        '& .q em': {
          fontStyle: 'normal',
          fontSize: { xs: 7, sm: 9 }, // 9.5,
          fontWeight: 700,
          letterSpacing: '0.03em',
          textTransform: 'uppercase',
          color: theme.vars.palette.design.warning,
          background: theme.vars.palette.design.warningSoft,
          padding: '1px 6px',
          borderRadius: '999px',
          marginLeft: '6px',
        },
        '& .ct': {
          fontFamily: 'var(--mono)',
          fontSize: { xs: 8.5, sm: 11 }, // 11.5,
          fontWeight: 600,
          color: theme.vars.palette.design.text,
          textAlign: 'right',
        },
      })}
    >
      {TOP_SEARCHES.map((r) => (
        <Box
          className='row'
          key={r.rk}
          // sx={{ display: { xs: i < 2 ? 'grid' : 'none', sm: 'grid' } }}
        >
          <span className='rk'>{r.rk}</span>
          <span className='q'>{r.q}</span>
          <Bar w={r.w} />
          <span className='ct'>{r.ct}</span>
        </Box>
      ))}
      <Box className='row'>
        <span className='rk'>6</span>
        <span className='q'>
          pool + parking <em>no results</em>
        </span>
        <Bar w='25%' warn />
        <span className='ct'>318</span>
      </Box>
    </Box>
  </Panel>
);

const ClusterStatusPanel = () => (
  <Panel>
    <PanelHead
      title='Cluster status'
      right={
        <Box
          component='span'
          sx={(theme) => ({
            fontSize: { xs: 9, sm: 10 },
            fontWeight: 700,
            color: theme.vars.palette.design.success,
            background: theme.vars.palette.design.successSoft,
            border: `1px solid ${theme.vars.palette.design.successBorder}`,
            padding: '2px 8px',
            borderRadius: '999px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            '& i': {
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: theme.vars.palette.design.success,
            },
          })}
        >
          <i /> Healthy
        </Box>
      }
    />
    {CLUSTER_ROWS.map((row) => (
      <Box
        key={row.label}
        sx={(theme) => ({
          display: 'grid',
          gridTemplateColumns: '52px 1fr auto',
          alignItems: 'center',
          gap: '10px',
          marginTop: '12px',
          fontSize: { xs: 11, sm: 12 },
          '& > span:first-of-type': {
            color: theme.vars.palette.design.textMuted,
          },
          '& .amt': {
            fontFamily: 'var(--mono)',
            fontSize: { xs: 10, sm: 11 },
            color: theme.vars.palette.design.textMuted,
            whiteSpace: 'nowrap',
          },
        })}
      >
        <span>{row.label}</span>
        <Bar w={row.w} warn={row.warn} />
        <span className='amt'>{row.amt}</span>
      </Box>
    ))}
    {/* <Box
      sx={(theme) => ({
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px',
        marginTop: '12px',
        '& b': {
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: 11.5,
          fontWeight: 600,
          padding: '9px 10px',
          border: `1px solid ${theme.vars.palette.design.border}`,
          borderRadius: '9px',
          color: theme.vars.palette.design.textMuted,
        },
        '& b svg': {
          width: 14,
          height: 14,
          color: theme.vars.palette.design.accent,
        },
      })}
    >
      {QUICK_ACTIONS.map((a) => (
        <b key={a.label}>
          {a.icon} {a.label}
        </b>
      ))}
    </Box> */}
  </Panel>
);

export const MobileHero = () => {
  return (
    <Box
      sx={(theme) => ({
        display: { xs: 'block', md: 'none' },
        position: 'relative',
        // Glow wash across the top, mirroring the design's device-screen::before.
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 360,
          zIndex: 0,
          pointerEvents: 'none',
          background: 'var(--glow)',
        },
        // Faint masked grid behind the hero, mirroring device-screen::after.
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 360,
          zIndex: 0,
          pointerEvents: 'none',
          backgroundImage:
            'linear-gradient(var(--hero-grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--hero-grid-line) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
          WebkitMaskImage:
            'radial-gradient(70% 70% at 50% 0%, #000, transparent 78%)',
          maskImage:
            'radial-gradient(70% 70% at 50% 0%, #000, transparent 78%)',
        },
        color: theme.vars.palette.design.text,
      })}
    >
      {/* ---------- hero copy ---------- */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          padding: '30px 24px 0',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box
          component='span'
          sx={(theme) => ({
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: theme.vars.palette.design.accent,
            '&::before': {
              content: '""',
              width: 16,
              height: '1px',
              background: theme.vars.palette.design.accent,
              opacity: 0.6,
            },
          })}
        >
          Open source · MIT
        </Box>

        <Typography
          component='h1'
          sx={{
            fontSize: 33,
            lineHeight: 1.08,
            letterSpacing: '-0.025em',
            fontWeight: 800,
            marginTop: '16px',
          }}
        >
          The dashboard your{' '}
          <Box
            component='span'
            sx={(theme) => ({
              background: `linear-gradient(120deg, ${theme.vars.palette.design.accentHover}, ${theme.vars.palette.design.accent} 60%, ${theme.vars.palette.design.accentDeep})`,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            })}
          >
            Typesense cluster
          </Box>{' '}
          deserves
        </Typography>

        <Typography
          sx={(theme) => ({
            marginTop: '14px',
            fontSize: 15,
            lineHeight: 1.55,
            color: theme.vars.palette.design.textMuted,
            maxWidth: 320,
          })}
        >
          A fast, polished UI for self-hosted Typesense — 100% client-side, keys
          never leave your browser.
        </Typography>

        <Stack
          direction='row'
          sx={(theme) => ({
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '7px 14px',
            marginTop: '18px',
            fontSize: 12,
            color: theme.vars.palette.design.textFaint,
            '& > span': {
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            },
            '& svg': {
              width: 13,
              height: 13,
              color: theme.vars.palette.design.success,
            },
          })}
        >
          <span>
            <CheckIcon /> v29 &amp; v30
          </span>
          <span>
            <CheckIcon /> No telemetry
          </span>
          <span>
            <CheckIcon /> 1-command deploy
          </span>
        </Stack>
      </Box>

      {/* ---------- dashboard peek (browser window) ---------- */}
      <Box
        sx={(theme) => ({
          position: 'relative',
          zIndex: 2,
          margin: '24px 18px 0',
          borderRadius: '18px 18px 0 0',
          border: `1px solid ${theme.vars.palette.design.border}`,
          borderBottom: 0,
          background: theme.vars.palette.design.surface,
          boxShadow: '0 30px 70px -30px rgba(0,0,0,0.7)',
          overflow: 'hidden',
        })}
      >
        {/* window bar */}
        <Stack
          direction='row'
          sx={(theme) => ({
            alignItems: 'center',
            gap: '7px',
            height: 38,
            padding: '0 14px',
            borderBottom: `1px solid ${theme.vars.palette.design.border}`,
            background: theme.vars.palette.design.surface2,
          })}
        >
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              sx={(theme) => ({
                width: 9,
                height: 9,
                borderRadius: '50%',
                background: theme.vars.palette.design.borderStrong,
              })}
            />
          ))}
          <Stack
            direction='row'
            sx={(theme) => ({
              alignItems: 'center',
              marginLeft: '8px',
              flex: 1,
              height: 22,
              borderRadius: '6px',
              border: `1px solid ${theme.vars.palette.design.border}`,
              background: theme.vars.palette.design.bg,
              gap: '6px',
              padding: '0 9px',
              fontFamily: 'var(--mono)',
              fontSize: 10,
              color: theme.vars.palette.design.textFaint,
              '& svg': {
                width: 12,
                height: 12,
                flex: 'none',
                color: theme.vars.palette.design.success,
              },
            })}
          >
            <LockIcon /> localhost:5173
          </Stack>
        </Stack>

        {/* window body */}
        <Box sx={{ padding: '16px' }}>
          <Box
            sx={(theme) => ({
              fontFamily: 'var(--mono)',
              fontSize: { xs: 9, sm: 10 },
              color: theme.vars.palette.design.textFaint,
            })}
          >
            NODE-1 · v30.2
          </Box>
          <Typography
            component='h3'
            sx={{
              fontSize: { xs: 18, sm: 19 },
              letterSpacing: '-0.02em',
              margin: '4px 0 3px',
              fontWeight: 700,
            }}
          >
            Cluster overview
          </Typography>
          <Box
            sx={(theme) => ({
              fontSize: { xs: 10, sm: 11.5 },
              color: theme.vars.palette.design.textMuted,
            })}
          >
            Healthy · 2 collections · 6,638 docs
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr 1fr', // { xs: '1fr 1fr 1fr 1fr', sm: '1fr 1fr' },
              gap: '9px',
              marginTop: '13px',
            }}
          >
            <Stat
              k='Search QPS'
              value='81.8'
              sub={
                <>
                  <span className='up'>+8.4%</span> req/s
                </>
              }
            />
            <Stat
              k='P95 latency'
              value={
                <>
                  6<small> ms</small>
                </>
              }
              sub={<span className='up'>−1.2ms</span>}
            />
            <Stat
              k='Documents'
              value='6,638'
              sub={
                <>
                  <span className='up'>+12.4k</span> wk
                </>
              }
            />
            <Stat
              k='Memory'
              value={
                <>
                  <small>GB </small>3.11
                </>
              }
              sub='41% of 7.65'
            />
          </Box>

          {/* Top searches + cluster status: row on sm, stacked on xs. */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: '10px',
              marginTop: '12px',
              alignItems: 'start',
            }}
          >
            <TopSearchesPanel />
            <ClusterStatusPanel />
          </Box>
        </Box>
      </Box>

      {/* ---------- sticky bottom CTA (pinned to the viewport on mobile) ---------- */}
      <Stack
        direction='row'
        sx={(theme) => ({
          alignItems: 'center',
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          zIndex: theme.zIndex.appBar,
          gap: '10px',
          padding: '13px 18px calc(13px + env(safe-area-inset-bottom, 0px))',
          background: `color-mix(in srgb, ${theme.vars.palette.design.bg} 88%, transparent)`,
          backdropFilter: 'blur(14px) saturate(1.2)',
          borderTop: `1px solid ${theme.vars.palette.design.border}`,
        })}
      >
        <Button
          variant='contained'
          href={DEMO_URL}
          target='_blank'
          rel='noopener'
          startIcon={<PlayIcon width={18} height={18} />}
          sx={(theme) => ({
            flex: 1,
            height: 48,
            borderRadius: 'var(--radius-sm)',
            fontSize: 15,
            color: theme.vars.palette.design.onAccent,
          })}
        >
          Try the live demo
        </Button>
        <IconButton
          variant='square'
          href={REPO_URL}
          target='_blank'
          rel='noopener'
          aria-label='GitHub'
          sx={{ width: 48, height: 48, borderRadius: 'var(--radius-sm)' }}
        >
          <GithubIcon width={20} height={20} />
        </IconButton>
      </Stack>
    </Box>
  );
};
