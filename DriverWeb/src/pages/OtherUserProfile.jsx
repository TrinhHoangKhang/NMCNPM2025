import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Calendar, Clock, ArrowLeft, Shield } from 'lucide-react';

export default function OtherUserProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock fetching user data based on ID
        // In a real app, this would be: const data = await userService.getUserById(id);
        const fetchUser = async () => {
            setLoading(true);
            setTimeout(() => { // Simulate network delay
                setUser({
                    id: id,
                    name: "Nguyen Van Rider",
                    email: "rider@example.com",
                    phone: "0912***456",
                    rating: 4.8,
                    totalTrips: 42,
                    joinDate: "2024-05-15",
                    tier: "Gold",
                    reviews: [
                        { id: 1, text: "Great passenger, very polite!", rating: 5, date: "2024-12-20", author: "Driver X" },
                        { id: 2, text: "Punctual.", rating: 5, date: "2024-12-10", author: "Driver Y" },
                        { id: 3, text: "Changed destination mid-trip but paid extra.", rating: 4, date: "2024-11-05", author: "Driver Z" }
                    ]
                });
                setLoading(false);
            }, 800);
        };
        fetchUser();
    }, [id]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-slate-500">Loading Profile...</p>
        </div>
    );

    if (!user) return <div className="p-8 text-center text-red-500">User not found</div>;

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 bg-slate-50 min-h-screen">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>

            {/* Profile Header */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-600 to-indigo-700 text-white overflow-hidden">
                <CardContent className="p-8 flex flex-col md:flex-row items-center gap-6">
                    <Avatar className="h-24 w-24 border-4 border-white/30 shadow-xl">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} />
                        <AvatarFallback className="bg-indigo-300 text-indigo-900 text-2xl font-bold">
                            {user.name.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="text-center md:text-left space-y-2 flex-1">
                        <h1 className="text-3xl font-bold">{user.name}</h1>
                        <div className="flex justify-center md:justify-start items-center gap-2 text-blue-100">
                            <Shield className="w-4 h-4" />
                            <span>{user.tier} Member</span>
                            <span>•</span>
                            <span>Joined {new Date(user.joinDate).getFullYear()}</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-center bg-white/10 p-4 rounded-xl backdrop-blur-sm min-w-[120px]">
                        <div className="flex items-center gap-1 text-yellow-300">
                            <Star className="w-6 h-6 fill-yellow-300" />
                            <span className="text-2xl font-bold">{user.rating}</span>
                        </div>
                        <span className="text-sm text-blue-100">Rating</span>
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
                                <Clock className="w-4 h-4" /> Payment Reliability
                            </span>
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">High</Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Reviews */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg">Recent Reviews from Drivers</CardTitle>
                        <CardDescription>What other drivers say about {user.name}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {user.reviews.map((review) => (
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
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
