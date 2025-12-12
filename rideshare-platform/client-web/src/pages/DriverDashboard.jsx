import React, { useState, useEffect } from 'react';
import { useLoaderData } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import api from '../lib/axios';
import DashboardLayout from '../components/layout/DashboardLayout';
import DriverStats from '../components/driver/DriverStats';
import DriverRequestList from '../components/driver/DriverRequestList';
import DriverStatusToggle from '../components/driver/DriverStatusToggle';
import DriverProfileMissing from '../components/driver/DriverProfileMissing';
import { formatCurrency, formatDistance } from '../utils/formatters';
import { formatLocation } from '../utils/helpers'

const DriverDashboard = () => {
    const loaderData = useLoaderData();

    // Initialize state from loader data
    const [isOnline, setIsOnline] = useState(loaderData?.isOnline || false);
    const [driverId, setDriverId] = useState(loaderData?.driverId || null);
    const [isProfileMissing, setIsProfileMissing] = useState(loaderData?.profileMissing || false);

    const [requests, setRequests] = useState([]);
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'requests'
    const { socket } = useSocket();
    const { showToast } = useToast();

    // 1. Initial Status Fetch (Replaced by Loader)
    // useEffect logic removed


    // 2. Socket Logic
    useEffect(() => {
        if (!socket) return;

        if (isOnline) {
            socket.emit('join_drivers_room');
            if (driverId) {
                socket.emit('join_specific_driver_room', driverId);
            }

            const handleNewRequest = (data) => {
                console.log("New Ride Request:", data);
                // Play sound or vibrate here
                setRequests(prev => {
                    if (prev.find(r => r.id === data.tripId)) return prev;
                    showToast('New ride request received!', 'info');
                    return [...prev, {
                        id: data.tripId,
                        // Use formatLocation helper if available, or just rely on correct data
                        pickup: data.pickupLocation?.address || 'Unknown Location', // Keeping simple as data object might vary slightly from stored trips
                        distance: formatDistance(data.distance),
                        fare: formatCurrency(data.fare),
                        expiresAt: Date.now() + 10000
                    }];
                });
            };

            socket.on('new_ride_request', handleNewRequest);

            return () => {
                socket.off('new_ride_request', handleNewRequest);
            };
        } else {
            socket.emit('leave_drivers_room');
            setRequests([]); // Clear requests when going offline
        }
    }, [socket, isOnline, showToast, driverId]);

    // 3. Timer Logic
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            setRequests(prev => prev.filter(req => req.expiresAt > now));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // 4. Helper Functions
    const toggleOnline = async () => {
        try {
            const res = await api.patch('/api/drivers/status');
            setIsOnline(res.data.isOnline);
            if (res.data.isOnline) {
                showToast('You are now ONLINE', 'success');
            } else {
                showToast('You are now OFFLINE', 'info');
            }
        } catch (error) {
            console.error("Failed to toggle status", error);
            if (error.response?.status === 404) {
                setIsProfileMissing(true);
                showToast('Please complete your profile first.', 'warning');
            } else {
                showToast('Failed to update status', 'error');
            }
        }
    };

    const handleAccept = async (tripId) => {
        try {
            await api.post(`/api/rides/${tripId}/accept`);
            showToast('Ride Accepted! Redirecting to setup...', 'success');
            setRequests(prev => prev.filter(req => req.id !== tripId));
        } catch (error) {
            console.error("Accept Failed", error);
            showToast(error.response?.data?.message || 'Failed to accept ride.', 'error');
            setRequests(prev => prev.filter(req => req.id !== tripId));
        }
    };

    const handleDecline = (tripId) => setRequests(prev => prev.filter(req => req.id !== tripId));

    // 5. Conditional Rendering
    if (isProfileMissing) {
        return <DriverProfileMissing />;
    }

    // 6. Main Render
    return (
        <DashboardLayout role="driver" title="Driver Dashboard">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex-1"></div>
                    <DriverStatusToggle isOnline={isOnline} toggleOnline={toggleOnline} />
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 mb-6">
                    <button
                        className={`py-2 px-4 font-medium text-sm focus:outline-none ${activeTab === 'overview' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        Overview
                    </button>
                    <button
                        className={`py-2 px-4 font-medium text-sm focus:outline-none flex items-center gap-2 ${activeTab === 'requests' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('requests')}
                    >
                        Requests
                        {requests.length > 0 && isOnline && (
                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">{requests.length}</span>
                        )}
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <DriverStats isOnline={isOnline} />
                )}

                {activeTab === 'requests' && (
                    <DriverRequestList
                        requests={requests}
                        isOnline={isOnline}
                        toggleOnline={toggleOnline}
                        onAccept={handleAccept}
                        onDecline={handleDecline}
                    />
                )}
            </div>
        </DashboardLayout>
    );
};

export default DriverDashboard;
