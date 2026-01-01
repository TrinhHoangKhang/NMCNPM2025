import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthProvider";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);

    const connectSocket = () => {
        if (!user || socket) return;

        console.warn("Socket connection disabled by configuration.");
        return;

        // Ensure VITE_API_URL is parsed correctly to get host (remove /api)
        /*
        const socketUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';

        const newSocket = io(socketUrl, {
            auth: {
                token: user.token
            }
        });

        newSocket.on("connect", () => {
            console.log("Socket connected:", newSocket.id);
        });

        setSocket(newSocket);
        */
    };

    const disconnectSocket = () => {
        if (socket) {
            socket.disconnect();
            setSocket(null);
        }
    };

    // Cleanup on unmount (optional, but good practice)
    useEffect(() => {
        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, [socket]);

    return (
        <SocketContext.Provider value={{ socket, connectSocket, disconnectSocket }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    return useContext(SocketContext);
};
