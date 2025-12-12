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

    useEffect(() => {
        if (user) {
            socket.auth = { token: localStorage.getItem(`userToken_${window.location.port}`) };
            socket.connect();

            const onConnect = () => setIsConnected(true);
            const onDisconnect = () => setIsConnected(false);

            socket.on('connect', onConnect);
            socket.on('disconnect', onDisconnect);

            return () => {
                socket.off('connect', onConnect);
                socket.off('disconnect', onDisconnect);
                socket.disconnect();
            };
        }
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
