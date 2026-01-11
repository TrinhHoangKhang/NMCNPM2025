import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bell, Shield, Wallet, Globe, Moon } from 'lucide-react';

import { useTheme } from "@/context/ThemeContext";

export default function Settings() {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="p-6 max-w-3xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Settings</h1>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5" /> Notifications</CardTitle>
                    <CardDescription>Manage your trip alerts.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="push-notifs">Push Notifications</Label>
                        <Switch id="push-notifs" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="promo-notifs">Promotional Emails</Label>
                        <Switch id="promo-notifs" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5" /> Account & Security</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="current-pass">Change Password</Label>
                        <Input id="current-pass" type="password" placeholder="Current Password" />
                        <Input id="new-pass" type="password" placeholder="New Password" />
                        <Button variant="outline" className="w-fit">Update Password</Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5" /> Appearance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="dark-mode" className="flex items-center gap-2"><Moon className="w-4 h-4" /> Dark Mode</Label>
                        <Switch
                            id="dark-mode"
                            checked={theme === 'dark'}
                            onCheckedChange={toggleTheme}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
