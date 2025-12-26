import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import RideRequestPanel from '../components/RideRequestPanel';
import DashboardLayout from '../components/layout/DashboardLayout';
import ActiveDriversList from '../components/admin/ActiveDriversList';
import AdminMap from '../components/admin/AdminMap';


import { db } from '../config/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

const center = [37.78825, -122.4324]; // [lat, lng]

const AdminDashboard = () => {
    const [drivers, setDrivers] = useState([]);
    const [locations, setLocations] = useState({});

    useEffect(() => {
        // 1. Subscribe to Firestore for real-time presence & status
        const driversRef = collection(db, 'drivers');
        const unsubscribe = onSnapshot(driversRef, (snapshot) => {
            const driversData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setDrivers(driversData);

            // Update legacy locations map if needed for AdminMap
            const locMap = {};
            driversData.forEach(d => {
                if (d.currentLocation && d.is_online) {
                    locMap[d.id] = [d.currentLocation.lng, d.currentLocation.lat];
                }
            });
            setLocations(locMap);
        });

        return () => unsubscribe();
    }, []);

    return (
        <DashboardLayout role="admin" title="Dispatcher Admin" fullWidth>
            <div className="flex h-full relative">
                <ActiveDriversList drivers={drivers} />
                <div className="w-3/4 h-full relative">
                    <RideRequestPanel />
                    <AdminMap drivers={locations} center={center} />
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminDashboard;
