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
        const initSocketConnection = async () => {
            if (user) {
                try {
                    const token = await user.getIdToken();
                    socket.auth = { token };
                    socket.io.opts.query = { role: user.role };

                    if (!socket.connected) {
                        socket.connect();
                    }
                } catch (error) {
                    console.error("Socket auth setup failed", error);
                }
            } else {
                if (socket.connected) {
                    socket.disconnect();
                }
            }
        };

        const onConnect = () => setIsConnected(true);
        const onDisconnect = () => setIsConnected(false);
        const onConnectError = (err) => {
            console.error("Socket connection error:", err.message);
        };

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('connect_error', onConnectError);

        initSocketConnection();

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('connect_error', onConnectError);
        };
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
