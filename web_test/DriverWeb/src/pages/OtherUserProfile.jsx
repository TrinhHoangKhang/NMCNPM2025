
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Star, Trophy, Award, TrendingUp } from 'lucide-react';
import { driverService } from "@/services/driverService";
import { rankingService } from "@/services/rankingService";

export default function OtherUserProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [rankData, setRankData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch Driver Data
                const [driverData, fetchedRankData] = await Promise.all([
                    driverService.getDriverById(id),
                    rankingService.getUserRank(id, 'DRIVER').catch(err => {
                        console.warn("Ranking fetch failed, defaulting to null", err);
                        return null;
                    })
                ]);
                setProfile(driverData);
                setRankData(fetchedRankData);
            } catch (error) {
                console.error("Error fetching user profile:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id]);

    const calculateTier = (points) => {
        if (!points) return 'Silver';
        if (points >= 2500) return 'Diamond';
        if (points >= 2000) return 'Platinum';
        if (points >= 1000) return 'Gold';
        return 'Silver';
    };

    const getTierColor = (tier) => {
        switch (tier) {
            case 'Diamond': return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20';
            case 'Platinum': return 'text-slate-300 bg-slate-300/10 border-slate-300/20';
            case 'Gold': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
            case 'Silver': return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
            default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex flex-col h-screen items-center justify-center gap-4">
                <p className="text-slate-500">User not found.</p>
                <Button variant="outline" onClick={() => navigate(-1)}>Go Back</Button>
            </div>
        );
    }

    const tier = calculateTier(rankData?.score || 0);

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <Button variant="ghost" className="pl-0 gap-2 hover:bg-transparent" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4" /> Back to Leaderboard
            </Button>

            {/* Profile Header Card */}
            <Card className="border-0 shadow-lg overflow-hidden relative">
                <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600 absolute w-full top-0 left-0 z-0" />

                <div className="relative z-10 pt-16 px-6 pb-6 text-center md:text-left flex flex-col md:flex-row items-center gap-6">
                    <Avatar className="h-32 w-32 border-4 border-white shadow-md">
                        <AvatarImage src={profile.avatar} />
                        <AvatarFallback className="text-4xl font-bold bg-slate-100 text-slate-500">
                            {(profile.name || "U").charAt(0)}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-1 mt-2 md:mt-12 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-3">
                            <h1 className="text-3xl font-bold text-slate-900">{profile.name}</h1>
                            {rankData && (
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getTierColor(tier)}`}>
                                    {tier}
                                </span>
                            )}
                        </div>
                        <p className="text-slate-500 flex items-center justify-center md:justify-start gap-2">
                            Member since {new Date(profile.createdAt || Date.now()).getFullYear()}
                        </p>
                    </div>

                    <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl border border-slate-100 shadow-sm mt-4 md:mt-12 min-w-[150px]">
                        <div className="flex flex-col items-center">
                            <span className="text-sm text-slate-500 font-medium uppercase tracking-wider">Rank</span>
                            <div className="flex items-center gap-1">
                                <Trophy className="w-5 h-5 text-yellow-500" />
                                <span className="text-3xl font-bold text-slate-900">#{rankData?.rank || "-"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-500">Total Score</CardTitle>
                        <Award className="w-4 h-4 text-indigo-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{rankData?.score?.toLocaleString() || 0}</div>
                        <p className="text-xs text-slate-500 mt-1">Lifetime Points</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-500">Rating</CardTitle>
                        <Star className="w-4 h-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold flex items-center gap-1">
                            {profile.rating || 5.0}
                            <span className="text-sm font-normal text-slate-400">/ 5.0</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Based on passenger reviews</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-500">Vehicle Type</CardTitle>
                        <TrendingUp className="w-4 h-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold capitalize">{profile.vehicle?.type?.replace('_', ' ').toLowerCase() || "N/A"}</div>
                        <p className="text-xs text-slate-500 mt-1">{profile.vehicle?.plate || "No Plate"}</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
