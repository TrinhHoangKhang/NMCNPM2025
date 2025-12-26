
import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ToastProvider } from './context/ToastContext';
import router from './routes';

function App() {
    return (
        <AuthProvider>
            <SocketProvider>
                <ToastProvider>
                    <RouterProvider router={router} />
                </ToastProvider>
            </SocketProvider>
        </AuthProvider>
    );
}

export default App;
