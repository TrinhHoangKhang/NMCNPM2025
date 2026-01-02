import { createContext, useContext, useEffect, useState } from "react";
import { tripService } from "@/services/tripService";
import { driverService } from "@/services/driverService";
import { useToast } from "@/hooks/useToast";
import { useSocket } from "./SocketContext";

const DriverContext = createContext();

export const DriverProvider = ({ children }) => {
    const { showToast } = useToast();
    const { connectSocket, disconnectSocket } = useSocket();
    const [trips, setTrips] = useState([]);
    const [currentTrip, setCurrentTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isOnline, setIsOnline] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);

    const fetchAvailableJobs = async () => {
        if (!isOnline) {
            setTrips([]);
            return;
        }
        try {
            const data = await tripService.getAvailableTrips();
            if (Array.isArray(data)) setTrips(data);
        } catch (e) {
            console.error(e);
        }
    };

    const loadData = async () => {
        setLoading(true);
        try {
            // 1. Check for Active Trip
            const active = await tripService.getCurrentTrip();
            if (active) {
                setCurrentTrip(active);
                setLoading(false);
            } else {
                // 2. If no active trip, load available jobs
                setCurrentTrip(null);
                fetchAvailableJobs();
                setLoading(false);
            }
        } catch (e) {
            console.error(e);
            setLoading(false);
        }
    };

    // Initial Load & Auto-Online
    useEffect(() => {
        loadData();
        // Auto-Online Logic
        setIsOnline(true);
        connectSocket();
        setTimeLeft(60 * 60); // 1 hour default session
        showToast("Info", "Going Online...", "info");
    }, []);

    // ... (keep useEffects for socket listeners)

    const toggleStatus = async () => {
        const newStatus = isOnline ? 'OFFLINE' : 'ONLINE';
        try {
            // Server now handles DB status via socket, but we call API for explicit actions
            // or if we needed to pass extra params.
            // For now, let's keep the API call as a backup/explicit intent.
            await tripService.updateDriverStatus(newStatus);

            if (newStatus === 'ONLINE') {
                setIsOnline(true);
                connectSocket();
                setTimeLeft(60 * 60);
                showToast("Success", "You are now ONLINE", "success");
            } else {
                setIsOnline(false);
                disconnectSocket();
                setTimeLeft(0);
                showToast("Success", "You are now OFFLINE", "success");
            }
        } catch (e) {
            showToast("Error", e.message || "Failed to update status", "error");
        }
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <DriverContext.Provider value={{
            trips, setTrips,
            currentTrip, setCurrentTrip,
            loading, setLoading,
            isOnline, setIsOnline,
            timeLeft, setTimeLeft,
            toggleStatus,
            loadData,
            fetchAvailableJobs,
            formatTime
        }}>
            {children}
        </DriverContext.Provider>
    );
};

export const useDriver = () => {
    return useContext(DriverContext);
};
