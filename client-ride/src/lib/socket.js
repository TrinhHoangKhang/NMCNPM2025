import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

export const socket = io(SOCKET_URL, {
    autoConnect: false, // We connect manually when user is authenticated
    transports: ['websocket'],
});
