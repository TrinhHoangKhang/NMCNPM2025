import React from 'react';
import {
    MapPin,
    Briefcase,
    CheckCircle,
    Clock,
    Award,
    TrendingUp,
    Github,
    Twitter,
    Linkedin,
    ExternalLink,
    Edit,
    Share2
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// --- Sub-components ---

const IdentityCard = ({ user }) => (
    <Card className="col-span-1 md:col-span-2 row-span-2 shadow-sm border-0 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <CardContent className="h-full flex flex-col items-center justify-center p-6 text-center z-10 relative">
            <div className="relative mb-4">
                <Avatar className="h-24 w-24 border-4 border-white dark:border-slate-800 shadow-xl">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="text-3xl bg-indigo-100 text-indigo-600">
                        {user.initials}
                    </AvatarFallback>
                </Avatar>
                <span className={`absolute bottom-1 right-1 h-5 w-5 rounded-full border-4 border-white dark:border-slate-800 ${user.isOnline ? 'bg-green-500' : 'bg-slate-400'}`} />
            </div>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{user.name}</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium mb-3 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4" /> {user.role}
            </p>

            <div className="flex flex-wrap gap-2 justify-center mb-6">
                <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200">
                    <MapPin className="w-3 h-3 mr-1" /> {user.location}
                </Badge>
                <Badge variant={user.status === 'Available' ? 'default' : 'outline'} className={user.status === 'Available' ? 'bg-green-500 hover:bg-green-600' : ''}>
                    {user.status}
                </Badge>
            </div>

            <div className="flex gap-3 w-full max-w-xs">
                <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                    Connect
                </Button>
                <Button variant="outline" className="flex-1 border-slate-200 hover:bg-slate-50">
                    Portfolio
                </Button>
            </div>
        </CardContent>
    </Card>
);

const StatsWidget = ({ icon: Icon, label, value, trend, trendUp }) => (
    <Card className="col-span-1 shadow-sm border-0 bg-white dark:bg-slate-900 rounded-2xl hover:-translate-y-1 transition-transform duration-300">
        <CardContent className="p-5 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start mb-2">
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl">
                    <Icon className="w-5 h-5" />
                </div>
                {trend && (
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {trend}
                    </span>
                )}
            </div>
            <div>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{value}</h3>
                <p className="text-sm text-slate-500 font-medium">{label}</p>
            </div>
        </CardContent>
    </Card>
);

const SkillsList = ({ title, items, icon: Icon }) => (
    <Card className="col-span-1 md:col-span-2 shadow-sm border-0 bg-white dark:bg-slate-900 rounded-2xl">
        <CardContent className="p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                {Icon && <Icon className="w-5 h-5 text-indigo-500" />} {title}
            </h3>
            <div className="flex flex-wrap gap-2">
                {items.map((item, idx) => (
                    <Badge key={idx} variant="outline" className="px-3 py-1.5 text-sm border-slate-200 bg-slate-50 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 transition-colors cursor-default">
                        {item}
                    </Badge>
                ))}
            </div>
        </CardContent>
    </Card>
);

const ActivityGraph = () => (
    <Card className="col-span-1 md:col-span-3 shadow-sm border-0 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
        <CardContent className="p-0 relative h-32 bg-slate-50 dark:bg-slate-800/50">
            <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm font-medium">
                <TrendingUp className="w-4 h-4 mr-2" /> Activity Graph Visualization (Placeholder)
            </div>
            {/* Mock graph bars */}
            <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between px-6 pb-0 h-16 gap-1 opacity-50">
                {[40, 65, 45, 80, 55, 70, 45, 60, 30, 75, 50, 90, 65, 45, 80].map((h, i) => (
                    <div key={i} className="flex-1 bg-indigo-400 rounded-t-sm" style={{ height: `${h}%` }}></div>
                ))}
            </div>
        </CardContent>
    </Card>
)

const SocialLinks = ({ links }) => (
    <Card className="col-span-1 shadow-sm border-0 bg-indigo-600 dark:bg-indigo-700 rounded-2xl text-white">
        <CardContent className="p-6 flex flex-col justify-center h-full items-center text-center">
            <h3 className="font-bold mb-4 opacity-90">Find me on</h3>
            <div className="flex gap-4">
                {links.github && <a href={links.github} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"><Github className="w-5 h-5" /></a>}
                {links.twitter && <a href={links.twitter} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"><Twitter className="w-5 h-5" /></a>}
                {links.linkedin && <a href={links.linkedin} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"><Linkedin className="w-5 h-5" /></a>}
            </div>
        </CardContent>
    </Card>
)


// --- Main Component ---

export default function BentoProfile({ userData }) {
    // Safe defaults
    const user = {
        name: "User Name",
        role: "Role",
        location: "Location",
        status: "Offline",
        avatar: "",
        initials: "UN",
        isOnline: false,
        stats: [],
        skills: [],
        socials: {},
        ...userData
    };

    return (
        <div className="w-full max-w-5xl mx-auto p-4 md:p-6 bg-slate-50/50 dark:bg-slate-950 min-h-screen">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[minmax(140px,auto)]">

                {/* Identity Card (Large, Top Left) */}
                <IdentityCard user={user} />

                {/* Stats Widgets */}
                {user.stats.map((stat, index) => (
                    <StatsWidget key={index} {...stat} />
                ))}

                {/* Dynamic Skills/Features List */}
                <SkillsList title="Tech Stack & Skills" items={user.skills} icon={CheckCircle} />

                {/* Social Links */}
                <SocialLinks links={user.socials} />

                {/* Activity Graph */}
                <ActivityGraph />

            </div>
        </div>
    );
}
