import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getUsers, getUserById, deleteUser } from '../services/userService';
import DashboardLayout from '../components/layout/DashboardLayout';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const { user: authUser, loading: authLoading } = useContext(AuthContext); // Renamed to avoid conflict
    const navigate = useNavigate();

    // Auth check for redirection
    useEffect(() => {
        if (!authLoading && !authUser) {
            navigate('/login');
        }
    }, [authUser, authLoading, navigate]);

    useEffect(() => {
        const loadUsers = async () => {
            if (!authUser) return; // Only load users if authenticated
            try {
                const data = await getUsers();
                setUsers(data);
            } catch (error) {
                console.error("Failed to load users", error);
            } finally {
                setLoading(false);
            }
        };
        loadUsers();
    }, [authUser]); // Depend on authUser to trigger fetch after login

    const handleViewUser = async (userId) => {
        setModalLoading(true);
        setIsModalOpen(true);
        try {
            const data = await getUserById(userId);
            // Handling unified response where data might be { user: ..., driver: ... } or just user object
            const fullUserData = data.user || data;
            if (data.driver) fullUserData.driverDetails = data.driver;
            setSelectedUser(fullUserData);
        } catch (error) {
            console.error("Failed to fetch user details", error);
            alert("Could not load user details.");
            setIsModalOpen(false);
        } finally {
            setModalLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (confirm("Are you sure you want to delete this user?")) {
            try {
                await deleteUser(id);
                setUsers(users.filter(user => user._id !== id));
            } catch (error) {
                console.error("Failed to delete user", error);
            }
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Users...</div>;

    return (
        <DashboardLayout role="admin" title="User Management">
            <div className="bg-white overflow-hidden shadow-lg border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user._id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            <img className="h-10 w-10 rounded-full object-cover shadow-sm"
                                                src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.username}&background=random`}
                                                alt="" />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{user.realName || user.username}</div>
                                            <div className="text-xs text-gray-500">@{user.username}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-red-100 text-red-800' :
                                        user.role === 'driver' ? 'bg-green-100 text-green-800' :
                                            'bg-blue-100 text-blue-800'
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {user.role === 'driver' ? (
                                        <span className={`px-2 py-0.5 rounded text-xs ${user.status === 'available' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-50 text-gray-600 border border-gray-200'}`}>
                                            {user.status || 'Offline'}
                                        </span>
                                    ) : '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button onClick={() => handleViewUser(user._id)} className="text-indigo-600 hover:text-indigo-900 mr-4">View</button>
                                    <button onClick={() => handleDelete(user._id)} className="text-red-600 hover:text-red-900">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </DashboardLayout>
    );
};

export default UserManagement;
