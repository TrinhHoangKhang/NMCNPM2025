import React from 'react';

const HistoryFilters = ({ filterText, onFilterChange, statusFilter, onStatusChange }) => {
    return (
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h1 className="text-3xl font-bold">
                Trip History
            </h1>

            <div className="flex gap-4 w-full md:w-auto">
                <input
                    type="text"
                    placeholder="Search rider, driver, or location..."
                    value={filterText}
                    onChange={(e) => onFilterChange(e.target.value)}
                    className="border border-gray-300 rounded-lg px-4 py-2 w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <select
                    value={statusFilter}
                    onChange={(e) => onStatusChange(e.target.value)}
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
    );
};

export default HistoryFilters;
