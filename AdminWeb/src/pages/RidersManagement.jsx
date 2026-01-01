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
import { Search } from 'lucide-react';

const RidersManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async (searchTerm = "") => {
        setLoading(true);
        try {
            const params = { role: 'RIDER' };
            if (searchTerm) params.search = searchTerm;

            if (searchTerm) params.search = searchTerm;
            const response = await apiClient('/users', { params });
            setUsers(response.data || []);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch riders", err);
            // Fallback only if strictly needed, but let's show empty or error
            setLoading(false);
            // setError("Could not fetch riders"); // Let empty list show instead of error
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchUsers(search);
    };

    return (
        <div className="w-full p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight">Riders Management</h1>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">{users.length} Riders</Badge>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-2 w-full max-w-sm">
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
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={5} className="text-center p-4">Loading...</TableCell></TableRow>
                        ) : users.length === 0 ? (
                            <TableRow><TableCell colSpan={5} className="text-center p-4">No riders found</TableCell></TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id || user._id}>
                                    <TableCell className="font-mono text-xs">{(user.id || user._id).substring(0, 8)}...</TableCell>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.phone || 'N/A'}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="bg-green-100 text-green-700">Active</Badge>
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

export default RidersManagement;
