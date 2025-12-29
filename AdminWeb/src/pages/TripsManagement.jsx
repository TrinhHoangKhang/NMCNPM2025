
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Badge } from "@/components/ui/badge";

const TripsManagement = () => {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTrips();
    }, []);

    const fetchTrips = async () => {
        try {
            const response = await axios.get('http://localhost:3002/api/trips');
            setTrips(response.data.data || []);
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
                            <th className="px-6 py-3">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {trips.map((trip) => (
                            <tr key={trip._id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-mono">{trip._id.substring(0, 8)}...</td>
                                <td className="px-6 py-4">
                                    <div className="text-blue-600">From: {trip.pickup?.address || trip.pickup}</div>
                                    <div className="text-orange-600">To: {trip.dropoff?.address || trip.dropoff}</div>
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
                                    <div>R: {trip.customer?.name || trip.customer}</div>
                                    <div>D: {trip.driver?.name || trip.driver}</div>
                                </td>
                                <td className="px-6 py-4 font-bold">
                                    {trip.price?.toLocaleString()} VND
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
