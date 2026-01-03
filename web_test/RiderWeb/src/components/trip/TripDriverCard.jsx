import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ShieldCheck, Star, Phone, MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TripDriverCard({ trip, driverDetails, navigate }) {
    return (
        <Card className="border-0 shadow-md overflow-hidden">
            <CardHeader className="bg-indigo-600 text-white p-6">
                <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="h-6 w-6" /> Your Driver
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                {trip.driverId ? (
                    <div className="flex items-start gap-4">
                        <div className="h-16 w-16 rounded-full bg-slate-200 flex items-center justify-center text-2xl font-bold text-slate-500">
                            {trip.driverName ? trip.driverName.charAt(0) : "D"}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold">
                                {driverDetails?.name || trip.driverName || "Unknown Driver"}
                            </h3>
                            <div className="flex items-center text-yellow-500 text-sm mb-2">
                                <Star className="h-4 w-4 fill-current" /> {driverDetails?.rating || "5.0"} (500+ trips)
                            </div>
                            <p className="text-slate-600 font-medium">
                                {driverDetails?.vehicle?.type || trip.vehicleType} • {driverDetails?.vehicle?.plate || trip.vehiclePlate || "Plate Hidden"}
                            </p>
                            <p className="text-sm text-slate-500 mt-1">
                                {driverDetails?.vehicle?.color || trip.vehicleColor || "White"} {driverDetails?.vehicle?.model || trip.vehicleModel || "Standard"}
                            </p>
                            <div className="flex gap-2 mt-4">
                                <Button size="sm" variant="outline" className="flex-1 border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                                    <Phone className="h-4 w-4 mr-2" /> Call
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                                    onClick={() => navigate(`/chat?friendId=${trip.driverId}`)}
                                >
                                    <MessageSquare className="h-4 w-4 mr-2" /> Chat
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-6 text-slate-500">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                        Waiting for driver assignment...
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
