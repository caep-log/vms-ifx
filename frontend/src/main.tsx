import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './App.scss';
import App from './assets/app/app.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);