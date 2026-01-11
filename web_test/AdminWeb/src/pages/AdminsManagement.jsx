
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

const AdminsManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await apiClient('/users', { params: { role: 'ADMIN' } });
            setUsers(response.data || []);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch admins", err);
            // Fallback
            setUsers([]);
            setLoading(false);
        }
    };

    if (loading) return <div className="p-10">Loading admins...</div>;
    if (error) return <div className="p-10 text-red-500">{error}</div>;

    return (
        <div className="w-full p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight">Admins Management</h1>
                <Badge variant="outline">{users.length} Admins</Badge>
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
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.length === 0 ? (
                            <TableRow><TableCell colSpan={5} className="text-center p-4">No admins found</TableCell></TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id || user._id}>
                                    <TableCell className="font-mono text-xs">{(user.id || user._id || '').substring(0, 8)}...</TableCell>
                                    <TableCell>{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Badge variant="default" className="bg-purple-600">
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{user.status || 'Active'}</TableCell>
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
