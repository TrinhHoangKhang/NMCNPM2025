import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthProvider";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (user) {
            // Connect to server
            // Ensure VITE_API_URL is parsed correctly to get host (remove /api)
            const socketUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

            const newSocket = io(socketUrl, {
                auth: {
                    token: user.token
                }
            });

            newSocket.on("connect", () => {
                console.log("Socket connected:", newSocket.id);
            });

            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
            };
        } else {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
        }
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    return useContext(SocketContext);
};
