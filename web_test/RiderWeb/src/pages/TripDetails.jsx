import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tripService } from "@/services/tripService";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSocket } from "@/context";
import { useToast } from "@/hooks/useToast";

import MapComponent from "@/components/MapComponent";
import TripDriverCard from "@/components/trip/TripDriverCard";
import TripInfoCard from "@/components/trip/TripInfoCard";
import TripStatusBanner from "@/components/trip/TripStatusBanner";

export default function TripDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { socket } = useSocket();
    const { showToast } = useToast();
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [driverLocation, setDriverLocation] = useState(null);

    // Rating State
    const [ratingDriver, setRatingDriver] = useState(0);
    const [ratingTrip, setRatingTrip] = useState(0);
    const [comment, setComment] = useState("");
    const [isRatingSubmitting, setIsRatingSubmitting] = useState(false);

    // Driver Details (fetched separately if needed depending on trip object structure)
    const [driverDetails, setDriverDetails] = useState(null);

    const fetchTrip = async () => {
        try {
            const data = await tripService.getTrip(id);
            setTrip(data);
            if (data.ratingDriver) setRatingDriver(data.ratingDriver);
            if (data.ratingTrip) setRatingTrip(data.ratingTrip);
            if (data.ratingComment) setComment(data.ratingComment);
        } catch (error) {
            console.error(error);
            showToast("Error", "Failed to load trip details", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrip();

        if (socket) {
            socket.on('trip_updated', (updatedTrip) => {
                if (updatedTrip.id === id) {
                    setTrip(prev => ({ ...prev, ...updatedTrip }));
                }
            });
            socket.on('driver_location_updated', (location) => {
                setDriverLocation(location);
            });
        }

        return () => {
            if (socket) {
                socket.off('trip_updated');
                socket.off('driver_location_updated');
            }
        };
    }, [id, socket]);

    useEffect(() => {
        const fetchDriver = async () => {
            if (!trip?.driverId) return;
            try {
                // If trip doesn't have full driver details, fetch them
                const data = await tripService.getUserDetails(trip.driverId);
                if (data) {
                    setDriverDetails(data);
                }
            } catch (err) {
                console.error("Failed to fetch fresh driver data", err);
            }
        };
        fetchDriver();
    }, [trip?.driverId]);


    const handleRateTrip = async () => {
        if (ratingDriver === 0 || ratingTrip === 0) {
            showToast("Error", "Please rate both Driver and Trip", "error");
            return;
        }
        setIsRatingSubmitting(true);
        try {
            await tripService.rateTrip(trip.id, ratingDriver, ratingTrip, comment);
            showToast("Success", "Thank you for your feedback!", "success");
            setTrip(prev => ({
                ...prev,
                ratingDriver,
                ratingTrip,
                ratingComment: comment
            }));
        } catch (error) {
            console.error(error);
            showToast("Error", "Failed to submit rating", "error");
        } finally {
            setIsRatingSubmitting(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-500';
            case 'ACCEPTED': return 'bg-blue-500';
            case 'IN_PROGRESS': return 'bg-indigo-500';
            case 'COMPLETED': return 'bg-green-500';
            case 'CANCELLED': return 'bg-red-500';
            default: return 'bg-slate-500';
        }
    };

    if (loading) return <div className="p-4 text-center">Loading trip...</div>;
    if (!trip) return <div className="p-4 text-center">Trip not found</div>;

    return (
        <div className="min-h-screen bg-slate-100 p-4 pb-24 relative z-0">
            {/* Status / Action Banner (Completed/Cancelled/Rating) */}
            <div className="absolute top-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
                <div className="pointer-events-auto w-full max-w-sm">
                    <TripStatusBanner
                        trip={trip}
                        navigate={navigate}
                        ratingDriver={ratingDriver}
                        setRatingDriver={setRatingDriver}
                        ratingTrip={ratingTrip}
                        setRatingTrip={setRatingTrip}
                        comment={comment}
                        setComment={setComment}
                        handleRateTrip={handleRateTrip}
                        isRatingSubmitting={isRatingSubmitting}
                    />
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="max-w-4xl mx-auto space-y-4 pt-10">
                {/* MAP VIEW */}
                <Card className="overflow-hidden border-0 shadow-lg h-96">
                    <MapComponent
                        pickupLocation={trip.pickupLocation}
                        dropoffLocation={trip.dropoffLocation}
                        driverLocation={driverLocation}
                    />
                </Card>

                {/* Header / Status */}
                <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Trip #{trip.id ? trip.id.substring(0, 8) : '...'}</h1>
                        <p className="text-sm text-slate-500">{new Date(trip.createdAt).toLocaleString()}</p>
                    </div>
                    <Badge className={`${getStatusColor(trip.status)} text-white px-4 py-1`}>
                        {trip.status.replace('_', ' ')}
                    </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <TripDriverCard
                        trip={trip}
                        driverDetails={driverDetails}
                        navigate={navigate}
                    />
                    <TripInfoCard trip={trip} />
                </div>
            </div>
        </div>
    );
}
