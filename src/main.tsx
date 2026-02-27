import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { defineCustomElements } from '@ionic/pwa-elements/loader';

// Call the element loader after the platform has been bootstrapped
defineCustomElements(window);

console.log("Main.tsx: Iniciando render");
const container = document.getElementById('root');
if (!container) console.error("Main.tsx: No se encontró el elemento #root");
const root = createRoot(container!);
console.log("Main.tsx: Root creado, renderizando App");
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
