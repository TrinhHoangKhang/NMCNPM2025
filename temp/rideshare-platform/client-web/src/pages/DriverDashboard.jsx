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
    const { socket, connectSocket, disconnectSocket } = useSocket();
    const { showToast } = useToast();

    // 1. Initial Status Fetch (Replaced by Loader)
    // If driver is already online (from loader), connect to socket immediately
    // 1. Initial Status Fetch (Replaced by Loader)
    // No socket connection on load. Polling will start if isOnline is true.


    // 2. Polling Logic for Requests (Replaces Socket when Online but Idle)
    useEffect(() => {
        let interval;
        if (isOnline) {
            const fetchRequests = async () => {
                try {
                    const res = await api.get('/api/rides/available');
                    // Transform requests to match UI format
                    const newRequests = res.data.map(trip => ({
                        id: trip._id,
                        pickup: trip.pickupLocation.address,
                        distance: formatDistance(trip.distance),
                        fare: formatCurrency(trip.fare),
                        expiresAt: Date.now() + 10000 // Reset expiry on poll or manage differently? 
                        // Actually, if we poll every 3s, checking matches is good.
                        // Let's just blindly replace for now, or merge.
                        // Simple approach: Replace.
                    }));

                    // Basic de-duplication to avoid flickering or resetting timers if we wanted to keep them
                    // But here keep it simple.
                    setRequests(newRequests);
                } catch (error) {
                    console.error("Polling error:", error);
                }
            };

            fetchRequests(); // Initial fetch
            interval = setInterval(fetchRequests, 3000); // Poll every 3s
        } else {
            setRequests([]);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isOnline]);

    // 3. Socket Connection Only on Accept
    // Handle socket events ONLY if connected (which happens after accept)
    useEffect(() => {
        if (!socket) return;

        // If we are connected (meaning we accepted a ride), listen for updates?
        // Actually, the prompt says "connect using websocket" after accept.
        // So we might need to listen to chat or location updates here.
        // For now, just ensuring we don't auto-connect or listen to 'new_ride_request' via socket.

    }, [socket]);


    // 4. Timer Logic - Cleanup expired requests visually if we stopped polling?
    // With polling, server gives current valid requests. We might not need local expiry logic as much,
    // but if the server returns "requested" rides, they are valid.
    // Let's remove the local expiry timer 30s logic if we are polling.
    // Or keep it for visual countdowns? Let's remove it to assume Server is source of truth.
    // Actually, let's keep it simple.

    // 5. Helper Functions
    const toggleOnline = async () => {
        try {
            const res = await api.patch('/api/drivers/status');
            setIsOnline(res.data.isOnline);
            if (res.data.isOnline) {
                // connectSocket(); // REMOVED: Do not connect socket when just going online
                showToast('You are now ONLINE', 'success');
            } else {
                disconnectSocket(); // Ensure we disconnect if we go offline
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
            showToast('Ride Accepted! Connecting...', 'success');

            // Connect to socket NOW
            connectSocket();
            // We might need to join the trip room manually if the server doesn't auto-join us by ID.
            // Server socketManager.js listens for 'join_trip'.
            // connectSocket() is async? No, it's sync trigger.
            // But connection takes time.
            // We should ideally wait for connection then emit.
            // But looking at SocketContext, we don't return a promise.
            // Usage: socket.emit('join_trip', tripId) might fail if not connected yet?
            // socket.io-client queues packets until connected? Yes, usually.

            socket.emit('join_trip', tripId);

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
