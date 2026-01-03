import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trophy, Medal, Award, TrendingUp, Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Ranking = () => {
    // Mock Data for Leaderboard
    const leaderboard = [
        { rank: 1, name: "Nguyen Van A", points: 2500, tier: "Diamond", trips: 145, rating: 5.0, avatar: "" },
        { rank: 2, name: "Tran Thi B", points: 2350, tier: "Platinum", trips: 132, rating: 4.9, avatar: "" },
        { rank: 3, name: "Le Van C", points: 2100, tier: "Platinum", trips: 120, rating: 4.8, avatar: "" },
        { rank: 4, name: "Pham Van D", points: 1950, tier: "Gold", trips: 98, rating: 4.9, avatar: "" },
        { rank: 5, name: "Hoang Thi E", points: 1800, tier: "Gold", trips: 90, rating: 4.7, avatar: "" },
        { rank: 6, name: "Driver One (You)", points: 1200, tier: "Silver", trips: 45, rating: 4.9, avatar: "", isMe: true },
        { rank: 7, name: "Vu Van F", points: 1150, tier: "Silver", trips: 42, rating: 4.6, avatar: "" },
    ];

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

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Driver Rankings</h1>
                    <p className="text-slate-500">Compete with top drivers and earn exclusive rewards.</p>
                </div>
                <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-lg">
                    <Trophy className="w-5 h-5 text-indigo-600" />
                    <span className="font-medium text-indigo-900">Your Rank: #6</span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-500">Current Points</CardTitle>
                        <Star className="w-4 h-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1,200</div>
                        <p className="text-xs text-slate-500 mt-1">+150 from last week</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-500">Current Tier</CardTitle>
                        <Award className="w-4 h-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-700">Silver</div>
                        <p className="text-xs text-slate-500 mt-1">300 pts to Gold</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-500">Weekly Performance</CardTitle>
                        <TrendingUp className="w-4 h-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">Top 15%</div>
                        <p className="text-xs text-slate-500 mt-1">Keep it up!</p>
                    </CardContent>
                </Card>
            </div>

            {/* Leaderboard Table */}
            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <CardTitle>Top Drivers (This Week)</CardTitle>
                    <CardDescription>Rankings are updated every hour.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Rank</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Driver</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tier</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Trips</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Rating</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Points</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {leaderboard.map((driver) => (
                                    <tr
                                        key={driver.rank}
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
                                                        {driver.name.charAt(0)}
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
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-600">
                                            {driver.trips}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-1 text-sm text-slate-700">
                                                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                                                {driver.rating}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-slate-900">
                                            {driver.points.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Ranking;
