import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bell, Shield, Smartphone, Globe, Moon, CreditCard } from 'lucide-react';

import { useTheme } from "@/context/ThemeContext";
import { userService } from '../services/userService';
import { useAuth } from "@/context/AuthProvider";

export default function Settings() {
    const { theme, toggleTheme } = useTheme();
    const { user } = useAuth();

    // Banking State
    const [bankInfo, setBankInfo] = useState({
        bankName: '',
        bankAccount: '',
        bankOwnerName: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user && (user.uid || user.id)) {
            loadUserProfile(user.uid || user.id);
        }
    }, [user]);

    const loadUserProfile = async (id) => {
        try {
            const res = await userService.getUser(id);
            if (res && res.success) {
                const { bankName, bankAccount, bankOwnerName } = res.data || {};
                setBankInfo({
                    bankName: bankName || '',
                    bankAccount: bankAccount || '',
                    bankOwnerName: bankOwnerName || ''
                });
            }
        } catch (error) {
            console.error("Failed to load profile", error);
        }
    };

    const handleBankChange = (e) => {
        setBankInfo({ ...bankInfo, [e.target.id]: e.target.value });
    };

    const saveBankInfo = async () => {
        if (!user) {
            alert("Please login first");
            return;
        }

        setLoading(true);
        try {
            const res = await userService.updateUser(user.uid || user.id, bankInfo);
            if (res && res.success) {
                alert("Banking information updated successfully!");
            } else {
                alert("Update failed!");
                console.error("Update failed");
            }
        } catch (error) {
            console.error("Error updating bank info", error);
            alert("Error updating information");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-3xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Settings</h1>

            {/* Banking Information Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><CreditCard className="w-5 h-5" /> Banking Information</CardTitle>
                    <CardDescription>Setup your wallet to receive payments via QR Code.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="bankName">Bank Name (e.g., MBBank, TPBank)</Label>
                        <Input
                            id="bankName"
                            placeholder="Enter Bank Name"
                            value={bankInfo.bankName}
                            onChange={handleBankChange}
                        />

                        <Label htmlFor="bankAccount">Account Number</Label>
                        <Input
                            id="bankAccount"
                            placeholder="Enter Account Number"
                            value={bankInfo.bankAccount}
                            onChange={handleBankChange}
                        />

                        <Label htmlFor="bankOwnerName">Account Owner Name</Label>
                        <Input
                            id="bankOwnerName"
                            placeholder="Enter Owner Name (Must match bank record)"
                            value={bankInfo.bankOwnerName}
                            onChange={handleBankChange}
                        />

                        <Button
                            className="w-fit mt-2"
                            onClick={saveBankInfo}
                            disabled={loading}
                        >
                            {loading ? "Saving..." : "Save Banking Info"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5" /> Notifications</CardTitle>
                    <CardDescription>Manage how you receive alerts.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="push-notifs">Push Notifications</Label>
                        <Switch id="push-notifs" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="email-notifs">Email Updates</Label>
                        <Switch id="email-notifs" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5" /> Privacy & Security</CardTitle>
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
