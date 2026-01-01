import { useState, useEffect } from 'react';
import { tripService } from "@/services/tripService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

export default function HistoryPage() {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadHistory() {
            try {
                const data = await tripService.getDriverHistory();
                if (Array.isArray(data)) setTrips(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        loadHistory();
    }, []);

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin h-8 w-8 text-blue-500" /></div>;

    return (
        <div className="p-6 w-full max-w-4xl mx-auto space-y-4">
            <h1 className="text-2xl font-bold">My Trip History</h1>
            {trips.length === 0 ? (
                <div className="text-center text-slate-500">No completed trips found.</div>
            ) : (
                <div className="grid gap-4">
                    {trips.map(trip => (
                        <Card
                            key={trip.id}
                            className="cursor-pointer hover:bg-slate-50 transition-colors"
                            onClick={() => window.location.href = `/trip/${trip.id}`}
                        >
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {new Date(trip.createdAt).toLocaleString()}
                                </CardTitle>
                                <Badge variant={trip.status === 'COMPLETED' ? 'default' : 'secondary'}>{trip.status}</Badge>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-muted-foreground mb-2">ID: {trip.id}</p>
                                <div className="text-sm grid grid-cols-2 gap-2">
                                    <div><strong>Earnings:</strong> {trip.fare ? trip.fare.toLocaleString() : 0} VND</div>
                                    <div><strong>Vehicle:</strong> {trip.vehicleType}</div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
