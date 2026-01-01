import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in React Leaflet
import L from 'leaflet';
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

// Custom icons for Pickup (Green) and Dropoff (Red)
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

L.Marker.prototype.options.icon = DefaultIcon;

function LocationMarker({ selectionMode, setPickupLocation, setDropoffLocation, setSelectionMode }) {
  const map = useMapEvents({
    click(e) {
      if (selectionMode === 'PICKUP') {
        setPickupLocation({ lat: e.latlng.lat, lng: e.latlng.lng, address: `${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}` });
        setSelectionMode(null); // Exit selection mode after picking
      } else if (selectionMode === 'DROPOFF') {
        setDropoffLocation({ lat: e.latlng.lat, lng: e.latlng.lng, address: `${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}` });
        setSelectionMode(null); // Exit selection mode after picking
      }
    },
  });

  // Change cursor based on selection mode
  useEffect(() => {
    if (selectionMode) {
      map.getContainer().style.cursor = 'crosshair';
    } else {
      map.getContainer().style.cursor = 'grab';
    }
  }, [selectionMode, map]);

  return null;
}

export default function MapComponent({
  pickupLocation, setPickupLocation,
  dropoffLocation, setDropoffLocation,
  selectionMode, setSelectionMode,
  routePath
}) {
  // Default center
  const center = [10.762622, 106.660172];

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer center={center} zoom={13} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <LocationMarker
          selectionMode={selectionMode}
          setPickupLocation={setPickupLocation}
          setDropoffLocation={setDropoffLocation}
          setSelectionMode={setSelectionMode}
        />

        {pickupLocation && (
          <Marker position={[pickupLocation.lat, pickupLocation.lng]} icon={pickupIcon}>
            <Popup>
              Pickup: {pickupLocation.address}
            </Popup>
          </Marker>
        )}

        {dropoffLocation && (
          <Marker position={[dropoffLocation.lat, dropoffLocation.lng]} icon={dropoffIcon}>
            <Popup>
              Dropoff: {dropoffLocation.address}
            </Popup>
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

      {/* Visual Indicator for Selection Mode */}
      {selectionMode && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-slate-900 text-white px-4 py-2 rounded-full shadow-lg font-bold text-sm animate-pulse">
          Click on map to select {selectionMode === 'PICKUP' ? 'Pickup' : 'Dropoff'} Location
        </div>
      )}
    </div>
  );
}
