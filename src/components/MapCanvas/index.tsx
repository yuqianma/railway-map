import { useState, useEffect, useRef, useCallback } from 'react';
import { Map } from 'react-map-gl';
import { AmbientLight, PointLight, LightingEffect } from '@deck.gl/core/typed';
import DeckGL from '@deck.gl/react/typed';
import {TripsLayer} from '@deck.gl/geo-layers/typed';
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import './index.css';

const TimeRange = [ 1659216960000, 1659282420000 ];

const MapboxAccessToken = "pk.eyJ1IjoibWF5cTA0MjIiLCJhIjoiY2phamMwOHV4MjllajMzbnFyeTMwcmZvYiJ9.aFMw4Aws5zY9Y4NwYqFMlQ";

const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.0
});

const pointLight = new PointLight({
  color: [255, 255, 255],
  intensity: 2.0,
  position: [-74.05, 40.7, 8000]
});

const lightingEffect = new LightingEffect({ambientLight, pointLight});

const material = {
  ambient: 0.1,
  diffuse: 0.6,
  shininess: 32,
  specularColor: [60, 64, 70]
};

const DEFAULT_THEME = {
  buildingColor: [74, 80, 87],
  trailColor0: [253, 128, 93],
  trailColor1: [23, 184, 190],
  material,
  effects: [lightingEffect]
};

const INITIAL_VIEW_STATE = {
  longitude: 110.392,
  latitude: 32.067,
  zoom: 5,
  pitch: 60,
  bearing: 0
};

const INITIAL_VIEW_STATE2 = {
  longitude: 104.392,
  latitude: 36.067,
  zoom: 4,
  pitch: 0,
  bearing: 0
};

const MAP_STYLE = 'mapbox://styles/mapbox/dark-v10';

function filterLayers(map: mapboxgl.Map, worldview: string) {
  // The "admin-0-boundary-disputed" layer shows boundaries
  // at this level that are known to be disputed.
  map.setFilter('admin-0-boundary-disputed', [
  'all',
  ['==', ['get', 'disputed'], 'true'],
  ['==', ['get', 'admin_level'], 0],
  ['==', ['get', 'maritime'], 'false'],
  ['match', ['get', 'worldview'], ['all', worldview], true, false]
  ]);
  // The "admin-0-boundary" layer shows all boundaries at
  // this level that are not disputed.
  map.setFilter('admin-0-boundary', [
  'all',
  ['==', ['get', 'admin_level'], 0],
  ['==', ['get', 'disputed'], 'false'],
  ['==', ['get', 'maritime'], 'false'],
  ['match', ['get', 'worldview'], ['all', worldview], true, false]
  ]);
  // The "admin-0-boundary-bg" layer helps features in both
  // "admin-0-boundary" and "admin-0-boundary-disputed" stand
  // out visually.
  map.setFilter('admin-0-boundary-bg', [
  'all',
  ['==', ['get', 'admin_level'], 0],
  ['==', ['get', 'maritime'], 'false'],
  ['match', ['get', 'worldview'], ['all', worldview], true, false]
  ]);
}

export function MapCanvas({
  trailLength = 180,
  initialViewState = INITIAL_VIEW_STATE2,
  mapStyle = MAP_STYLE,
  theme = DEFAULT_THEME,
  loopLength = 1_000, // unit corresponds to the timestamp in source data
  animationSpeed = 100_000,
	currentTime = TimeRange[0],
}) {
  const [time, setTime] = useState(currentTime);
  const playing = useRef(true);
  const animation = useRef<number>(0);
  const mapRef = useRef<any>();

  const onMapLoad = useCallback(() => {
    const map = mapRef.current!.getMap() as mapboxgl.Map;
    filterLayers(map, "CN");
  }, []);
  
  const animate = () => {
    if (playing.current) {
      setTime(t => {
        const nextTime = t + animationSpeed;
        if (nextTime > TimeRange[1]) {
          return TimeRange[0];
        }
        return nextTime;
      });
    }
    animation.current = window.requestAnimationFrame(animate);
  };

  useEffect(
    () => {
      animation.current = window.requestAnimationFrame(animate);
      return () => window.cancelAnimationFrame(animation.current);
    },
    [animation]
  );

  const layers = [
    new TripsLayer({
      id: 'trips',
      data: "trips.json",
      getPath: d => d.waypoints.map((p: any) => p.coords),
      getTimestamps: d => d.waypoints.map((p: any) => p.timestamp),
      // getColor: d => (d.vendor === 0 ? theme.trailColor0 : theme.trailColor1),
      getColor: [0, 187, 221],
      opacity: 0.8,
      widthMinPixels: 2,
      rounded: true,
      fadeTrail: true,
      trailLength: 10_000_000,
      currentTime: time,

      shadowEnabled: false
    })
  ];

  return (
		<DeckGL
			layers={layers}
			effects={theme.effects}
			initialViewState={initialViewState}
			controller={true}
		>
			<Map reuseMaps ref={mapRef} onLoad={onMapLoad} mapStyle={mapStyle} mapboxAccessToken={MapboxAccessToken} />
		</DeckGL>
  );
}
