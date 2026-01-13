import React, { useState, useEffect } from 'react';
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
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from 'lucide-react';

const AdminsManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await apiClient('/users', { params: { role: 'ADMIN' } });
            setUsers(response.data || []);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch admins", err);
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to remove this admin? This action cannot be undone.")) {
            return;
        }

        try {
            await apiClient(`/users/${userId}`, { method: 'DELETE' });
            // Refresh list
            fetchUsers();
        } catch (err) {
            console.error("Failed to delete user", err);
            alert("Failed to delete user: " + err.message);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400 mb-2" />
                <span className="text-slate-500">Loading admins...</span>
            </div>
        );
    }

    return (
        <div className="w-full p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight">Admins Management</h1>
                <Badge variant="outline" className="bg-purple-50 text-purple-700">{users.length} Admins</Badge>
            </div>

            <div className="border rounded-md bg-white shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.length === 0 ? (
                            <TableRow><TableCell colSpan={6} className="text-center p-4">No admins found</TableCell></TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id || user._id}>
                                    <TableCell className="font-mono text-xs">{(user.id || user._id || '').substring(0, 8)}...</TableCell>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Badge variant="default" className="bg-purple-600">
                                            {user.role}
                                        </Badge>
                                    </TableCell>
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
                                    <TableCell className="text-right">
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

export default AdminsManagement;
