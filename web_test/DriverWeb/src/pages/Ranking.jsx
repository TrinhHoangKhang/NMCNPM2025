import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { rankingService } from '../services/rankingService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Medal, Star, Crown, TrendingUp } from "lucide-react";

// Helper for tier colors
const getTierColor = (tier) => {
    switch (tier?.toUpperCase()) {
        case 'DIAMOND': return 'bg-cyan-100 text-cyan-700 border-cyan-200';
        case 'PLATINUM': return 'bg-slate-100 text-slate-700 border-slate-200'; // Platinum looks like silver/slate
        case 'GOLD': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        case 'SILVER': return 'bg-gray-100 text-gray-700 border-gray-200';
        case 'BRONZE': return 'bg-orange-100 text-orange-800 border-orange-200';
        default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
};

// Helper for rank icons
const getRankIcon = (rank) => {
    switch (rank) {
        case 1: return <Crown className="w-6 h-6 text-yellow-500 fill-yellow-500" />;
        case 2: return <Medal className="w-6 h-6 text-slate-400 fill-slate-400" />;
        case 3: return <Medal className="w-6 h-6 text-orange-400 fill-orange-400" />;
        default: return <span className="text-slate-500 font-bold w-6 text-center">#{rank}</span>;
    }
};

const Ranking = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [leaderboard, setLeaderboard] = useState([]);
    const [userRank, setUserRank] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await rankingService.getLeaderboard(); // defaults to 'DRIVER' in service
                setLeaderboard(data);

                // Find current user in leaderboard or fetch separate rank if needed
                // rankingService usually returns enriched leaderboard with 'isMe'
                const myRank = data.find(d => d.isMe);
                if (myRank) {
                    setUserRank(myRank);
                } else if (user?.id) {
                    // Fallback if not in top list
                    const rankData = await rankingService.getUserRank(user.id);
                    setUserRank(rankData);
                }
            } catch (error) {
                console.error("Failed to fetch ranking", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const handleRowClick = (driverId) => {
        if (driverId) {
            navigate(`/profile/${driverId}`);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-slate-50">
                <div className="animate-pulse flex flex-col items-center">
                    <Trophy className="w-12 h-12 text-slate-300 mb-4" />
                    <div className="text-slate-500 font-medium">Loading rankings...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            {/* Header / Stats */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Driver Leaderboard</h1>
                    <p className="text-slate-500 mt-1">Real-time performance rankings for this week.</p>
                </div>

                {userRank && (
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-4 text-white shadow-lg flex items-center gap-4 min-w-[280px]">
                        <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                            <Trophy className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <div className="text-xs font-medium text-white/80 uppercase tracking-wider">Your Rank</div>
                            <div className="text-2xl font-bold flex items-baseline gap-1">
                                #{userRank.rank || '-'}
                                <span className="text-sm font-normal text-white/80">
                                    of {leaderboard.length}+
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Leaderboard Table */}
            <Card className="border-0 shadow-lg overflow-hidden">
                <CardHeader className="bg-white border-b border-slate-100">
                    <CardTitle>Top Drivers</CardTitle>
                    <CardDescription>Rankings based on total trips and rating points.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Rank</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Driver</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tier</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Rating</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Points</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {leaderboard.length > 0 ? (
                                    leaderboard.map((driver) => (
                                        <tr
                                            key={driver.id || driver.rank}
                                            className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${driver.isMe ? 'bg-indigo-50/40 hover:bg-indigo-50/60' : ''}`}
                                            onClick={() => handleRowClick(driver.id)}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center justify-center w-8 h-8">
                                                    {getRankIcon(driver.rank)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10 border-2 border-slate-100">
                                                        <AvatarImage src={driver.avatar} />
                                                        <AvatarFallback className="bg-slate-100 text-slate-600 font-bold">
                                                            {(driver.name || "U").charAt(0)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className={`text-sm font-bold ${driver.isMe ? 'text-indigo-900' : 'text-slate-900'}`}>
                                                            {driver.name} {driver.isMe && "(You)"}
                                                        </p>
                                                        <p className="text-xs text-slate-500">
                                                            {driver.vehicleType || "Driver"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getTierColor(driver.tier)}`}>
                                                    {driver.tier || 'MEMBER'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-1.5 text-sm font-medium text-slate-700">
                                                    <div className="bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded text-xs font-bold flex items-center gap-1">
                                                        {driver.rating || "5.0"} <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-slate-900">
                                                {driver.score?.toLocaleString() || 0}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                            <div className="flex flex-col items-center">
                                                <TrendingUp className="w-12 h-12 text-slate-200 mb-2" />
                                                <p>No ranking data available yet.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Ranking;
