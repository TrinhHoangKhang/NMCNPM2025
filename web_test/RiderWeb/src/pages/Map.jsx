import BookingForm from "@/components/BookingForm";
import MapComponent from "@/components/MapComponent";
import { useState } from "react";

export default function Map() {
  const [pickupLocation, setPickupLocation] = useState({ lat: 10.762622, lng: 106.660172, address: "University of Science" });
  const [dropoffLocation, setDropoffLocation] = useState({ lat: 10.7769, lng: 106.7009, address: "Ben Thanh Market" });
  const [selectionMode, setSelectionMode] = useState(null); // 'PICKUP' or 'DROPOFF' or null
  const [routePath, setRoutePath] = useState(null);

  const handleCreatePath = (path) => {
    if (path) {
      setRoutePath(path);
    } else if (pickupLocation && dropoffLocation) {
      setRoutePath([
        [pickupLocation.lat, pickupLocation.lng],
        [dropoffLocation.lat, dropoffLocation.lng]
      ]);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden bg-slate-100">
      {/* Booking Form Side */}
      <div className="w-full md:w-[400px] h-full p-4 overflow-y-auto z-10 shadow-xl bg-white relative">
        <BookingForm
          pickupLocation={pickupLocation}
          setPickupLocation={setPickupLocation}
          dropoffLocation={dropoffLocation}
          setDropoffLocation={setDropoffLocation}
          selectionMode={selectionMode}
          setSelectionMode={setSelectionMode}
          onCreatePath={handleCreatePath}
        />
      </div>

      {/* Map Side */}
      <div className="flex-1 relative">
        <MapComponent
          pickupLocation={pickupLocation}
          setPickupLocation={setPickupLocation}
          dropoffLocation={dropoffLocation}
          setDropoffLocation={setDropoffLocation}
          selectionMode={selectionMode}
          setSelectionMode={setSelectionMode}
          routePath={routePath}
        />
      </div>
    </div>
  );
}