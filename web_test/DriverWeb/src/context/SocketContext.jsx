import { createContext, useContext, useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthProvider";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const { user, logout } = useAuth();
    const [socket, setSocket] = useState(null);
    const socketRef = useRef(null);

    const connectSocket = () => {
        if (!user || socketRef.current) return;

        // Ensure VITE_API_URL is parsed correctly
        const socketUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';

        const newSocket = io(socketUrl, {
            auth: {
                token: user.token
            },
            transports: ['websocket'], // Force WebSocket to avoid polling issues
            reconnection: true,
            reconnectionAttempts: 5,
        });

        newSocket.on("connect", () => {
            console.log("Socket connected:", newSocket.id);
        });

        newSocket.on("connect_error", (err) => {
            console.error("Socket connection error:", err);
            // NEW: Handle expired token
            if (err.message === "Authentication error" || err.message.includes("jwt expired")) {
                console.warn("Token expired or invalid. Logging out.");
                logout();
                // Optionally redirect or show toast here if we had access to navigate/toast
                // But logout clears user, which triggers re-render of App -> Login
                if (socketRef.current) {
                    socketRef.current.disconnect();
                    socketRef.current = null;
                }
                setSocket(null);
            }
        });

        socketRef.current = newSocket;
        setSocket(newSocket);
    };

    const disconnectSocket = () => {
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
            setSocket(null);
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (socketRef.current) {
                console.log("Cleaning up socket");
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, connectSocket, disconnectSocket }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    return useContext(SocketContext);
};
