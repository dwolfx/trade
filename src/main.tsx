import React from 'react';
import ReactDOM from 'react-dom/client';
import { MarketProvider } from './context/MarketContext';
import { AppContent } from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MarketProvider>
      <AppContent />
    </MarketProvider>
  </React.StrictMode>
);
