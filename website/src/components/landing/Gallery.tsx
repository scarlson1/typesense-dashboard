import {
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useState } from 'react';
import { ShotImage } from './ShotImage';
import type { ShotName } from './shots.gen';
import { shots as shotAssets } from './shots.gen';

type Filter = 'all' | 'dark' | 'light' | 'mobile';

interface Shot {
  // size: 'wide' | 'tall' | 'half';
  cols: number;
  rows: number;
  cat: Exclude<Filter, 'all'>;
  title: string;
  tag: string;
  name: ShotName;
  delay?: string;
}

const shots: Shot[] = [
  {
    // size: 'wide',
    cat: 'dark',
    title: 'Cluster overview',
    tag: 'Dark',
    name: 'cluster-dark',
    cols: 2,
    rows: 1,
  },
  {
    // size: 'tall',
    cat: 'mobile',
    title: 'Geosearch',
    tag: 'Mobile',
    name: 'map-mobile-dark',
    delay: 'd1',
    cols: 1,
    rows: 2,
  },
  {
    // size: 'half',
    cat: 'dark',
    title: 'Schema editor',
    tag: 'Dark',
    name: 'schema-dark',
    delay: 'd1',
    cols: 1,
    rows: 1,
  },
  {
    // size: 'half',
    cat: 'light',
    title: 'API keys',
    tag: 'Light',
    name: 'keys-light',
    cols: 1,
    rows: 1,
  },
  {
    // size: 'tall',
    cat: 'mobile',
    title: 'Schema',
    tag: 'Mobile',
    name: 'schema-mobile-light',
    delay: 'd1',
    cols: 1,
    rows: 2,
  },
  {
    // size: 'wide',
    cat: 'light',
    title: 'Search & facets',
    tag: 'Light',
    name: 'search-light',
    cols: 2,
    rows: 1,
  },
  {
    // size: 'half',
    cat: 'light',
    title: 'Add documents',
    tag: 'Light',
    name: 'add-docs-light',
    delay: 'd1',
    cols: 1,
    rows: 1,
  },
  {
    // size: 'half',
    cat: 'dark',
    title: 'API keys',
    tag: 'Dark',
    name: 'keys-dark',
    cols: 1,
    rows: 1,
  },
];

const GAP = 16;
/** (1180px `.wrap` - 56px inline padding - 2 * 16px gap) / 3 columns. */
const DESKTOP_COL = 364;
const DESKTOP_ROW = 340;
const MOBILE_ROW = 200;

/**
 * Tiles crop with `object-fit: cover`, so the width the browser actually
 * paints is `max(boxWidth, boxHeight * sourceAspect)` — a short tile fed a
 * landscape screenshot renders up to ~30% wider than its own box. Handing
 * `sizes` the box width alone would pick a candidate that small and look soft.
 */
const tileSizes = ({ name, cols, rows }: Shot) => {
  const asset = shotAssets[name];
  const aspect = asset.width / asset.height;
  const cover = (rowHeight: number) =>
    Math.round((rows * rowHeight + (rows - 1) * GAP) * aspect);

  // < 900px: MUI switches the quilted grid to 2 columns with 200px rows.
  const mobileBox =
    cols >= 2 ? 'calc(100vw - 56px)' : 'calc((100vw - 72px) / 2)';
  // 900-1180px: 3 columns, `.wrap` still fluid.
  const midBox = `calc((100vw - 88px) / 3 * ${cols} + ${(cols - 1) * GAP}px)`;
  // >= 1180px: `.wrap` is capped, so the tile is a fixed width.
  const wideBox = cols * DESKTOP_COL + (cols - 1) * GAP;

  return (
    `(max-width: 899px) max(${mobileBox}, ${cover(MOBILE_ROW)}px),` +
    ` (max-width: 1179px) max(${midBox}, ${cover(DESKTOP_ROW)}px),` +
    ` ${Math.max(wideBox, cover(DESKTOP_ROW))}px`
  );
};

