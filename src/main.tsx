import React from 'react';
import ReactDOM from 'react-dom/client';
import { WebAppProvider } from '@vkruglikov/react-telegram-web-app';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import App from './App';
import './styles/index.css';
import { initTonConnect } from './config/ton';

// Инициализируем TON Connect
initTonConnect().catch(console.error);

const manifestUrl = 'https://giftfarm.vercel.app/tonconnect-manifest.json';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WebAppProvider>
      <TonConnectUIProvider manifestUrl={manifestUrl}>
        <App />
      </TonConnectUIProvider>
    </WebAppProvider>
  </React.StrictMode>
); 