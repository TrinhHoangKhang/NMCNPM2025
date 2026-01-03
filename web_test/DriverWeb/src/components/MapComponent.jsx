import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in React Leaflet
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

// Custom icons
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

// Driver icon (Blue/Default or Car)
const driverIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Helper to auto-fit bounds
function FitBounds({ pickup, dropoff, driver }) {
    const map = useMap();

    useEffect(() => {
        const bounds = L.latLngBounds();
        if (pickup) bounds.extend([pickup.lat, pickup.lng]);
        if (dropoff) bounds.extend([dropoff.lat, dropoff.lng]);
        if (driver) bounds.extend([driver.lat, driver.lng]);

        if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [pickup, dropoff, driver, map]);

    return null;
}

export default function MapComponent({
    pickupLocation,
    dropoffLocation,
    driverLocation,
    routePath
}) {
    // Default center (HCMC)
    const defaultCenter = [10.762622, 106.660172];
    const center = driverLocation ? [driverLocation.lat, driverLocation.lng] : defaultCenter;

    return (
        <div className="w-full h-full relative z-0">
            <MapContainer center={center} zoom={13} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <FitBounds pickup={pickupLocation} dropoff={dropoffLocation} driver={driverLocation} />

                {driverLocation && (
                    <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon} zIndexOffset={100}>
                        <Popup>You (Driver)</Popup>
                    </Marker>
                )}

                {pickupLocation && (
                    <Marker position={[pickupLocation.lat, pickupLocation.lng]} icon={pickupIcon}>
                        <Popup>Pickup: {pickupLocation.address}</Popup>
                    </Marker>
                )}

                {dropoffLocation && (
                    <Marker position={[dropoffLocation.lat, dropoffLocation.lng]} icon={dropoffIcon}>
                        <Popup>Dropoff: {dropoffLocation.address}</Popup>
                    </Marker>
                )}

                {routePath && (
                    <Polyline
                        positions={routePath}
                        color="blue"
                        dashArray="10, 10"
                        weight={4}
                    />
                )}
            </MapContainer>
        </div>
    );
}