const tabs: Filter[] = ['all', 'dark', 'light', 'mobile'];
const tabLabel: Record<Filter, string> = {
  all: 'All',
  dark: 'Dark',
  light: 'Light',
  mobile: 'Mobile',
};

export const Gallery = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [filter, setFilter] = useState<Filter>('all');

  return (
    <section className='section-pad' id='gallery' style={{ paddingTop: 0 }}>
      <div className='wrap'>
        <div className='sec-head center reveal'>
          <span className='eyebrow'>A proper look</span>
          <h2>Designed for both light and dark</h2>
          <p className='lead'>
            Every screen, both themes. Here's the real dashboard, not a mock.
          </p>
        </div>
        <div className='gallery-tabs reveal'>
          {tabs.map((t) => (
            <button
              key={t}
              className={`gtab${filter === t ? ' on' : ''}`}
              onClick={() => setFilter(t)}
            >
              {tabLabel[t]}
            </button>
          ))}
        </div>
        <ImageList
          // variant='masonry'
          variant='quilted'
          rowHeight={isMobile ? 200 : 340}
          cols={isMobile ? 2 : 3}
          gap={16}
        >
          {shots.map((item, i) => {
            const hidden = filter !== 'all' && item.cat !== filter;
            return (
              <ImageListItem
                key={`${item.name}-${i}`}
                cols={item.cols}
                rows={item.rows}
                className={`gcard reveal${item.delay ? ` ${item.delay}` : ''}${hidden ? ' hidden' : ''}`}
                data-cat={item.cat}
                sx={{
                  display: hidden ? 'none' : 'block',
                  border: '1px solid var(--mui-palette-design-border)',
                  borderRadius: 2,
                  background: 'var(--mui-palette-design-surface)',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    border: '1px solid var(--mui-palette-design-borderStrong)',
                  },
                  // ImageListItem only tags a *direct* `img` child with the
                  // class carrying its cover styles, and ShotImage wraps the
                  // img in a <picture>. Restate them here (the descendant
                  // selector also outranks `.gcard img` in styles.css).
                  '& picture': { display: 'block', height: '100%' },
                  '& picture > img': {
                    display: 'block',
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  },
                }}
              >
                <ShotImage
                  name={item.name}
                  sizes={tileSizes(item)}
                  alt={`${item.title}, ${item.tag.toLowerCase()} theme`}
                />
                <ImageListItemBar
                  position='top'
                  title={
                    <Stack
                      direction='row'
                      spacing={2}
                      sx={{ justifyContent: 'space-between' }}
                    >
                      <Typography
                        color='textPrimary'
                        sx={{
                          fontWeight: 600,
                          fontSize: 12,
                        }}
                      >
                        {item.title}
                      </Typography>
                      <Typography
                        variant='body2'
                        color='textDisabled'
                        sx={{
                          fontSize: '0.625rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                        }}
                      >
                        {item.tag}
                      </Typography>
                    </Stack>
                  }
                  sx={{
                    backgroundColor: 'var(--mui-palette-design-surface2)',
                    borderBottom: '1px solid var(--mui-palette-design-border)',
                  }}
                />
              </ImageListItem>
            );
          })}
        </ImageList>
        {/* <div className='gallery'>
          {shots.map((s, i) => {
            const hidden = filter !== 'all' && s.cat !== filter;
            return (
              <div
                className={`gcard ${s.size} reveal${s.delay ? ` ${s.delay}` : ''}${hidden ? ' hidden' : ''}`}
                data-cat={s.cat}
                key={`${s.title}-${i}`}
              >
                <div className='gcap'>
                  <span className='ttl'>{s.title}</span>
                  <span className='tag'>{s.tag}</span>
                </div>
                <img
                  src={s.src}
                  alt={`${s.title}, ${s.tag.toLowerCase()} theme`}
                />
              </div>
            );
          })}
        </div> */}
      </div>
    </section>
  );
};
