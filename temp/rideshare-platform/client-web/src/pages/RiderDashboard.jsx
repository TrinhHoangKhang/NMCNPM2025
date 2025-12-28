import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import api from '../lib/axios';
import DashboardLayout from '../components/layout/DashboardLayout';
import RideBookingPanel from '../components/rider/RideBookingPanel';
import SearchingOverlay from '../components/rider/SearchingOverlay';
import RiderMap from '../components/rider/RiderMap';

const RiderDashboard = () => {
    const [pickup, setPickup] = useState(null);
    const [dropoff, setDropoff] = useState(null);
    const [route, setRoute] = useState(null);
    const [activeField, setActiveField] = useState(null);
    const [tempSelection, setTempSelection] = useState(null);
    const [isSearching, setIsSearching] = useState(false);

    // New Driver Tracking State
    const [availableDrivers, setAvailableDrivers] = useState([]);

    // NOTE: debounceTimer is now handled inside RiderMap/MapDriverUpdater if needed, 
    // or we can keep it here if we want to control it from top level, 
    // but the extracted component handles it.

    const { socket, connectSocket } = useSocket();
    const { showToast } = useToast();
    const navigate = useNavigate();

    // Listen for Ride Acceptance
    useEffect(() => {
        if (!socket) return;

        const handleRideAccepted = (data) => {
            console.log("Ride Accepted:", data);
            showToast(`Driver ${data.driver.name} accepted your ride!`, 'success', 5000);
            navigate('/history');
        };

        socket.on('ride_accepted', handleRideAccepted);

        return () => {
            socket.off('ride_accepted', handleRideAccepted);
        };
    }, [socket, navigate, showToast]);

    const confirmLocation = () => {
        if (!tempSelection || !activeField) return;

        if (activeField === 'pickup') {
            setPickup(tempSelection);
        } else {
            setDropoff(tempSelection);
        }
        setTempSelection(null);
    };

    const handleRequestRide = async () => {
        if (!pickup || !dropoff || !route) {
            showToast('Please select pickup and dropoff locations.', 'warning');
            return;
        }

        // Ensure socket is connected before requesting
        connectSocket();

        const distanceMeters = route.distance;
        const estimatedFare = (distanceMeters / 1000) * 1.5 + 5;

        try {
            await api.post('/api/rides/request', {
                pickupLocation: {
                    address: pickup.displayName,
                    coordinates: [pickup.lon, pickup.lat]
                },
                dropoffLocation: {
                    address: dropoff.displayName,
                    coordinates: [dropoff.lon, dropoff.lat]
                },
                vehicleType: 'standard',
                distance: distanceMeters,
                duration: route.duration,
                fare: estimatedFare
            });

            setIsSearching(true);
        } catch (error) {
            console.error('Request failed:', error);
            if (error.response) {
                showToast(error.response.data.message || 'Failed to request ride.', 'error');
            } else {
                showToast('Network error or server unreachable.', 'error');
            }
            setIsSearching(false);
        }
    };

    return (
        <DashboardLayout role="user" title="Book a Ride" fullWidth>
            <div className="flex h-full relative">

                {/* Searching Overlay */}
                {isSearching && (
                    <SearchingOverlay onCancel={() => setIsSearching(false)} />
                )}

                {/* Sidebar Controls */}
                <RideBookingPanel
                    activeField={activeField}
                    setActiveField={setActiveField}
                    pickup={pickup}
                    setPickup={setPickup}
                    dropoff={dropoff}
                    setDropoff={setDropoff}
                    route={route}
                    handleRequestRide={handleRequestRide}
                />

                {/* Map Area */}
                <RiderMap
                    activeField={activeField}
                    pickup={pickup}
                    dropoff={dropoff}
                    route={route}
                    setRoute={setRoute}
                    tempSelection={tempSelection}
                    setTempSelection={setTempSelection}
                    confirmLocation={confirmLocation}
                    availableDrivers={availableDrivers}
                    setAvailableDrivers={setAvailableDrivers}
                />
            </div>
        </DashboardLayout>
    );
};

export default RiderDashboard;
