import React, { useRef, useEffect } from 'react';
import { useMapEvents } from 'react-leaflet';
import { useSocket } from '../../context/SocketContext';
import api from '../../lib/axios';

const MapDriverUpdater = ({ setAvailableDrivers }) => {
    const debounceTimer = useRef(null);
    const { socket } = useSocket();

    const map = useMapEvents({
        moveend: () => {
            const center = map.getCenter();

            // Debounce Logic
            if (debounceTimer.current) clearTimeout(debounceTimer.current);

            debounceTimer.current = setTimeout(() => {
                fetchNearbyDrivers(center.lat, center.lng);
            }, 500); // 500ms debounce
        },
        // Load on initial mount too
        load: () => {
            const center = map.getCenter();
            fetchNearbyDrivers(center.lat, center.lng);
        }
    });

    const fetchNearbyDrivers = async (lat, lng) => {
        try {
            const res = await api.get('/api/drivers/nearby', {
                params: { lat, lng, radius: 10000 } // 10km radius
            });
            // Update available drivers, ensuring we handle the response format correctly
            // Assuming res.data is array of drivers
            setAvailableDrivers(res.data);
        } catch (error) {
            console.error("Failed to fetch drivers", error);
        }
    };

    // Socket Listener for Live Updates
    useEffect(() => {
        if (!socket) return;

        const handleDriverMoved = (data) => {
            // data: { driverId, lat, lng }
            setAvailableDrivers(prev => {
                // Check if driver exists
                const index = prev.findIndex(d => d.id === data.driverId);
                if (index !== -1) {
                    // Update existing
                    const updated = [...prev];
                    updated[index] = { ...updated[index], lat: data.lat, lng: data.lng };
                    return updated;
                } else {
                    // Optionally add new driver if within range (complex to calc dist here without center)
                    // For now, only update if they are already in the list (fetched by nearby)
                    return prev;
                }
            });
        };

        socket.on('driver_location_update', handleDriverMoved);

        return () => {
            socket.off('driver_location_update', handleDriverMoved);
        };
    }, [socket, setAvailableDrivers]);

    // Initial fetch effect when component mounts/map acts
    useEffect(() => {
        if (map) {
            const center = map.getCenter();
            fetchNearbyDrivers(center.lat, center.lng);
        }
    }, [map]);

    return null;
};

export default MapDriverUpdater;
