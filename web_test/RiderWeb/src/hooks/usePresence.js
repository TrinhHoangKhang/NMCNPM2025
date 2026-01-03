import { useEffect } from 'react';
import { useSocket } from '../context/SocketContext';

/**
 * usePresence Hook
 * Emits a 'heartbeat' event to the server every 30 seconds to maintain online status.
 * This prevents the user from appearing offline due to inactive socket connections (zombies).
 */
const usePresence = () => {
    const { socket } = useSocket();

    useEffect(() => {
        if (!socket) return;

        // Function to send heartbeat
        const sendHeartbeat = () => {
            if (socket.connected) {
                socket.emit('heartbeat');
                // console.debug('Heartbeat sent');
            }
        };

        // Send immediately on connection/mount
        sendHeartbeat();

        // Set interval to send heartbeat every 30 seconds
        const heartbeatInterval = setInterval(sendHeartbeat, 30000);

        // Cleanup on unmount or socket change
        return () => {
            clearInterval(heartbeatInterval);
        };
    }, [socket]);
};

export default usePresence;
