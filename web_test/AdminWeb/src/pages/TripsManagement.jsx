
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Badge } from "@/components/ui/badge";
import { apiClient } from '../services/apiService';

const TripsManagement = () => {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTrips();
    }, []);

    const fetchTrips = async () => {
        try {
            const response = await apiClient('/trips');
            setTrips(response.data || []);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch trips", err);
            // Fallback specific for demo
            setTrips([
                { _id: 'trip_1', pickup: 'District 1', dropoff: 'District 2', status: 'COMPLETED', customer: 'Rider A', driver: 'Driver B', price: 50000 },
                { _id: 'trip_2', pickup: 'District 3', dropoff: 'District 1', status: 'IN_PROGRESS', customer: 'Rider C', driver: 'Driver D', price: 30000 }
            ]);
            setLoading(false);
        }
    };

    if (loading) return <div>Loading trips...</div>;

    return (
        <div className="w-full p-6 space-y-6">
            <h1 className="text-2xl font-bold">Ride History</h1>
            <div className="border rounded-md bg-white shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-3">Trip ID</th>
                            <th className="px-6 py-3">Locations</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Rider/Driver</th>
                            <th className="px-6 py-3">Trip Info</th>
                        </tr>
                    </thead>
                    <tbody>
                        {trips.map((trip, index) => (
                            <tr key={trip.id || trip._id || index} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-mono">{(trip.id || trip._id || '').substring(0, 8)}...</td>
                                <td className="px-6 py-4">
                                    <div className="text-blue-600">From: {trip.pickup?.address || trip.pickupLocation?.address || trip.pickup || 'N/A'}</div>
                                    <div className="text-orange-600">To: {trip.destination?.address || trip.dropoffLocation?.address || trip.destination || 'N/A'}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold 
                                        ${trip.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                            trip.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                                'bg-gray-100 text-gray-800'}`}>
                                        {trip.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm"><span className="font-semibold">R:</span> {trip.riderName || trip.customer || 'N/A'}</div>
                                    <div className="text-sm"><span className="font-semibold">D:</span> {trip.driverName || trip.driver || 'N/A'}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-bold text-green-600">{(trip.fare || trip.price || 0).toLocaleString()} VND</div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {(trip.distance / 1000).toFixed(1)} km • {Math.round((trip.duration || 0) / 60)} min
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TripsManagement;
