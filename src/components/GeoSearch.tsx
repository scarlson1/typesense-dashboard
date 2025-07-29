import { useDebounce, useHits, useSearchParams, useSearchSlots } from '@/hooks';
import {
  WebMercatorViewport,
  type MapViewState,
  type PickingInfo,
} from '@deck.gl/core';
import { IconLayer } from '@deck.gl/layers';
import { DeckGL } from '@deck.gl/react';
import { CloseRounded } from '@mui/icons-material';
import {
  Box,
  IconButton,
  Typography,
  useColorScheme,
  useTheme,
} from '@mui/material';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  Suspense,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { Map } from 'react-map-gl/mapbox';
import type { SearchResponseHit } from 'typesense/lib/Typesense/Documents';

// docs example: https://github.com/visgl/deck.gl/blob/9.1-release/examples/get-started/react/mapbox/app.jsx

// typesense geo adaptation: https://github.com/typesense/typesense-instantsearch-adapter/blob/e70765dffa4e28d22be443a234971f8858c001c3/src/SearchRequestAdapter.js#L320

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const MAP_LIGHT_STYLE = 'mapbox://styles/mapbox/light-v11';
const MAP_DARK_STYLE = 'mapbox://styles/s-carlson/cmdp028fi00b201qp3n382bo0'; // 'mapbox://styles/mapbox/dark-v11';
// https://deck.gl/docs/api-reference/core/deck#initialviewstate
const INITIAL_VIEW_STATE: MapViewState = {
  latitude: 37.5,
  longitude: -98.35,
  zoom: 4,
  pitch: 30,
};

interface GeoSearchProps {
  geoFieldName: string;
  // layers?: LayersList | undefined;
  // hoverInfo?: PickingInfo | null | undefined;
  renderTooltipContent?: (info: PickingInfo) => ReactNode;
}

const GeoSearch = ({
  geoFieldName,
  // hoverInfo,
  renderTooltipContent,
}: GeoSearchProps) => {
  const { mode, systemMode } = useColorScheme();
  const themeMode = mode === 'system' ? systemMode : mode;
  const hits = useHits();
  const [_, updateParams] = useSearchParams();

  const [hoverInfo, setHoverInfo] = useState<PickingInfo | null>(null);
  const [bounds, setBounds] = useState<[number, number, number, number] | null>(
    null
  );
  const debouncedBounds = useDebounce(bounds);

  const layers = [
    new IconLayer({
      id: 'IconLayer',
      // data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/bart-stations.json',
      data: hits?.hits || [],
      // getColor: (d) => [Math.sqrt(d.exits), 140, 0],
      getIcon: () => 'marker',
      getPosition: (d) => {
        let coords = d.document[geoFieldName] || [0, 0];
        return [coords[1], coords[0]];
      },
      getSize: 30,
      iconAtlas:
        'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png',
      iconMapping:
        'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.json',
      pickable: true,
      // onHover: (pickingInfo) => {
      //   setHoverInfo(pickingInfo || null);
      // },
      onClick: (pickInfo) => {
        console.log('onClick: ', pickInfo);
        setHoverInfo(pickInfo || null);
      },
    }),
  ];

  useEffect(() => {
    if (!debouncedBounds) return;
    let filterBounds = [
      debouncedBounds[1],
      debouncedBounds[0],
      debouncedBounds[3],
      debouncedBounds[2],
    ];

    // TODO: don't overwrite other filter_by params
    let polygonBounds = boundingBoxToPolygon(filterBounds);
    updateParams({ filter_by: `${geoFieldName}:(${polygonBounds})` });
  }, [debouncedBounds, updateParams]);

  const handleViewStateChange = useCallback(
    ({ viewState }: any) => {
      // console.log('NEW VIEW STATE: ', {viewState, interactionState, oldViewState });
      let { width, height, longitude, latitude, zoom, pitch, bearing } =
        viewState;
      let test = new WebMercatorViewport({
        width,
        height,
        longitude,
        latitude,
        zoom,
        pitch,
        bearing,
      });

      const newBounds = test.getBounds(); // [minX, minY, maxX, maxY] = minLng, minLat, maxLng, maxLat
      setBounds(newBounds);
    },
    [geoFieldName]
  );

  const handleCloseTooltip = () => {
    setHoverInfo(null);
  };

  const handleDeckClick = (info: PickingInfo) => {
    if (info.object) {
      setHoverInfo(info);
    } else {
      setHoverInfo(null);
    }
  };

  return (
    <>
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        onViewStateChange={handleViewStateChange}
        controller
        layers={layers}
        style={{ position: 'relative' }}
        onClick={handleDeckClick}
        // getTooltip={(info) => getTooltip(info, theme)}
      >
        <Map
          mapStyle={themeMode === 'dark' ? MAP_DARK_STYLE : MAP_LIGHT_STYLE}
          mapboxAccessToken={MAPBOX_TOKEN}
        />
      </DeckGL>
      <HoverInfo
        pickingInfo={hoverInfo}
        renderTooltipContent={renderTooltipContent}
        onClose={handleCloseTooltip}
      />
    </>
  );
};

