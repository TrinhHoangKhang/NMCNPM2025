import React from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../lib/axios';
import { formatDate, formatTime, formatCurrency } from '../utils/formatters';
import { getNestedValue, getStatusBadgeClass, formatLocation } from '../utils/helpers';

const HistoryPage = () => {
    const [trips, setTrips] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const { user } = React.useContext(AuthContext);

    React.useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await api.get('/api/rides/history');

                if (response.data) {
                    setTrips(response.data);
                }
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const [sortConfig, setSortConfig] = React.useState({ key: 'createdAt', direction: 'descending' });
    const [filterText, setFilterText] = React.useState('');
    const [statusFilter, setStatusFilter] = React.useState('all');

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const sortedTrips = React.useMemo(() => {
        let sortableItems = [...trips];

        // 1. Filter
        if (statusFilter !== 'all') {
            sortableItems = sortableItems.filter(trip => trip.status === statusFilter);
        }

        if (filterText) {
            const lowerText = filterText.toLowerCase();
            sortableItems = sortableItems.filter(trip => {
                const riderName = trip.rider?.realName || trip.rider?.username || '';
                const driverName = trip.driver?.realName || trip.driver?.username || '';
                const pickup = formatLocation(trip.pickupLocation);
                const dropoff = formatLocation(trip.dropoffLocation);

                return riderName.toLowerCase().includes(lowerText) ||
                    driverName.toLowerCase().includes(lowerText) ||
                    pickup.toLowerCase().includes(lowerText) ||
                    dropoff.toLowerCase().includes(lowerText);
            });
        }

        // 2. Sort
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                let aValue, bValue;

                switch (sortConfig.key) {
                    case 'rider':
                        aValue = a.rider?.realName || a.rider?.username || '';
                        bValue = b.rider?.realName || b.rider?.username || '';
                        break;
                    case 'driver':
                        aValue = a.driver?.realName || a.driver?.username || '';
                        bValue = b.driver?.realName || b.driver?.username || '';
                        break;
                    case 'pickup':
                        aValue = formatLocation(a.pickupLocation);
                        bValue = formatLocation(b.pickupLocation);
                        break;
                    case 'dropoff':
                        aValue = formatLocation(a.dropoffLocation);
                        bValue = formatLocation(b.dropoffLocation);
                        break;
                    case 'transport':
                        aValue = a.driver?.vehicle?.type || '';
                        bValue = b.driver?.vehicle?.type || '';
                        break;
                    case 'cost':
                        aValue = a.fare || 0;
                        bValue = b.fare || 0;
                        break;
                    default:
                        aValue = getNestedValue(a, sortConfig.key);
                        bValue = getNestedValue(b, sortConfig.key);
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [trips, sortConfig, filterText, statusFilter]);

    const SortableHeader = ({ label, sortKey, className = "px-6 py-3 cursor-pointer hover:bg-gray-100 transition-colors select-none" }) => (
        <th scope="col" className={className} onClick={() => requestSort(sortKey)} title={`Sort by ${label}`}>
            <div className="flex items-center gap-1">
                {label}
                {sortConfig.key === sortKey && (
                    <span>{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                )}
            </div>
        </th>
    );

    if (loading) return <div className="p-8 text-center">Loading history...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold">
                    Trip History
                </h1>

                <div className="flex gap-4 w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Search rider, driver, or location..."
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                        className="border border-gray-300 rounded-lg px-4 py-2 w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="all">All Statuses</option>
                        <option value="requested">Requested</option>
                        <option value="accepted">Accepted</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>
            <div className="overflow-x-auto shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <SortableHeader label="Date" sortKey="createdAt" />
                            <SortableHeader label="Time" sortKey="createdAt" />
                            <SortableHeader label="Rider" sortKey="rider" />
                            <SortableHeader label="Driver" sortKey="driver" />
                            <SortableHeader label="Pickup" sortKey="pickup" />
                            <SortableHeader label="Dropoff" sortKey="dropoff" />
                            <SortableHeader label="Transport" sortKey="transport" />
                            <SortableHeader label="Cost" sortKey="cost" />
                            <SortableHeader label="Status" sortKey="status" />
                            <SortableHeader label="Rating" sortKey="rating" />
                        </tr>
                    </thead>
                    <tbody>
                        {sortedTrips.length === 0 ? (
                            <tr><td colSpan="10" className="text-center py-4">No trips found.</td></tr>
                        ) : (
                            sortedTrips.map((trip) => (
                                <tr key={trip._id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">{formatDate(trip.createdAt)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{formatTime(trip.createdAt)}</td>
                                    <td className="px-6 py-4">{trip.rider?.realName || trip.rider?.username || '-'}</td>
                                    <td className="px-6 py-4">{trip.driver?.realName || trip.driver?.username || '-'}</td>
                                    <td className="px-6 py-4 max-w-xs truncate" title={formatLocation(trip.pickupLocation)}>
                                        {formatLocation(trip.pickupLocation)}
                                    </td>
                                    <td className="px-6 py-4 max-w-xs truncate" title={formatLocation(trip.dropoffLocation)}>
                                        {formatLocation(trip.dropoffLocation)}
                                    </td>
                                    <td className="px-6 py-4 capitalize">{trip.driver?.vehicle?.type || '-'}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{formatCurrency(trip.fare)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(trip.status)}`}>
                                            {trip.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {trip.rating ? (
                                            <span className="flex items-center">
                                                ★ {trip.rating}
                                            </span>
                                        ) : '-'}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default HistoryPage;
