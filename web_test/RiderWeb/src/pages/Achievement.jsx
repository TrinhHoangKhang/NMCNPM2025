import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Medal, Award, Zap, ThumbsUp, MapPin } from 'lucide-react';

export default function Achievement() {
    const achievements = [
        { id: 1, title: "Explorer", desc: "Take 10 trips to different locations", icon: MapPin, progress: 7, target: 10, color: "text-blue-500 bg-blue-50" },
        { id: 2, title: "Loyal Rider", desc: "Complete 50 trips", icon: Medal, progress: 32, target: 50, color: "text-purple-500 bg-purple-50" },
        { id: 3, title: "Eco-Friendly", desc: "Choose 5 electric rides", icon: Zap, progress: 2, target: 5, color: "text-green-500 bg-green-50" },
    ];

    function Star(props) { return <Award {...props} />; }

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-full">
                    <Trophy className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">My Achievements</h1>
                    <p className="text-slate-500">Collect badges as you ride.</p>
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