export default GeoSearch;

// function getTooltip(info: PickingInfo<SearchResponseHit<any>>, theme: Theme) {
//   let doc = info?.object?.document;
//   if (!doc) return null;

//   return {
//     html: `<div><pre>${JSON.stringify(doc, null, 2)}</pre></div>`,
//     style: {
//       backgroundColor: theme.vars.palette.background.paper,
//       color: theme.vars.palette.text.secondary,
//       padding: '10px',
//       borderRadius: `${theme.shape.borderRadius}px`,
//       border: `1px solid ${theme.vars.palette.divider}`,
//       minWidth: '100px',
//       maxWidth: '360px',
//       maxHeight: '300px',
//       overflowY: 'auto',
//       fontSize: '0.775rem',
//       lineHeight: '1.2',
//     },
//   };
// }

function boundingBoxToPolygon(bb: string | string[] | number[]) {
  let x1, y1, x2, y2;
  if (Array.isArray(bb)) {
    [x1, y1, x2, y2] = bb.flat();
  } else {
    [x1, y1, x2, y2] = bb.split(',');
  }
  return `${x1}, ${y1}, ${x1}, ${y2}, ${x2}, ${y2}, ${x2}, ${y1}`;
}

interface HoverInfoProps {
  pickingInfo?: PickingInfo<SearchResponseHit<any>> | null | undefined;
  renderTooltipContent?: (info: PickingInfo) => ReactNode;
  onClose?: () => void;
  children?: ReactNode;
}

export function HoverInfo({
  pickingInfo,
  renderTooltipContent,
  onClose,
  children,
}: HoverInfoProps) {
  const theme = useTheme();
  const [slots, slotProps] = useSearchSlots();

  if (!(pickingInfo && pickingInfo.object)) return null;

  let closeButtonSx = slots?.hit ? { left: 6 } : { right: 6 };

  return (
    <Box
      sx={{
        position: 'absolute',
        zIndex: 100,
        left: pickingInfo.x,
        top: pickingInfo.y,
        backgroundColor: 'background.paper',
        p: slots?.hit ? 0 : 2,
        borderRadius: 1,
        border: slots?.hit ? `1px solid ${theme.vars.palette.divider}` : 'none',
      }}
      // onClick={console.log}
    >
      {onClose ? (
        <IconButton
          size='small'
          onClick={onClose}
          sx={{ position: 'absolute', top: 6, zIndex: 2000, ...closeButtonSx }}
        >
          <CloseRounded fontSize='inherit' />
        </IconButton>
      ) : null}
      {slots?.hit ? (
        <slots.hit
          {...slotProps?.hit}
          hit={pickingInfo.object}
          imgProps={slotProps?.hitImg || {}}
        >
          {slots?.hitActions ? (
            <Suspense>
              <slots.hitActions
                docData={pickingInfo.object.document}
                docId={pickingInfo.object.document.id}
                {...slotProps?.hitActions}
              />
            </Suspense>
          ) : null}
        </slots.hit>
      ) : (
        <Box sx={{ overflowX: 'auto', maxHeight: 360, maxWidth: 300 }}>
          <Typography
            variant='body2'
            component='div'
            sx={{ fontSize: `0.775rem` }}
          >
            {renderTooltipContent ? (
              renderTooltipContent(pickingInfo)
            ) : (
              <pre>{JSON.stringify(pickingInfo.object.document, null, 2)}</pre>
            )}
          </Typography>
        </Box>
      )}

      {children}
    </Box>
    // </Popup>
  );
}
