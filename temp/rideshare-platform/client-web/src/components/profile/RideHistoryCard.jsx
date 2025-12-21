import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/axios';

const RideHistoryCard = () => {
    const [recentRides, setRecentRides] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                // Fetch recent 3
                const response = await api.get('/api/rides/history');
                if (response.data) {
                    setRecentRides(response.data.slice(0, 3));
                }
            } catch (error) {
                console.error("Failed to load history widget", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    if (loading) return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
                <div className="h-10 bg-gray-100 rounded"></div>
                <div className="h-10 bg-gray-100 rounded"></div>
            </div>
        </div>
    );

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
                <Link to="/history" className="text-sm text-indigo-600 hover:underline">View All</Link>
            </div>

            <div className="p-0">
                {recentRides.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                        {recentRides.map(ride => (
                            <div key={ride._id} className="p-4 hover:bg-gray-50 transition cursor-default">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-sm font-medium text-gray-900">
                                        {new Date(ride.createdAt).toLocaleDateString()}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded text-xs font-semibold
                                        ${ride.status === 'completed' ? 'bg-green-100 text-green-700' :
                                            ride.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'}`}>
                                        {ride.status}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-600 flex flex-col gap-1">
                                    <div className="truncate w-full" title={ride.pickupLocation?.address || ride.pickupLocation}>
                                        <span className="text-gray-400 mr-2">From:</span>
                                        {typeof ride.pickupLocation === 'string' ? ride.pickupLocation : (ride.pickupLocation?.address || 'Map Pin')}
                                    </div>
                                    <div className="truncate w-full" title={ride.dropoffLocation?.address || ride.dropoffLocation}>
                                        <span className="text-gray-400 mr-2">To:</span>
                                        {typeof ride.dropoffLocation === 'string' ? ride.dropoffLocation : (ride.dropoffLocation?.address || 'Map Pin')}
                                    </div>
                                </div>
                                <div className="mt-2 text-right">
                                    <span className="text-sm font-bold text-gray-900">${ride.fare?.toFixed(2)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center text-gray-500">
                        <p>No recent rides found.</p>
                        <Link to="/" className="text-indigo-600 text-sm mt-2 inline-block hover:underline">Book a ride</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RideHistoryCard;
