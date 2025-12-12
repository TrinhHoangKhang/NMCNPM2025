import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import RideRequestPanel from '../components/RideRequestPanel';
import DashboardLayout from '../components/layout/DashboardLayout';
import ActiveDriversList from '../components/admin/ActiveDriversList';
import AdminMap from '../components/admin/AdminMap';



const center = [37.78825, -122.4324]; // [lat, lng]

const AdminDashboard = () => {
    const [drivers, setDrivers] = useState({});
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const apiUrl = import.meta.env.VITE_API_URL;
        const newSocket = io(apiUrl);
        setSocket(newSocket);

        newSocket.on('driver_update', (data) => {
            setDrivers(prev => ({
                ...prev,
                [data.driverId]: data.location
            }));
        });

        return () => newSocket.close();
    }, []);

    return (
        <DashboardLayout role="admin" title="Dispatcher Admin" fullWidth>
            <div className="flex h-full relative">
                <ActiveDriversList drivers={drivers} />
                <div className="w-3/4 h-full relative">
                    <RideRequestPanel />
                    <AdminMap drivers={drivers} center={center} />
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminDashboard;
