import { useNavigate } from 'react-router-dom';

const Ranking = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    // ... existing state ...

    // ... existing useEffect ...

    // ... existing helpers ...

    const handleRowClick = (driverId) => {
        if (driverId) {
            navigate(`/profile/${driverId}`);
        }
    };

    if (loading) {
        // ... existing loader ...
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            {/* ... existing header ... */}

            {/* ... existing stats ... */}

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
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Rating</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Points</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {leaderboard.length > 0 ? (
                                    leaderboard.map((driver) => (
                                        <tr
                                            key={driver.id || driver.rank}
                                            className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${driver.isMe ? 'bg-indigo-50/60 hover:bg-indigo-50' : ''}`}
                                            onClick={() => handleRowClick(driver.id)}
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
                                    // ... existing fallback ...
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
