import React, { useEffect, useState } from 'react';
import { apiClient } from '../services/apiService';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Trash2, Search, Eye } from 'lucide-react';

import { useSocket } from '../context/SocketContext';

const DriversManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");

    const socket = useSocket();

    useEffect(() => {
        fetchUsers();
    }, []);

    // REAL-TIME STATUS UPDATES
    useEffect(() => {
        if (!socket) return;

        socket.on('driver_status_update', (data) => {
            console.log("Driver Status Update:", data);
            setUsers(prevUsers => prevUsers.map(user => {
                // Check match by ID (mongo _id or firebase uid)
                const userId = user.id || user._id;
                if (userId === data.driverId) {
                    return { ...user, status: data.status };
                }
                return user;
            }));
        });

        return () => {
            socket.off('driver_status_update');
        };
    }, [socket]);

    const fetchUsers = async (searchTerm = "") => {
        setLoading(true);
        try {
            const params = { role: 'DRIVER' };
            if (searchTerm) params.search = searchTerm;

            const response = await apiClient('/users', { params });
            setUsers(response.data || []);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch drivers", err);
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to remove this driver? This action cannot be undone.")) {
            return;
        }

        try {
            await apiClient(`/users/${userId}`, { method: 'DELETE' });
            // Refresh list
            fetchUsers(search);
        } catch (err) {
            console.error("Failed to delete user", err);
            alert("Failed to delete user: " + err.message);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchUsers(search);
    };

    return (
        <div className="w-full p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight">Drivers Management</h1>
                <Badge variant="outline" className="bg-orange-50 text-orange-700">{users.length} Drivers</Badge>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-2 w-full max-sm:max-w-xs">
                <Input
                    placeholder="Search name, email, phone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <Button type="submit" size="icon"><Search className="h-4 w-4" /></Button>
            </form>

            <div className="border rounded-md bg-white shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center p-8 text-slate-500">
                                    <div className="flex flex-col items-center justify-center">
                                        <Loader2 className="h-8 w-8 animate-spin text-slate-400 mb-2" />
                                        <span>Loading Drivers...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : users.length === 0 ? (
                            <TableRow><TableCell colSpan={6} className="text-center p-4">No drivers found</TableCell></TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id || user._id}>
                                    <TableCell className="font-mono text-xs">{(user.id || user._id).substring(0, 8)}...</TableCell>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.phone || 'N/A'}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={user.status === 'ONLINE' ? 'default' : 'secondary'}
                                            className={
                                                user.status === 'ONLINE'
                                                    ? "bg-green-100 text-green-700 hover:bg-green-100"
                                                    : "bg-slate-100 text-slate-700 hover:bg-slate-100"
                                            }
                                        >
                                            {user.status || 'OFFLINE'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right flex justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => window.location.href = `/drivers/${user.id || user._id}`}
                                        >
                                            <Eye className="h-4 w-4 text-blue-500" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => handleDeleteUser(user.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default DriversManagement;
