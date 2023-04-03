import { MapCanvas, Timeline, InfoPane } from "./components";
import { observer } from "mobx-react-lite";
import { useStore } from "./useStore";
import './App.css';

const App = observer(() => {
  const store = useStore();
  return (
    <>
      <div className="map-container">
        <MapCanvas timeRange={store.timeRange} />
        {/* <InfoPane /> */}
      </div>
      <Timeline />
    </>
  );
});

export default App;
