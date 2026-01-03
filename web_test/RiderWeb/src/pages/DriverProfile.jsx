
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Calendar, Clock, ArrowLeft, Shield, Car } from 'lucide-react';
import { tripService } from '@/services/tripService';
import { useToast } from '@/hooks/useToast';

export default function DriverProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            if (!id) return;
            setLoading(true);
            try {
                // Fetch real user data (Rider viewing Driver)
                const response = await tripService.getUserDetails(id);
                // Simplify: backend might return wrapped or direct
                const userData = response?.data || response;

                if (userData) {
                    setUser({
                        id: userData.uid,
                        name: userData.name || "Unknown Driver",
                        email: userData.email,
                        phone: userData.phone,
                        rating: userData.rating || 5.0,
                        totalTrips: userData.tripCount || userData.totalTrips || 0, // tripCount for drivers
                        joinDate: userData.createdAt || new Date().toISOString(),
                        tier: userData.rank || "driver",
                        vehicle: userData.vehicle, // If available
                        reviews: []
                    });
                } else {
                    showToast("Error", "Driver not found", "error");
                }
            } catch (err) {
                console.error("Failed to fetch profile", err);
                showToast("Error", "Failed to load profile", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [id]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-slate-500">Loading Profile...</p>
        </div>
    );

    if (!user) return <div className="p-8 text-center text-red-500">Driver not found</div>;

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 bg-slate-50 min-h-screen">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>

            {/* Profile Header */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-indigo-700 to-violet-800 text-white overflow-hidden">
                <CardContent className="p-8 flex flex-col md:flex-row items-center gap-6">
                    <Avatar className="h-24 w-24 border-4 border-white/30 shadow-xl">
                        <AvatarImage src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} />
                        <AvatarFallback className="bg-indigo-300 text-indigo-900 text-2xl font-bold">
                            {user.name.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="text-center md:text-left space-y-2 flex-1">
                        <h1 className="text-3xl font-bold flex items-center gap-2 justify-center md:justify-start">
                            {user.name}
                            {user.vehicle && <Badge className="bg-white/20 hover:bg-white/30 text-white border-0"><Car className="w-3 h-3 mr-1" /> Driver</Badge>}
                        </h1>
                        <div className="flex justify-center md:justify-start items-center gap-2 text-indigo-100">
                            {user.vehicle && (
                                <span className="font-medium bg-white/10 px-2 py-0.5 rounded text-sm">
                                    {user.vehicle.color} {user.vehicle.model} • {user.vehicle.plate}
                                </span>
                            )}
                        </div>
                        <div className="flex justify-center md:justify-start items-center gap-2 text-indigo-200 text-sm">
                            <Shield className="w-3 h-3" />
                            <span>Verified Partner</span>
                            <span>•</span>
                            <span>Joined {new Date(user.joinDate).getFullYear()}</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-center bg-white/10 p-4 rounded-xl backdrop-blur-sm min-w-[120px]">
                        <div className="flex items-center gap-1 text-yellow-300">
                            <Star className="w-6 h-6 fill-yellow-300" />
                            <span className="text-2xl font-bold">{Number(user.rating).toFixed(1)}</span>
                        </div>
                        <span className="text-sm text-indigo-100">Rating</span>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Stats */}
                <Card className="md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="text-lg">Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-slate-500 flex items-center gap-2">
                                <MapPin className="w-4 h-4" /> Total Trips
                            </span>
                            <span className="font-semibold">{user.totalTrips}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-slate-500 flex items-center gap-2">
                                <Calendar className="w-4 h-4" /> Joined
                            </span>
                            <span className="font-semibold">{new Date(user.joinDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-slate-500 flex items-center gap-2">
                                <Clock className="w-4 h-4" /> Activity
                            </span>
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Active</Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Reviews */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg">Reviews</CardTitle>
                        <CardDescription>Recent feedback from passengers</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {user.reviews && user.reviews.length > 0 ? (
                            user.reviews.map((review) => (
                                <div key={review.id} className="bg-slate-50 p-4 rounded-lg space-y-2">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-3 h-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-xs text-slate-400">{new Date(review.date).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-slate-700 italic">"{review.text}"</p>
                                    <p className="text-xs text-slate-500 font-medium">- {review.author}</p>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                No reviews available yet.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
