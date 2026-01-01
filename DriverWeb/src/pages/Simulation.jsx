import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useSocket } from "@/context";
import { tripService } from "@/services/tripService";
import { useDriver } from "@/context";
import { Play, Pause, Square, MapPin, RotateCcw, Navigation, CheckCircle2 } from "lucide-react";

// --- Leaflet Icon Fix ---
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const pickupIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const dropoffIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const driverIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// --- Components ---

function MapEventHandler({ onClick, mode }) {
    useMapEvents({
        click: (e) => {
            if (mode) onClick(e.latlng);
        },
    });
    return null;
}

function FitBounds({ path }) {
    const map = useMap();
    useEffect(() => {
        if (path && path.length > 0) {
            const bounds = L.latLngBounds(path);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [path, map]);
    return null;
}

export default function Simulation() {
    const { socket } = useSocket();
    const { currentTrip } = useDriver();

    // Core State
    const [startLoc, setStartLoc] = useState(null); // {lat, lng} - Driver Start or Pickup
    const [endLoc, setEndLoc] = useState(null);     // {lat, lng} - Pickup or Dropoff
    const [driverLoc, setDriverLoc] = useState(null);
    const [path, setPath] = useState(null);         // Array of [lat, lng]

    // UI State
    const [mode, setMode] = useState(null); // 'SET_START' | 'SET_END'
    const [isRunning, setIsRunning] = useState(false);
    const [speed, setSpeed] = useState(40); // km/h roughly (simulation naming) -> actually ms delay
    const [progressIndex, setProgressIndex] = useState(0);
    const intervalRef = useRef(null);

    // Initial Load from Trip
    useEffect(() => {
        if (currentTrip && currentTrip.pickupLocation && currentTrip.dropoffLocation) {
            const pickup = {
                lat: parseFloat(currentTrip.pickupLocation.lat),
                lng: parseFloat(currentTrip.pickupLocation.lng),
                address: currentTrip.pickupLocation.address
            };
            const dropoff = {
                lat: parseFloat(currentTrip.dropoffLocation.lat),
                lng: parseFloat(currentTrip.dropoffLocation.lng),
                address: currentTrip.dropoffLocation.address
            };

            if (currentTrip.status === 'ACCEPTED') {
                // Simulate from "Nearby" to Pickup
                // Mock a location 500m away
                const mockDriverStart = { lat: pickup.lat - 0.005, lng: pickup.lng - 0.005 };
                setStartLoc(mockDriverStart);
                setDriverLoc(mockDriverStart);
                setEndLoc(pickup);
            } else if (currentTrip.status === 'IN_PROGRESS') {
                // Simulate from Pickup to Dropoff
                setStartLoc(pickup);
                setDriverLoc(pickup);
                setEndLoc(dropoff);
            }
        } else {
            // Default HCMC
            setDriverLoc({ lat: 10.762622, lng: 106.660172 });
        }
    }, [currentTrip]);

    const handleMapClick = (latlng) => {
        if (mode === 'SET_START') {
            setStartLoc(latlng);
            setDriverLoc(latlng);
            setMode(null);
        } else if (mode === 'SET_END') {
            setEndLoc(latlng);
            setMode(null);
        } else if (mode === 'SET_DRIVER') {
            const newLoc = { lat: latlng.lat, lng: latlng.lng };
            setDriverLoc(newLoc);

            // Immediately emit location update
            if (socket && currentTrip) {
                socket.emit('update_location', {
                    tripId: currentTrip.id,
                    lat: newLoc.lat,
                    lng: newLoc.lng
                });
            }
            setMode(null);
        }
    };

    const fetchRoute = async () => {
        if (!startLoc || !endLoc) return;

        try {
            const result = await tripService.getRoute(startLoc, endLoc);
            if (result && result.path) {
                setPath(result.path);
                setProgressIndex(0);
            }
        } catch (error) {
            console.error("Failed to fetch route", error);
        }
    };

    const startSimulation = () => {
        if (!path || path.length === 0) return;
        setIsRunning(true);
    };

    const pauseSimulation = () => {
        setIsRunning(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
    };

    const resetSimulation = () => {
        pauseSimulation();
        setProgressIndex(0);
        if (path && path.length > 0) {
            setDriverLoc({ lat: path[0][0], lng: path[0][1] });
        }
    };

    // Simulation Loop
    useEffect(() => {
        if (isRunning && path) {
            intervalRef.current = setInterval(() => {
                setProgressIndex(prev => {
                    const next = prev + 1;
                    if (next >= path.length) {
                        pauseSimulation();
                        return prev;
                    }

                    const point = path[next];
                    const newLoc = { lat: point[0], lng: point[1] };
                    setDriverLoc(newLoc);

                    // EMIT SOCKET EVENT
                    if (socket && currentTrip) {
                        socket.emit('update_location', {
                            tripId: currentTrip.id,
                            lat: newLoc.lat,
                            lng: newLoc.lng
                        });
                    }

                    return next;
                });
            }, 10000 / speed); // Rough speed control
        }
        return () => clearInterval(intervalRef.current);
    }, [isRunning, path, speed, socket, currentTrip]);

    return (
        <div className="flex flex-col h-screen md:flex-row bg-slate-100">
            {/* Sidebar Controls */}
            <div className="w-full md:w-96 bg-white shadow-xl z-20 flex flex-col h-1/2 md:h-full overflow-y-auto">
                <div className="p-6 border-b">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
                        <Navigation className="h-6 w-6 text-blue-600" />
                        Trip Simulator
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Mock driver movement for testing</p>
                </div>

                <div className="p-6 space-y-6 flex-1">
                    {/* Status Card */}
                    {currentTrip ? (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                            <div className="font-semibold text-blue-800">Active Trip: #{currentTrip.id.substring(0, 8)}</div>
                            <div className="text-blue-600 mt-1">Status: {currentTrip.status}</div>
                        </div>
                    ) : (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                            No Active Trip found. Simulation events may not reach a rider.
                        </div>
                    )}

                    {/* Location Setup */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Start Location</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={startLoc ? `${startLoc.lat.toFixed(4)}, ${startLoc.lng.toFixed(4)}` : ''}
                                    readOnly
                                    placeholder="Lat, Lng"
                                    className="bg-slate-50"
                                />
                                <Button
                                    variant={mode === 'SET_START' ? "default" : "outline"}
                                    onClick={() => setMode(mode === 'SET_START' ? null : 'SET_START')}
                                >
                                    <MapPin className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Destination</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={endLoc ? `${endLoc.lat.toFixed(4)}, ${endLoc.lng.toFixed(4)}` : ''}
                                    readOnly
                                    placeholder="Lat, Lng"
                                    className="bg-slate-50"
                                />
                                <Button
                                    variant={mode === 'SET_END' ? "destructive" : "outline"}
                                    className={mode === 'SET_END' ? "" : "border-red-200 text-red-600 hover:bg-red-50"}
                                    onClick={() => setMode(mode === 'SET_END' ? null : 'SET_END')}
                                >
                                    <MapPin className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2 pt-2 border-t">
                            <Label>Manual Override</Label>
                            <Button
                                variant={mode === 'SET_DRIVER' ? "default" : "secondary"}
                                className="w-full flex items-center justify-center gap-2"
                                onClick={() => setMode(mode === 'SET_DRIVER' ? null : 'SET_DRIVER')}
                            >
                                <Navigation className="h-4 w-4" />
                                Set Current Location
                            </Button>
                            <p className="text-xs text-slate-500">Click map to instantly jump to location</p>
                        </div>

                        <Button onClick={fetchRoute} disabled={!startLoc || !endLoc} className="w-full mt-2">
                            Generate Route Path
                        </Button>
                    </div>

                    {/* Simulation Controls */}
                    {path && (
                        <div className="space-y-4 pt-4 border-t animate-in fade-in slide-in-from-bottom-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-semibold">Simulation Speed</span>
                                <Badge variant="secondary">{speed} ms</Badge>
                            </div>
                            {/* Simple speed buttons instead of slider for now */}
                            <div className="flex gap-2">
                                <Button size="sm" variant={speed === 200 ? "default" : "outline"} onClick={() => setSpeed(200)}>Slow</Button>
                                <Button size="sm" variant={speed === 50 ? "default" : "outline"} onClick={() => setSpeed(50)}>Normal</Button>
                                <Button size="sm" variant={speed === 10 ? "default" : "outline"} onClick={() => setSpeed(10)}>Fast</Button>
                            </div>

                            <div className="flex gap-2 mt-4">
                                {!isRunning ? (
                                    <Button onClick={startSimulation} className="flex-1 bg-green-600 hover:bg-green-700">
                                        <Play className="w-4 h-4 mr-2" /> Start
                                    </Button>
                                ) : (
                                    <Button onClick={pauseSimulation} className="flex-1 bg-yellow-500 hover:bg-yellow-600">
                                        <Pause className="w-4 h-4 mr-2" /> Pause
                                    </Button>
                                )}
                                <Button onClick={resetSimulation} variant="outline">
                                    <RotateCcw className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="w-full bg-slate-200 rounded-full h-2.5 mt-2">
                                <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${(progressIndex / (path.length || 1)) * 100}%` }}></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Map Area */}
            <div className="flex-1 relative z-0">
                <MapContainer center={[10.762622, 106.660172]} zoom={13} style={{ height: "100%", width: "100%" }}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; OpenStreetMap contributors'
                    />

                    <MapEventHandler onClick={handleMapClick} mode={mode} />
                    <FitBounds path={path} />

                    {driverLoc && (
                        <Marker position={[driverLoc.lat, driverLoc.lng]} icon={driverIcon}>
                            <Popup>Driver Location</Popup>
                        </Marker>
                    )}

                    {startLoc && (
                        <Marker position={[startLoc.lat, startLoc.lng]} icon={pickupIcon}>
                            <Popup>Start Point</Popup>
                        </Marker>
                    )}

                    {endLoc && (
                        <Marker position={[endLoc.lat, endLoc.lng]} icon={dropoffIcon}>
                            <Popup>Destination</Popup>
                        </Marker>
                    )}

                    {path && (
                        <Polyline positions={path} color="blue" weight={4} opacity={0.6} />
                    )}
                </MapContainer>

                {/* Floating Hint */}
                {mode && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] bg-slate-900/90 text-white px-6 py-2 rounded-full shadow-lg font-medium animate-pulse">
                        Click map to set {mode === 'SET_START' ? 'start point' : mode === 'SET_END' ? 'destination' : 'current location'}
                    </div>
                )}
            </div>
        </div>
    );
}
