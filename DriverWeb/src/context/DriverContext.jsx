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

    // Initial Load
    useEffect(() => {
        loadData();
        // Default: Not Working (isOnline false by default)
        // We still connect socket for updates, but status in DB might be 'ONLINE' (Connected)
        // User must explicitly toggle "Working" to start session timer.
        connectSocket();
    }, []);

    // Countdown Logic
    useEffect(() => {
        let interval;
        if (isOnline && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        // Auto-offline when time runs out
                        toggleStatus();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else if (!isOnline) {
            setTimeLeft(0);
        }
        return () => clearInterval(interval);
    }, [isOnline, timeLeft]);

    const toggleStatus = async () => {
        const newStatus = isOnline ? 'OFFLINE' : 'ONLINE';
        try {
            // Server now handles DB status via socket, but we call API for explicit actions
            // or if we needed to pass extra params.
            // For now, let's keep the API call as a backup/explicit intent.
            await tripService.updateDriverStatus(newStatus);

            if (newStatus === 'ONLINE') {
                setIsOnline(true);
                // Socket stays connected
                // connectSocket(); 
                setTimeLeft(60); // 1 min session
                showToast("Success", "You are now Working", "success");
            } else {
                setIsOnline(false);
                // Do NOT disconnect socket - stay connected for updates
                // disconnectSocket(); 
                setTimeLeft(0);
                showToast("Paused", "You are now Not Working", "info");
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
