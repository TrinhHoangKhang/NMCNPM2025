import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/context/ThemeContext";
import { Bell, Shield, Database, Users, Moon } from 'lucide-react';

export default function Settings() {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="p-6 max-w-3xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Admin Settings</h1>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5" /> System Alerts</CardTitle>
                    <CardDescription>Configure system-wide notifications.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="sys-alerts">System Critical Alerts</Label>
                        <Switch id="sys-alerts" defaultChecked />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5" /> Security</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button variant="outline">Manage API Keys</Button>
                    <Button variant="outline" className="ml-2">View Audit Logs</Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Moon className="w-5 h-5" /> Appearance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="dark-mode" className="flex items-center gap-2">Dark Mode</Label>
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
