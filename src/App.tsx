import { useState, useEffect, useRef } from 'react';
import { Map } from 'react-map-gl';
import { AmbientLight, PointLight, LightingEffect } from '@deck.gl/core/typed';
import DeckGL from '@deck.gl/react/typed';
import {TripsLayer} from '@deck.gl/geo-layers/typed';
import './App.css';

const TimeRange = [ 1659216960000, 1659282420000 ];

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

function App({
  trailLength = 180,
  initialViewState = INITIAL_VIEW_STATE2,
  mapStyle = MAP_STYLE,
  theme = DEFAULT_THEME,
  loopLength = 1_000, // unit corresponds to the timestamp in source data
  animationSpeed = 100_000
}) {
  const [time, setTime] = useState(1659216960000);
  const animation = useRef<number>(0);
  
  const animate = () => {
    setTime(t => {
      const nextTime = t + animationSpeed;
      if (nextTime > TimeRange[1]) {
        return TimeRange[0];
      }
      return nextTime;
    });
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
    <>
      <DeckGL
        layers={layers}
        effects={theme.effects}
        initialViewState={initialViewState}
        controller={true}
      >
        <Map reuseMaps mapStyle={mapStyle} mapboxAccessToken={import.meta.env.VITE_MapboxAccessToken} />
      </DeckGL>

      <div className="time">{new Date(time).toLocaleString()}</div>
    </>
  );
}

export default App
