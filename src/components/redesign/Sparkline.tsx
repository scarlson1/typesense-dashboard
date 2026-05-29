import { Box } from '@mui/material';
import { useMemo } from 'react';
import { designTokens } from '@/theme/themePrimitives';

interface SparklineProps {
  data?: number[];
  height?: number;
  color?: string;
  fill?: string;
}

const defaultPoints = [
  4, 7, 5, 9, 6, 8, 11, 9, 14, 12, 10, 13, 17, 15, 12, 18, 16, 20, 17, 19, 22,
  18, 21, 24, 20,
];

export const Sparkline = ({
  data = defaultPoints,
  height = 30,
  color = designTokens.accent,
  fill = designTokens.accentSoft,
}: SparklineProps) => {
  const { path, area } = useMemo(() => {
    const w = 100;
    const h = 28;
    const max = Math.max(...data);
    const p = data
      .map(
        (v, i) =>
          `${i === 0 ? 'M' : 'L'} ${(i / (data.length - 1)) * w} ${
            h - (v / max) * h
          }`,
      )
      .join(' ');
    return { path: p, area: `${p} L ${w} ${h} L 0 ${h} Z` };
  }, [data]);

  return (
    <Box
      component='svg'
      viewBox='0 0 100 28'
      preserveAspectRatio='none'
      sx={{ width: '100%', height, display: 'block', mb: 0.75 }}
    >
      <path d={area} fill={fill} />
      <path d={path} fill='none' stroke={color} strokeWidth='1.5' />
    </Box>
  );
};

interface BigChartProps {
  height?: number;
}

export const BigChart = ({ height = 180 }: BigChartProps) => {
  const { searchPath, searchArea, importPath, writePath } = useMemo(() => {
    const w = 100;
    const h = 35;
    const n = 50;
    const mk = (seed: number, amp: number, base: number) => {
      const pts: number[] = [];
      for (let i = 0; i < n; i++) {
        const v =
          base +
          Math.sin(i * seed) * amp +
          Math.cos(i * seed * 1.7) * amp * 0.6 +
          Math.sin(i * 0.7 + seed) * amp * 0.3;
        pts.push(Math.max(0, v));
      }
      return pts;
    };
    const search = mk(0.27, 35, 70);
    const imp = mk(0.42, 12, 18);
    const write = mk(0.19, 6, 8);
    const max = Math.max(...search, ...imp, ...write);
    const toPath = (pts: number[]) =>
      pts
        .map(
          (p, i) =>
            `${i === 0 ? 'M' : 'L'} ${(i / (pts.length - 1)) * w} ${
              h - (p / max) * h
            }`,
        )
        .join(' ');
    return {
      searchPath: toPath(search),
      searchArea: `${toPath(search)} L ${w} ${h} L 0 ${h} Z`,
      importPath: toPath(imp),
      writePath: toPath(write),
    };
  }, []);

  return (
    <Box
      component='svg'
      viewBox='0 0 100 35'
      preserveAspectRatio='none'
      sx={{ width: '100%', height, display: 'block' }}
    >
      <defs>
        <linearGradient id='bigchart-grad' x1='0' y1='0' x2='0' y2='1'>
          <stop
            offset='0%'
            stopColor={designTokens.accent}
            stopOpacity='0.18'
          />
          <stop
            offset='100%'
            stopColor={designTokens.accent}
            stopOpacity='0'
          />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map((g) => (
        <line
          key={g}
          x1='0'
          x2='100'
          y1={35 * g}
          y2={35 * g}
          stroke={designTokens.border}
          strokeWidth='0.15'
        />
      ))}
      <path d={searchArea} fill='url(#bigchart-grad)' />
      <path
        d={searchPath}
        fill='none'
        stroke={designTokens.accent}
        strokeWidth='0.6'
      />
      <path d={importPath} fill='none' stroke='#3aafe0' strokeWidth='0.5' />
      <path d={writePath} fill='none' stroke='#f6b500' strokeWidth='0.5' />
    </Box>
  );
};
