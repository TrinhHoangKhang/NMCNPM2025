import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../services/apiService';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, ArrowLeft, Phone, Mail, MapPin, Calendar, Clock } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const RiderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [rider, setRider] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRider = async () => {
            try {
                const res = await apiClient.get(`/users/${id}`);
                setRider(res.data);
            } catch (error) {
                console.error("Failed to load rider", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchRider();
    }, [id]);

    if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
    if (!rider) return <div className="p-8 text-center">Rider not found</div>;

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-2">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Riders
            </Button>

            <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* PROFILE CARD */}
                <Card className="w-full md:w-1/3">
                    <CardContent className="pt-6 flex flex-col items-center text-center">
                        <Avatar className="w-32 h-32 mb-4 border-4 border-slate-100">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${rider.name}`} />
                            <AvatarFallback>{rider.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <h2 className="text-2xl font-bold">{rider.name}</h2>
                        <div className="flex items-center gap-2 mt-2 text-slate-500">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">Rider</Badge>
                            <span className="text-sm text-slate-400">ID: {rider.id?.substring(0, 8)}</span>
                        </div>

                        <div className="w-full mt-6 grid grid-cols-1 gap-4">
                            <div className="p-3 bg-slate-50 rounded-lg">
                                <div className="text-2xl font-bold text-slate-900">{rider.tripCount || 0}</div>
                                <div className="text-xs text-slate-500">Total Trips</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* INFO */}
                <div className="w-full md:w-2/3 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Rider Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <dl className="grid grid-cols-1 gap-y-6">
                                <div>
                                    <dt className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-2">
                                        <Mail className="w-4 h-4" /> Email Address
                                    </dt>
                                    <dd className="text-base font-medium text-slate-900">{rider.email}</dd>
                                </div>
                                <Separator />
                                <div>
                                    <dt className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-2">
                                        <Phone className="w-4 h-4" /> Phone Number
                                    </dt>
                                    <dd className="text-base font-medium text-slate-900">{rider.phone || 'Not provided'}</dd>
                                </div>
                                <Separator />
                                <div>
                                    <dt className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-2">
                                        <Calendar className="w-4 h-4" /> Join Date
                                    </dt>
                                    <dd className="text-base font-medium text-slate-900">
                                        {rider.createdAt ? new Date(rider.createdAt).toLocaleDateString() : 'N/A'}
                                    </dd>
                                </div>
                            </dl>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-3">
                        <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                            Suspend Account
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RiderDetail;
