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

type Filter = 'all' | 'dark' | 'light' | 'mobile';

interface Shot {
  // size: 'wide' | 'tall' | 'half';
  cols: number;
  rows: number;
  cat: Exclude<Filter, 'all'>;
  title: string;
  tag: string;
  src: string;
  delay?: string;
}

const shots: Shot[] = [
  {
    // size: 'wide',
    cat: 'dark',
    title: 'Cluster overview',
    tag: 'Dark',
    src: '/assets/shots/cluster-dark.png',
    cols: 2,
    rows: 1,
  },
  {
    // size: 'tall',
    cat: 'mobile',
    title: 'Geosearch',
    tag: 'Mobile',
    src: '/assets/shots/map-mobile-dark.png',
    delay: 'd1',
    cols: 1,
    rows: 2,
  },
  {
    // size: 'half',
    cat: 'dark',
    title: 'Schema editor',
    tag: 'Dark',
    src: '/assets/shots/schema-dark.png',
    delay: 'd1',
    cols: 1,
    rows: 1,
  },
  {
    // size: 'half',
    cat: 'light',
    title: 'API keys',
    tag: 'Light',
    src: '/assets/shots/keys-light.png',
    cols: 1,
    rows: 1,
  },
  {
    // size: 'tall',
    cat: 'mobile',
    title: 'Schema',
    tag: 'Mobile',
    src: '/assets/shots/schema-mobile-light.png',
    delay: 'd1',
    cols: 1,
    rows: 2,
  },
  {
    // size: 'wide',
    cat: 'light',
    title: 'Search & facets',
    tag: 'Light',
    src: '/assets/shots/search-light.png',
    cols: 2,
    rows: 1,
  },
  {
    // size: 'half',
    cat: 'light',
    title: 'Add documents',
    tag: 'Light',
    src: '/assets/shots/add-docs-light.png',
    delay: 'd1',
    cols: 1,
    rows: 1,
  },
  {
    // size: 'half',
    cat: 'dark',
    title: 'API keys',
    tag: 'Dark',
    src: '/assets/shots/keys-dark.png',
    cols: 1,
    rows: 1,
  },
];

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
                key={`${item.src}-${i}`}
                cols={item.cols}
                rows={item.rows}
                sx={{
                  display: hidden ? 'hidden' : 'block',
                  border: '1px solid var(--mui-palette-design-border)',
                  borderRadius: 2,
                  background: 'var(--mui-palette-design-surface)',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    border: '1px solid var(--mui-palette-design-borderStrong)',
                  },
                }}
              >
                <img
                  srcSet={`${item.src}?w=248&fit=crop&auto=format&dpr=2 2x`}
                  src={`${item.src}?w=248&fit=crop&auto=format`}
                  alt={item.title}
                  loading='lazy'
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
