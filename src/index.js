// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client'; // Импортируем новый API
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root')); // Создаем root
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
