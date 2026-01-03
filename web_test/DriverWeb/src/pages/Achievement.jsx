import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Medal, Award, Zap, ThumbsUp } from 'lucide-react';

export default function Achievement() {
    const achievements = [
        { id: 1, title: "Early Bird", desc: "Complete 10 trips before 8 AM", icon: Zap, progress: 80, target: 100, color: "text-yellow-500 bg-yellow-50" },
        { id: 2, title: "Five Star Driver", desc: "Maintain a 5.0 rating for 50 trips", icon: Star, progress: 45, target: 50, color: "text-blue-500 bg-blue-50" },
        { id: 3, title: "Marathoner", desc: "Drive 1000km total", icon: Medal, progress: 750, target: 1000, color: "text-purple-500 bg-purple-50" },
        { id: 4, title: "People Pleaser", desc: "Receive 100 compliments", icon: ThumbsUp, progress: 20, target: 100, color: "text-green-500 bg-green-50" },
    ];

    function Star(props) { return <Award {...props} />; } // Placeholder helper

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-full">
                    <Trophy className="w-8 h-8 text-yellow-600" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Achievements</h1>
                    <p className="text-slate-500">Track your milestones and earn badges.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {achievements.map((item) => (
                    <Card key={item.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-2">
                            <div className={`p-3 rounded-lg ${item.color}`}>
                                <item.icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <CardTitle className="text-lg">{item.title}</CardTitle>
                                <CardDescription>{item.desc}</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm font-medium">
                                    <span className="text-slate-500">Progress</span>
                                    <span>{item.progress} / {item.target}</span>
                                </div>
                                <Progress value={(item.progress / item.target) * 100} className="h-2" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
