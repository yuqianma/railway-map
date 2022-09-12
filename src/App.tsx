import { useState, useEffect, useRef, useCallback } from 'react';
import { MapCanvas, Timeline } from "./components";
import './App.css';

function App() {
  return (
    <>
      <div className="map-container">
        <MapCanvas />
      </div>
      <Timeline />
    </>
  );
}

export default App
