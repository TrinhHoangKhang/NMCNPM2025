import React from 'react';

const HistoryTable = ({ trips, sortConfig, onSort }) => {

    const getClassNamesFor = (name) => {
        if (!sortConfig) return undefined;
        return sortConfig.key === name ? sortConfig.direction : undefined;
    };

    const SortableHeader = ({ label, sortKey, className = "px-6 py-3 cursor-pointer hover:bg-gray-100 transition-colors select-none" }) => (
        <th scope="col" className={className} onClick={() => onSort(sortKey)}>
            <div className="flex items-center gap-1">
                {label}
                {sortConfig?.key === sortKey && (
                    <span>{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                )}
            </div>
        </th>
    );

    return (
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
                    {trips.length === 0 ? (
                        <tr><td colSpan="10" className="text-center py-4">No trips found.</td></tr>
                    ) : (
                        trips.map((trip) => (
                            <tr key={trip._id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">{new Date(trip.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{new Date(trip.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                <td className="px-6 py-4">{trip.rider?.realName || trip.rider?.username || '-'}</td>
                                <td className="px-6 py-4">{trip.driver?.realName || trip.driver?.username || '-'}</td>
                                <td className="px-6 py-4 max-w-xs truncate" title={typeof trip.pickupLocation === 'string' ? trip.pickupLocation : trip.pickupLocation?.address}>
                                    {typeof trip.pickupLocation === 'string' ? trip.pickupLocation : (trip.pickupLocation?.address || 'Map Pin')}
                                </td>
                                <td className="px-6 py-4 max-w-xs truncate" title={typeof trip.dropoffLocation === 'string' ? trip.dropoffLocation : trip.dropoffLocation?.address}>
                                    {typeof trip.dropoffLocation === 'string' ? trip.dropoffLocation : (trip.dropoffLocation?.address || 'Map Pin')}
                                </td>
                                <td className="px-6 py-4 capitalize">{trip.driver?.vehicle?.type || '-'}</td>
                                <td className="px-6 py-4 font-medium text-gray-900">${trip.fare?.toFixed(2)}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${trip.status === 'completed' ? 'bg-green-100 text-green-800' :
                                        trip.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
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
    );
};

export default HistoryTable;
