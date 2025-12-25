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
    const [vehicleType, setVehicleType] = useState('4 SEAT');
    const [paymentMethod, setPaymentMethod] = useState('CASH');

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

    const [estimate, setEstimate] = useState(null);

    // Get Estimate from Backend when route changes
    useEffect(() => {
        if (pickup && dropoff && route) {
            const fetchEstimate = async () => {
                try {
                    const res = await api.post('/api/fares/estimate', {
                        pickupLocation: {
                            lat: pickup.lat,
                            lng: pickup.lon,
                            address: pickup.displayName
                        },
                        dropoffLocation: {
                            lat: dropoff.lat,
                            lng: dropoff.lon,
                            address: dropoff.displayName
                        },
                        vehicleType: vehicleType
                    });
                    setEstimate(res.data);
                    if (res.data.nearbyDrivers) {
                        setAvailableDrivers(res.data.nearbyDrivers);
                    }
                } catch (err) {
                    console.error('Estimation failed:', err);
                }
            };
            fetchEstimate();
        } else {
            setEstimate(null);
        }
    }, [pickup, dropoff, route, vehicleType]);

    const handleRequestRide = async () => {
        if (!pickup || !dropoff || !estimate) {
            showToast('Please select pickup and dropoff locations.', 'warning');
            return;
        }

        // Ensure socket is connected before requesting
        connectSocket();

        try {
            await api.post('/api/rides/request', {
                pickupLocation: {
                    lat: pickup.lat,
                    lng: pickup.lon,
                    address: pickup.displayName
                },
                dropoffLocation: {
                    lat: dropoff.lat,
                    lng: dropoff.lon,
                    address: dropoff.displayName
                },
                vehicleType: vehicleType,
                paymentMethod: paymentMethod,
                fare_id: estimate?.fare_id
            });

            setIsSearching(true);
        } catch (error) {
            console.error('Request failed:', error);
            if (error.response) {
                showToast(error.response.data.error || error.response.data.message || 'Failed to request ride.', 'error');
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
                    estimate={estimate}
                    vehicleType={vehicleType}
                    setVehicleType={setVehicleType}
                    paymentMethod={paymentMethod}
                    setPaymentMethod={setPaymentMethod}
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
