import { useDebounce, useSearchParams } from '@/hooks';
import { WebMercatorViewport, type MapViewState } from '@deck.gl/core';
import { ArcLayer, GeoJsonLayer } from '@deck.gl/layers';
import { DeckGL } from '@deck.gl/react';
import { useColorScheme } from '@mui/material';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useCallback, useEffect, useState } from 'react';
import { Map } from 'react-map-gl/mapbox';

// docs example: https://github.com/visgl/deck.gl/blob/9.1-release/examples/get-started/react/mapbox/app.jsx

// lat, lng
// 36.24048, -86.928027
// 36.03086, -86.592944

// typesense geo adaptation: https://github.com/typesense/typesense-instantsearch-adapter/blob/e70765dffa4e28d22be443a234971f8858c001c3/src/SearchRequestAdapter.js#L320

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const MAP_LIGHT_STYLE = 'mapbox://styles/mapbox/light-v11';
const MAP_DARK_STYLE = 'mapbox://styles/mapbox/dark-v11';
// https://deck.gl/docs/api-reference/core/deck#initialviewstate
const INITIAL_VIEW_STATE: MapViewState = {
  // longitude: -122.41669,
  // latitude: 37.7853,
  latitude: 51.47,
  longitude: 0.45,
  zoom: 4,
  pitch: 30,
};
const AIR_PORTS =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_airports.geojson';

// function DeckGLOverlay(props: DeckProps) {
//   const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
//   overlay.setProps(props);
//   return null;
// }

interface GeoSearchProps {
  geoFieldName: string;
}

const GeoSearch = ({ geoFieldName }: GeoSearchProps) => {
  const { mode, systemMode } = useColorScheme();
  const themeMode = mode === 'system' ? systemMode : mode;
  const [_, updateParams] = useSearchParams();
  const [bounds, setBounds] = useState<[number, number, number, number] | null>(
    null
  );
  const debouncedBounds = useDebounce(bounds);

  const layers = [
    new GeoJsonLayer({
      id: 'airports',
      data: AIR_PORTS,
      // Styles
      filled: true,
      pointRadiusMinPixels: 2,
      pointRadiusScale: 2000,
      getPointRadius: (f) => 11 - f.properties.scalerank,
      getFillColor: [200, 0, 80, 180],
      // Interactive props
      pickable: true,
      autoHighlight: true,
      onClick: (info) =>
        // eslint-disable-next-line
        info.object &&
        alert(
          `${info.object.properties.name} (${info.object.properties.abbrev})`
        ),
      // @ts-ignore
      onDataLoad: (value, context) => console.log(value, context),
      // beforeId: 'waterway-label' // In interleaved mode render the layer under map labels
    }),
    new ArcLayer({
      id: 'arcs',
      data: AIR_PORTS,
      dataTransform: (d: any) =>
        d.features.filter((f: any) => f.properties.scalerank < 4),
      // Styles
      getSourcePosition: (f) => [-0.4531566, 51.4709959], // London
      getTargetPosition: (f) => f.geometry.coordinates,
      getSourceColor: [0, 128, 200],
      getTargetColor: [200, 0, 80],
      getWidth: 1,
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

  // REVERSED CONTROL IMPLEMENTATION
  return (
    <DeckGL
      initialViewState={INITIAL_VIEW_STATE}
      onViewStateChange={handleViewStateChange}
      controller
      layers={layers}
      style={{ position: 'relative' }}
    >
      <Map
        mapStyle={themeMode === 'dark' ? MAP_DARK_STYLE : MAP_LIGHT_STYLE}
        mapboxAccessToken={MAPBOX_TOKEN}
      />
    </DeckGL>
  );

  // return (
  //   <Map
  //     initialViewState={INITIAL_VIEW_STATE}
  //     mapStyle={MAP_STYLE}
  //     mapboxAccessToken={MAPBOX_TOKEN}
  //     // onViewStateChange={handleViewStateChange}
  //   >
  //     <DeckGLOverlay
  //       layers={layers}
  //       onViewStateChange={handleViewStateChange}
  //     />
  //   </Map>
  // );

  // return (
  //   <Map
  //     initialViewState={INITIAL_VIEW_STATE}
  //     mapStyle={MAP_STYLE}
  //     mapboxAccessToken={MAPBOX_TOKEN}
  //   >
  //     {selected && (
  //       <Popup
  //         key={selected.properties.name}
  //         anchor='bottom'
  //         style={{ zIndex: 10 }} /* position above deck.gl canvas */
  //         longitude={selected.geometry.coordinates[0]}
  //         latitude={selected.geometry.coordinates[1]}
  //       >
  //         {selected.properties.name} ({selected.properties.abbrev})
  //       </Popup>
  //     )}
  //     <DeckGLOverlay layers={layers} /* interleaved*/ />
  //     <NavigationControl position='top-left' />
  //   </Map>
  // );
};

export default GeoSearch;

function boundingBoxToPolygon(bb: string | string[] | number[]) {
  let x1, y1, x2, y2;
  if (Array.isArray(bb)) {
    [x1, y1, x2, y2] = bb.flat();
  } else {
    [x1, y1, x2, y2] = bb.split(',');
  }
  return `${x1}, ${y1}, ${x1}, ${y2}, ${x2}, ${y2}, ${x2}, ${y1}`;
}
