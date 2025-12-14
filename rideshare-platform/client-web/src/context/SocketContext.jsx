import React, { createContext, useContext, useEffect, useState } from 'react';
import { socket } from '../lib/socket';
import { AuthContext } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [isConnected, setIsConnected] = useState(false);

    const connectSocket = () => {
        if (!user) return;
        if (socket.connected) return;

        socket.auth = { token: localStorage.getItem(`userToken_${window.location.port}`) };
        socket.connect();
    };

    const disconnectSocket = () => {
        if (socket.connected) {
            socket.disconnect();
        }
    };

    useEffect(() => {
        const onConnect = () => setIsConnected(true);
        const onDisconnect = () => setIsConnected(false);

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, isConnected, connectSocket, disconnectSocket }}>
            {children}
        </SocketContext.Provider>
    );
};
