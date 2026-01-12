import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function TripInfoCard({ trip }) {
    return (
        <Card className="border-0 shadow-md">
            <CardHeader className="border-b bg-white">
                <CardTitle>Trip Details</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                    <div className="flex gap-3">
                        <div className="flex flex-col items-center mt-1">
                            <div className="w-3 h-3 rounded-full bg-green-500 ring-4 ring-green-100" />
                            <div className="w-0.5 h-10 bg-slate-200 my-1" />
                            <div className="w-3 h-3 rounded-full bg-red-500 ring-4 ring-red-100" />
                        </div>
                        <div className="flex-1 space-y-6">
                            <div>
                                <p className="text-xs text-slate-500 font-semibold mb-1">PICKUP</p>
                                <p className="text-sm font-medium">{trip.pickupLocation?.address}</p>
                                {trip.startTime && <p className="text-xs text-slate-400 mt-1">Picked up at {new Date(trip.startTime).toLocaleTimeString()}</p>}
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-semibold mb-1">DROPOFF</p>
                                <p className="text-sm font-medium">{trip.dropoffLocation?.address}</p>
                                {trip.endTime && <p className="text-xs text-slate-400 mt-1">Dropped off at {new Date(trip.endTime).toLocaleTimeString()}</p>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* FARE BREAKDOWN */}
                <div className="bg-slate-50 p-4 rounded-lg space-y-2 mt-4">
                    <h4 className="text-xs font-semibold text-slate-500 mb-2">FARE BREAKDOWN</h4>
                    <div className="flex justify-between text-sm text-slate-600">
                        <span>Base Fare</span>
                        <span>{(trip.fare ? trip.fare * 0.3 : 0).toLocaleString()} VND</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-600">
                        <span>Distance & Time</span>
                        <span>{(trip.fare ? trip.fare * 0.6 : 0).toLocaleString()} VND</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-600">
                        <span>Platform Fee</span>
                        <span>{(trip.fare ? trip.fare * 0.1 : 0).toLocaleString()} VND</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-slate-900 font-bold mt-2">
                        <span>Total</span>
                        <span className="text-indigo-700">{trip.fare?.toLocaleString()} VND</span>
                    </div>
                </div>

                <div className="pt-2 flex justify-between items-center">
                    <div>
                        <p className="text-xs text-slate-500">PAYMENT METHOD</p>
                        <p className="font-semibold">{trip.paymentMethod}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
