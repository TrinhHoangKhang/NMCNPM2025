import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

const originalWarn = console.warn;
console.warn = (...args) => {
    if (args[0] && typeof args[0] === 'string' && (args[0].includes('MouseEvent.mozPressure') || args[0].includes('MouseEvent.mozInputSource'))) {
        return;
    }
    originalWarn(...args);
};

// Set title based on instance type
const instanceType = import.meta.env.VITE_INSTANCE_TYPE || 'user';
const titleMap = {
    'user': 'App',
    'driver': 'Driver',
    'admin': 'Admin'
};
document.title = titleMap[instanceType] || 'RideShare';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
