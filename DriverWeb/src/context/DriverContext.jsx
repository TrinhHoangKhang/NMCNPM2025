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
    }, []);

    // Reload jobs when online status changes
    useEffect(() => {
        if (!currentTrip) {
            fetchAvailableJobs();
        }
    }, [isOnline]);

    // Countdown Logic
    useEffect(() => {
        let interval;
        if (isOnline && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isOnline) {
            setIsOnline(false);
            disconnectSocket(); // Ensure socket disconnects on timeout
            showToast("Info", "Online session expired. Please go online again.", "info");
        }
        return () => clearInterval(interval);
    }, [isOnline, timeLeft]);

    const toggleStatus = async () => {
        const newStatus = isOnline ? 'OFFLINE' : 'ONLINE';
        try {
            await tripService.updateDriverStatus(newStatus);

            if (newStatus === 'ONLINE') {
                setIsOnline(true);
                connectSocket(); // Connect when going online
                setTimeLeft(1 * 60); // 1 minute
                showToast("Success", "You are now ONLINE (1 min)", "success");
            } else {
                setIsOnline(false);
                disconnectSocket(); // Disconnect when going offline
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
