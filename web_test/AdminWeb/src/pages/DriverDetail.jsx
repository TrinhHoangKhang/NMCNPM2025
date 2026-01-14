import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../services/apiService';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, ArrowLeft, Star, Phone, Mail, MapPin, Car, Shield, Activity, Calendar } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

const DriverDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [driver, setDriver] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchDriver = async () => {
            try {
                // Fetch basic user info
                // We might need a specific endpoint for full driver profile including vehicle info if not in user doc
                const res = await apiClient.get(`/users/${id}`);
                setDriver(res.data);

                // Fetch stats if available (e.g. trip history stats)
                // const statsRes = await apiClient.get(`/drivers/${id}/stats`);
                // setStats(statsRes.data);
            } catch (error) {
                console.error("Failed to load driver", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchDriver();
    }, [id]);

    if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
    if (!driver) return <div className="p-8 text-center">Driver not found</div>;

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-2">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Drivers
            </Button>

            {/* HEADER SECTION */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
                <Card className="w-full md:w-1/3">
                    <CardContent className="pt-6 flex flex-col items-center text-center">
                        <Avatar className="w-32 h-32 mb-4 border-4 border-slate-100">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${driver.name}`} />
                            <AvatarFallback>{driver.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <h2 className="text-2xl font-bold">{driver.name}</h2>
                        <div className="flex items-center gap-2 mt-2 text-slate-500">
                            <Badge variant={driver.status === 'ONLINE' ? 'default' : 'secondary'} className={driver.status === 'ONLINE' ? 'bg-green-100 text-green-700' : ''}>
                                {driver.status || 'OFFLINE'}
                            </Badge>
                            <span className="text-sm text-slate-400">ID: {driver.id?.substring(0, 8)}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 w-full mt-6">
                            <div className="p-3 bg-slate-50 rounded-lg">
                                <div className="text-2xl font-bold text-slate-900">{driver.rating || 5.0}</div>
                                <div className="text-xs text-slate-500 flex items-center justify-center gap-1">
                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> Rating
                                </div>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg">
                                <div className="text-2xl font-bold text-slate-900">{driver.tripCount || 0}</div>
                                <div className="text-xs text-slate-500">Total Trips</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="w-full md:w-2/3 space-y-6">
                    {/* DETAILS TABS */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Driver Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                                <div>
                                    <dt className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-2">
                                        <Mail className="w-4 h-4" /> Email Address
                                    </dt>
                                    <dd className="text-base font-medium text-slate-900">{driver.email}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-2">
                                        <Phone className="w-4 h-4" /> Phone Number
                                    </dt>
                                    <dd className="text-base font-medium text-slate-900">{driver.phone || 'Not provided'}</dd>
                                </div>
                                <div className="col-span-1 md:col-span-2">
                                    <Separator className="my-2" />
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-2">
                                        <Car className="w-4 h-4" /> Vehicle Type
                                    </dt>
                                    <dd className="text-base font-medium text-slate-900">{driver.vehicle?.type || driver.vehicleType || 'Not set'}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-2">
                                        <Shield className="w-4 h-4" /> License Plate
                                    </dt>
                                    <dd className="text-base font-medium text-slate-900">{driver.vehicle?.plate || driver.licensePlate || 'Not set'}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-2">
                                        <Activity className="w-4 h-4" /> Account Created
                                    </dt>
                                    <dd className="text-base font-medium text-slate-900">
                                        {driver.createdAt ? new Date(driver.createdAt).toLocaleDateString() : 'N/A'}
                                    </dd>
                                </div>
                            </dl>
                        </CardContent>
                    </Card>

                    {/* ACTIONS */}
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                            Suspend Account
                        </Button>
                        <Button>
                            Edit Information
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DriverDetail;
