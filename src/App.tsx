import { useState, useEffect, useRef, useCallback } from 'react';
import { MapCanvas, Timeline, InfoPane } from "./components";
import './App.css';

function App() {
  return (
    <>
      <div className="map-container">
        <MapCanvas />
        <InfoPane />
      </div>
      <Timeline />
    </>
  );
}

export default App
