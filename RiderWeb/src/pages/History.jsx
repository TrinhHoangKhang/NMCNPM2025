import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tripService } from "@/services/tripService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

export default function HistoryPage() {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ratingTrip, setRatingTrip] = useState(null);
    const [ratingValue, setRatingValue] = useState(5);
    const [ratingComment, setRatingComment] = useState("");

    const navigate = useNavigate();

    async function loadHistory() {
        try {
            const data = await tripService.getTripHistory();
            if (Array.isArray(data)) setTrips(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadHistory();
    }, []);

    const handleRateSubmit = async () => {
        if (!ratingTrip) return;
        try {
            await tripService.rateTrip(ratingTrip.id, ratingValue, ratingComment);
            // Success: Close dialog and refresh list
            setRatingTrip(null);
            setRatingValue(5);
            setRatingComment("");
            loadHistory();
        } catch (e) {
            alert("Failed to rate trip: " + e.message);
        }
    };

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin h-8 w-8 text-blue-500" /></div>;

    return (
        <div className="p-6 w-full max-w-4xl mx-auto space-y-4">
            <h1 className="text-2xl font-bold">Trip History</h1>
            {trips.length === 0 ? (
                <div className="text-center text-slate-500">No trips found.</div>
            ) : (
                <div className="grid gap-4">
                    {trips.map(trip => (
                        <Card
                            key={trip.id}
                            className="cursor-pointer hover:bg-slate-50 transition-colors"
                        >
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {new Date(trip.createdAt).toLocaleString()}
                                </CardTitle>
                                <div className="flex gap-2">
                                    <Badge variant={trip.status === 'COMPLETED' ? 'default' : 'secondary'}>{trip.status}</Badge>
                                    {trip.status === 'COMPLETED' && !trip.rating && (
                                        <Badge
                                            className="bg-yellow-500 hover:bg-yellow-600 cursor-pointer"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setRatingTrip(trip);
                                            }}
                                        >
                                            Rate
                                        </Badge>
                                    )}
                                    {trip.rating && <Badge variant="outline">★ {trip.rating}</Badge>}
                                </div>
                            </CardHeader>
                            <CardContent onClick={() => navigate(`/trip/${trip.id}`)}>
                                <p className="text-xs text-muted-foreground mb-2">ID: {trip.id}</p>
                                <div className="text-sm grid grid-cols-2 gap-2">
                                    <div><strong>From:</strong> {trip.pickupLocation?.address || "Unknown"}</div>
                                    <div><strong>To:</strong> {trip.dropoffLocation?.address || "Unknown"}</div>
                                    <div><strong>Vehicle:</strong> {trip.vehicleType}</div>
                                    <div><strong>Price:</strong> {trip.fare ? trip.fare.toLocaleString() : (trip.price || 0)} VND</div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Rating Dialog */}
            {ratingTrip && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white p-6 rounded-lg max-w-sm w-full space-y-4">
                        <h3 className="text-lg font-bold">Rate Driver: {ratingTrip.driverName || 'Driver'}</h3>
                        <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button
                                    key={star}
                                    onClick={() => setRatingValue(star)}
                                    className={`text-2xl ${ratingValue >= star ? 'text-yellow-500' : 'text-gray-300'}`}
                                >
                                    ★
                                </button>
                            ))}
                        </div>
                        <textarea
                            className="w-full border p-2 rounded"
                            placeholder="Optional comment..."
                            value={ratingComment}
                            onChange={(e) => setRatingComment(e.target.value)}
                        />
                        <div className="flex gap-2 justify-end">
                            <button
                                className="px-4 py-2 text-gray-600"
                                onClick={() => {
                                    setRatingTrip(null);
                                    setRatingValue(5);
                                    setRatingComment("");
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-blue-600 text-white rounded"
                                onClick={handleRateSubmit}
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
