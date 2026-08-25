import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './styles.css';

import '@acetoprod/devlay-oss/devlay-embed.css';
import { DevLayCustomerShell } from '@acetoprod/devlay-oss';

if (typeof window !== 'undefined') { (window as unknown as Record<string, string>).__ACE_PLATFORM_WEB_URL__ = "https://acetoprod.com"; }
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
    <DevLayCustomerShell engineWsUrl={typeof window !== 'undefined' ? `ws://${window.location.hostname}:3002` : undefined} />
  </React.StrictMode>,
);
