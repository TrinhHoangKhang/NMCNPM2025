import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import MapRouting from '../shared/MapRouting';
import MapDriverUpdater from '../shared/MapDriverUpdater';
import api from '../../lib/axios';

// Custom Icons using SVG Data URIs
const createIcon = (color) => {
    return L.icon({
        iconUrl: `data:image/svg+xml;base64,${btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36">
                <path fill="${color}" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
        `)}`,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36]
    });
};

const greenIcon = createIcon('#10B981'); // Emerald 500
const redIcon = createIcon('#EF4444');   // Red 500
const blueIcon = createIcon('#3B82F6');  // Blue 500
const carIcon = createIcon('#F59E0B'); // Amber 500 (Taxi/Driver)

const defaultCenter = [37.7749, -122.4194]; // San Francisco Default

// Component to handle map clicks
const MapClickHandler = ({ activeField, setTempSelection }) => {
    useMapEvents({
        click: async (e) => {
            if (!activeField) return;
            const { lat, lng } = e.latlng;
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
                );
                const data = await response.json();
                setTempSelection({ lat, lon: lng, displayName: data.display_name });
            } catch (err) {
                console.error("Geocoding failed", err);
            }
        },
    });
    return null;
};



const RiderMap = ({
    activeField,
    pickup,
    dropoff,
    route,
    setRoute,
    tempSelection,
    setTempSelection,
    confirmLocation,
    availableDrivers,
    setAvailableDrivers
}) => {
    return (
        <div className="w-2/3 relative h-full">
            {/* Fixed Overlay for Selection Confirmation */}
            {tempSelection && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-white text-gray-900 p-4 rounded-lg shadow-2xl border border-gray-200 flex flex-col items-center gap-3 max-w-lg w-10/12 animate-in slide-in-from-top">
                    <div className="text-center">
                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">Selected Location</span>
                    </div>
                    <p className="font-medium text-sm text-center leading-tight">{tempSelection.displayName}</p>
                    <button
                        onClick={confirmLocation}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2 px-6 rounded-full shadow transition hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                        Choose Location
                    </button>
                </div>
            )}

            <MapContainer
                center={defaultCenter}
                zoom={13}
                style={{ height: '100%', width: '100%', cursor: activeField ? 'crosshair' : 'grab' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Logic Components */}
                <MapClickHandler activeField={activeField} setTempSelection={setTempSelection} />
                <MapDriverUpdater setAvailableDrivers={setAvailableDrivers} />
                <MapRouting start={pickup} end={dropoff} setRoute={setRoute} />

                {/* Temporary Selection Marker */}
                {tempSelection && (
                    <Marker position={[tempSelection.lat, tempSelection.lon]} icon={blueIcon} />
                )}

                {/* Markers */}
                {pickup && <Marker position={[pickup.lat, pickup.lon]} icon={greenIcon}><Popup>Pickup: {pickup.displayName}</Popup></Marker>}
                {dropoff && <Marker position={[dropoff.lat, dropoff.lon]} icon={redIcon}><Popup>Dropoff: {dropoff.displayName}</Popup></Marker>}

                {/* Available Drivers Markers */}
                {availableDrivers.map(driver => (
                    <Marker
                        key={driver.id}
                        position={[driver.lat, driver.lng]}
                        icon={carIcon}
                    >
                        <Popup>
                            <div className="text-center">
                                <p className="font-bold">{driver.name}</p>
                                <p className="text-xs text-gray-500 capitalize">{driver.vehicle}</p>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* Route Path */}
                {route && route.coordinates && (
                    <Polyline positions={route.coordinates} color="blue" weight={5} opacity={0.7} />
                )}
            </MapContainer>
        </div>
    );
};

export default RiderMap;
