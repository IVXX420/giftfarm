import React from 'react';
import ReactDOM from 'react-dom/client';
import { WebAppProvider } from '@vkruglikov/react-telegram-web-app';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { HashRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// Манифест для TON Connect
const manifestUrl = 'https://ivxx420.github.io/Giftfarm/ton-connect-manifest.json';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <WebAppProvider>
        <TonConnectUIProvider manifestUrl={manifestUrl}>
          <App />
        </TonConnectUIProvider>
      </WebAppProvider>
    </HashRouter>
  </React.StrictMode>
); 