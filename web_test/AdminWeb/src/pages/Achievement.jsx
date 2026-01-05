import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from 'lucide-react';

export default function Achievement() {
    return (
        <div className="p-6 max-w-3xl mx-auto text-center space-y-4">
            <div className="inline-block p-4 bg-slate-100 rounded-full">
                <Trophy className="w-12 h-12 text-slate-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Admin Achievements</h1>
            <p className="text-slate-500">Admins don't get badges, they give them! (Placeholder page)</p>
        </div>
    );
}
