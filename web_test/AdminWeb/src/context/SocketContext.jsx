
import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthProvider'; // Adjust path if needed

const SocketContext = createContext(null);

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { user, token } = useAuth(); // Assuming AuthProvider gives user & token

    useEffect(() => {
        if (user && token && !socket) {
            // Replace with your actual Server URL
            const URL = 'http://localhost:3000';

            const newSocket = io(URL, {
                auth: { token: token },
                transports: ['websocket']
            });

            newSocket.on('connect', () => {
                console.log("Admin Socket Connected:", newSocket.id);
            });

            newSocket.on('disconnect', () => {
                console.log("Admin Socket Disconnected");
            });

            newSocket.on('connect_error', (err) => {
                console.error("Socket Connection Error:", err.message);
            });

            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
                setSocket(null);
            };
        }
    }, [user, token]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
