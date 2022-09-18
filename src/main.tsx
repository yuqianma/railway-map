import React, { ChildContextProvider, Context } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { rootStore, StoreContext } from "./useStore";
import './index.css';


ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <StoreContext.Provider value={rootStore}>
      <App />
    </StoreContext.Provider>
  </React.StrictMode>
);
