import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Wallet, History, CreditCard } from 'lucide-react';
import { userService } from '@/services/userService';

// Helper to format currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export default function Finance() {
    const { user } = useAuth();
    const [financeData, setFinanceData] = useState({
        debt: 0,
        earnings: 0, // Placeholder if we had earnings API
        balance: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFinanceData = async () => {
            try {
                // Fetch fresh user data to ensure debt is up to date
                if (user?.uid) {
                    const userData = await userService.getUser(user.uid);
                    setFinanceData({
                        debt: userData.debt || 0,
                        earnings: userData.earnings || 0,
                        balance: userData.balance || 0
                    });
                }
            } catch (error) {
                console.error("Failed to fetch finance data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFinanceData();
    }, [user]);

    if (loading) {
        return <div className="p-8 text-center">Loading finance data...</div>;
    }

    // Determine status color based on debt
    const isDebtHigh = financeData.debt > 200000;

    return (
        <div className="container mx-auto p-6 max-w-5xl space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Financial Overview</h1>
                    <p className="text-muted-foreground mt-1">Manage your earnings and platform fees.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <History className="mr-2 h-4 w-4" />
                        Transaction History
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* DEBT CARD */}
                <Card className={isDebtHigh ? "border-red-200 bg-red-50" : "bg-white"}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Platform Debt</CardTitle>
                        <AlertCircle className={`h-4 w-4 ${isDebtHigh ? 'text-red-500' : 'text-slate-500'}`} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${isDebtHigh ? 'text-red-600' : 'text-slate-900'}`}>
                            {formatCurrency(financeData.debt)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Amount owed to platform (Commission fees)
                        </p>
                        {financeData.debt > 0 && (
                            <Button className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white">
                                Pay Now
                            </Button>
                        )}
                    </CardContent>
                </Card>

                {/* EARNINGS CARD (Mock/Future) */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                        <Wallet className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">
                            {formatCurrency(financeData.earnings)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Gross income from trips
                        </p>
                    </CardContent>
                </Card>

                {/* WALLET/BALANCE CARD (If applicable) */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
                        <CreditCard className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">
                            {formatCurrency(financeData.balance)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Available for withdrawal
                        </p>
                        <Button variant="outline" className="w-full mt-4">
                            Withdraw
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* INFO SECTION */}
            <Card>
                <CardHeader>
                    <CardTitle>Commission Policy</CardTitle>
                    <CardDescription>Understanding how platform fees are calculated</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-start gap-3 p-4 border rounded-lg bg-slate-50">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-sm">20% Service Fee</h4>
                            <p className="text-sm text-slate-600 mt-1">
                                Ideally, RideGo charges a 20% commission on every completed trip.
                                This amount is added to your "Platform Debt".
                                You keep the full cash/transfer amount from the rider immediately, and settle the debt later.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
