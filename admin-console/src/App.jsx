import React, { useState, useEffect } from 'react';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3002/api',
});

const App = () => {
  const [users, setUsers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [isLocalhost, setIsLocalhost] = useState(true);

  useEffect(() => {
    const hostname = window.location.hostname;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      setIsLocalhost(false);
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, driversRes] = await Promise.all([
        api.get('/dev/users').catch(() => ({ data: { data: [] } })),
        api.get('/dev/drivers').catch(() => ({ data: { data: [] } }))
      ]);

      if (usersRes?.data?.data) setUsers(usersRes.data.data);
      if (driversRes?.data?.data) setDrivers(driversRes.data.data);
    } catch (error) {
      console.error('Failed to fetch dev data:', error);
      setUsers([]);
      setDrivers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
    try {
      await api.delete(`/dev/${type}/${id}`);
      fetchData();
    } catch (error) {
      alert('Delete failed');
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await api.patch(`/dev/user/${userId}`, { role: newRole });
      fetchData();
    } catch (error) {
      alert('Update failed');
    }
  };

  if (!isLocalhost) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">The Admin Console is only accessible on <code className="bg-gray-200 px-1 rounded">localhost</code> for security.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin</h1>
            <p className="text-gray-500 mt-1">Management dashboard for development environment</p>
          </div>
          <button
            onClick={fetchData}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition shadow-sm font-medium"
          >
            Refresh Data
          </button>
        </div>

        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'users' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('users')}
          >
            Users ({users?.length || 0})
          </button>
          <button
            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'drivers' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('drivers')}
          >
            Drivers ({drivers?.length || 0})
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Basic Info</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role / Online</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Activity</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activeTab === 'users' ? (
                  users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs font-mono text-gray-400 truncate w-24">
                          {user.id}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                        <div className="text-xs text-gray-500">{user.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                          {user.role}
                        </span>
                        <div className="mt-1 flex items-center">
                          <span className={`h-2 w-2 rounded-full mr-1.5 ${user.is_online ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                          <span className="text-xs text-gray-500">{user.is_online ? 'Online' : 'Offline'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                        {user.last_seen_at ? new Date(user.last_seen_at._seconds * 1000).toLocaleString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <select
                            onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                            className="text-xs border rounded p-1"
                            value={user.role}
                          >
                            <option value="RIDER">To Rider</option>
                            <option value="DRIVER">To Driver</option>
                            <option value="ADMIN">To Admin</option>
                          </select>
                          <button
                            onClick={() => handleDelete('user', user.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  drivers.map(driver => (
                    <tr key={driver.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-400">
                        {driver.id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{driver.name}</div>
                        <div className="text-xs text-gray-500">{driver.email}</div>
                        {driver.vehicle && <div className="text-[10px] text-indigo-600 font-semibold">{driver.vehicle.model} - {driver.vehicle.plateNumber}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${driver.status === 'ONLINE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {driver.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                        {driver.last_seen_at ? new Date(driver.last_seen_at._seconds * 1000).toLocaleString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDelete('driver', driver.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className="mt-10 text-center text-gray-400 text-xs">
        &copy; 2025 RideGo Development Tools
      </div>
    </div>
  );
};

export default App;
