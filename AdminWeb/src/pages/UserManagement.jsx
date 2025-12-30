
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Assuming GET /api/users returns a list of users
      // We might need to handle pagination in the future
      const response = await axios.get('http://localhost:4000/api/users');
      setUsers(response.data.data || []);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch users", err);
      // Fallback data for demo/dev if backend fails or is empty
      setUsers([
        { _id: '1', name: 'Demo Rider', email: 'rider@example.com', role: 'rider', status: 'active' },
        { _id: '2', name: 'Demo Driver', email: 'driver@example.com', role: 'driver', status: 'active' }
      ]);
      setLoading(false);
      // setError("Could not fetch users");
    }
  };

  if (loading) return <div className="p-10">Loading users...</div>;
  if (error) return <div className="p-10 text-red-500">{error}</div>;

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
        <Badge variant="outline">{users.length} Total Users</Badge>
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
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell className="font-mono text-xs">{user._id.substring(0, 8)}...</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge
                    variant={user.role === 'rider' ? 'default' : 'secondary'}
                    className={user.role === 'rider' ? 'bg-blue-500' : 'bg-green-600'}
                  >
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>{user.status || 'Active'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default UserManagement;
