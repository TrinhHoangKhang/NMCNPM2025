import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trophy, Medal, Award, TrendingUp, Star, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { rankingService } from "@/services/rankingService";
import { useAuth } from "@/hooks/useAuth";

const Ranking = () => {
    const { user } = useAuth();
    const [leaderboard, setLeaderboard] = useState([]);
    const [currentUserRank, setCurrentUserRank] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const userId = user?.id || user?.uid;
                const [lbData, rankData] = await Promise.all([
                    rankingService.getLeaderboard(),
                    userId ? rankingService.getUserRank(userId) : null
                ]);

                // Map backend data to UI structure if needed
                // Backend returns: { id, name, score, avatar, rating }
                // We calculate tier locally for now based on points
                const mappedLeaderboard = Array.isArray(lbData) ? lbData.map((driver, index) => ({
                    ...driver,
                    rank: index + 1,
                    tier: calculateTier(driver.score),
                    isMe: user && driver.id === user.id
                })) : [];

                setLeaderboard(mappedLeaderboard);
                setCurrentUserRank(rankData);

            } catch (error) {
                console.error("Error loading ranking data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const calculateTier = (points) => {
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

    const getRankIcon = (rank) => {
        switch (rank) {
            case 1: return <Trophy className="w-6 h-6 text-yellow-500 fill-yellow-500" />;
            case 2: return <Medal className="w-6 h-6 text-slate-300 fill-slate-300" />;
            case 3: return <Medal className="w-6 h-6 text-amber-700 fill-amber-700" />;
            default: return <span className="text-lg font-bold text-slate-500 w-6 text-center">{rank}</span>;
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Driver Rankings</h1>
                    <p className="text-slate-500">Compete with top drivers and earn exclusive rewards.</p>
                </div>
                {currentUserRank && (
                    <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-lg">
                        <Trophy className="w-5 h-5 text-indigo-600" />
                        <span className="font-medium text-indigo-900">Your Rank: #{currentUserRank.rank}</span>
                    </div>
                )}
            </div>

            {/* Stats Cards - Using Current User Data */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-500">Current Points</CardTitle>
                        <Star className="w-4 h-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{currentUserRank?.score || 0}</div>
                        <p className="text-xs text-slate-500 mt-1">Lifetime Score</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-500">Current Tier</CardTitle>
                        <Award className="w-4 h-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-700">{calculateTier(currentUserRank?.score || 0)}</div>
                        <p className="text-xs text-slate-500 mt-1">Based on points</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-500">Weekly Performance</CardTitle>
                        <TrendingUp className="w-4 h-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">Active</div>
                        <p className="text-xs text-slate-500 mt-1">Keep climbing!</p>
                    </CardContent>
                </Card>
            </div>

            {/* Leaderboard Table */}
            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <CardTitle>Top Drivers</CardTitle>
                    <CardDescription>Rankings based on total trips and performance.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Rank</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Driver</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tier</th>
                                    {/* <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Trips</th> */}
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Rating</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Points</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {leaderboard.length > 0 ? (
                                    leaderboard.map((driver) => (
                                        <tr
                                            key={driver.id || driver.rank}
                                            className={`hover:bg-slate-50/50 transition-colors ${driver.isMe ? 'bg-indigo-50/60 hover:bg-indigo-50' : ''}`}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center justify-center w-8 h-8">
                                                    {getRankIcon(driver.rank)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9 border border-slate-200">
                                                        <AvatarImage src={driver.avatar} />
                                                        <AvatarFallback className="bg-slate-100 text-slate-600 font-medium">
                                                            {(driver.name || "U").charAt(0)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className={`text-sm font-medium ${driver.isMe ? 'text-indigo-900' : 'text-slate-900'}`}>
                                                            {driver.name} {driver.isMe && "(You)"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTierColor(driver.tier)}`}>
                                                    {driver.tier}
                                                </span>
                                            </td>
                                            {/* <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-600">
                                                {driver.trips || 0}
                                            </td> */}
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-1 text-sm text-slate-700">
                                                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                                                    {driver.rating || "N/A"}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-slate-900">
                                                {driver.score?.toLocaleString() || 0}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                                            No ranking data available yet.
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
