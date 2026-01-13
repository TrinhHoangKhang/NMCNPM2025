
import React, { useEffect, useState } from 'react';
import { apiClient } from '../services/apiService';
import { Plus, Minus, Tag, Info, Power, X } from 'lucide-react';

const DiscountsManagement = () => {
    const [discounts, setDiscounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDiscount, setSelectedDiscount] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newDiscount, setNewDiscount] = useState({
        code: '',
        description: '',
        type: 'PERCENT',
        value: 0,
        maxDiscount: 0,
        minOrderValue: 0,
        expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        count: 100
    });

    useEffect(() => {
        fetchDiscounts();
    }, []);

    const fetchDiscounts = async () => {
        try {
            const response = await apiClient('/discounts');
            setDiscounts(response || []);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch discounts", err);
            setLoading(false);
        }
    };

    const handleCreateDiscount = async (e) => {
        e.preventDefault();
        try {
            const response = await apiClient('/discounts', {
                method: 'POST',
                body: {
                    ...newDiscount,
                    value: Number(newDiscount.value),
                    maxDiscount: Number(newDiscount.maxDiscount),
                    minOrderValue: Number(newDiscount.minOrderValue),
                    count: Number(newDiscount.count),
                    expiryDate: new Date(newDiscount.expiryDate).toISOString()
                }
            });

            if (response.discount) {
                setDiscounts([response.discount, ...discounts]);
                setIsCreateModalOpen(false);
                setNewDiscount({
                    code: '',
                    description: '',
                    type: 'PERCENT',
                    value: 0,
                    maxDiscount: 0,
                    minOrderValue: 0,
                    expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
                    count: 100
                });
            }
        } catch (err) {
            console.error("Failed to create discount", err);
            alert("Error: " + (err.response?.data?.error || err.message));
        }
    };

    const updateCount = async (id, delta) => {
        try {
            const discount = discounts.find(d => d.id === id);
            const newCount = Math.max(0, (discount.count || 0) + delta);

            const response = await apiClient(`/discounts/${id}`, {
                method: 'PATCH',
                body: { count: newCount }
            });

            if (response.discount) {
                setDiscounts(discounts.map(d =>
                    d.id === id ? response.discount : d
                ));
            }
        } catch (err) {
            console.error("Failed to update discount count", err);
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        try {
            const newStatus = !currentStatus;
            const response = await apiClient(`/discounts/${id}`, {
                method: 'PATCH',
                body: { isActive: newStatus }
            });

            if (response.discount) {
                setDiscounts(discounts.map(d =>
                    d.id === id ? response.discount : d
                ));
            }
        } catch (err) {
            console.error("Failed to toggle status", err);
        }
    };

    if (loading) return <div className="p-6 text-center text-gray-500">Loading discounts...</div>;

    return (
        <div className="w-full p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Tag className="h-6 w-6 text-blue-600" />
                    Discount Management
                </h1>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
                >
                    <Plus className="h-5 w-5" />
                    Add Discount
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {discounts.map((discount) => (
                    <div key={discount.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between group">
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <span className="bg-blue-50 text-blue-700 font-mono font-bold px-2 py-1 rounded text-sm tracking-wider uppercase">
                                    {discount.code}
                                </span>
                                <div className="text-[10px] text-gray-400 font-mono select-all">
                                    ID: {discount.id}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setSelectedDiscount(discount)}
                                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                    >
                                        <Info className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => toggleStatus(discount.id, discount.isActive)}
                                        className={`p-1 transition-colors ${discount.isActive ? 'text-green-500 hover:text-red-500' : 'text-gray-300 hover:text-green-500'}`}
                                    >
                                        <Power className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            <h3 className="text-gray-900 font-semibold mb-1">{discount.description}</h3>
                            <p className="text-gray-500 text-sm mb-4">
                                {discount.type === 'PERCENT' ? `${discount.value}% Reduction` : `${discount.value.toLocaleString()} VND off`}
                            </p>
                        </div>

                        <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                            <div className="text-sm">
                                <span className="text-gray-500">Quantity:</span>
                                <span className="ml-2 font-bold text-lg">{discount.count || 0}</span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => updateCount(discount.id, -1)}
                                    className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                                >
                                    <Minus className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => updateCount(discount.id, 1)}
                                    className="p-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200 my-8">
                        <div className="p-6 border-b flex justify-between items-center">
                            <h2 className="text-xl font-bold">Create New Discount</h2>
                            <button onClick={() => setIsCreateModalOpen(false)} className="p-1 hover:bg-gray-100 rounded-full">
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateDiscount} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Code</label>
                                    <input
                                        required
                                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="E.g. SUMMER2024"
                                        value={newDiscount.code}
                                        onChange={e => setNewDiscount({ ...newDiscount, code: e.target.value.toUpperCase() })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Type</label>
                                    <select
                                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={newDiscount.type}
                                        onChange={e => setNewDiscount({ ...newDiscount, type: e.target.value })}
                                    >
                                        <option value="PERCENT">Percentage (%)</option>
                                        <option value="FIXED">Fixed Amount (VND)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                                <input
                                    required
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Enter discount description..."
                                    value={newDiscount.description}
                                    onChange={e => setNewDiscount({ ...newDiscount, description: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Value</label>
                                    <input
                                        required
                                        type="number"
                                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={newDiscount.value}
                                        onChange={e => setNewDiscount({ ...newDiscount, value: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Quantity (Count)</label>
                                    <input
                                        required
                                        type="number"
                                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={newDiscount.count}
                                        onChange={e => setNewDiscount({ ...newDiscount, count: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Min Spend (VND)</label>
                                    <input
                                        type="number"
                                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={newDiscount.minOrderValue}
                                        onChange={e => setNewDiscount({ ...newDiscount, minOrderValue: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Max Discount (VND)</label>
                                    <input
                                        type="number"
                                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="0 for no limit"
                                        value={newDiscount.maxDiscount}
                                        onChange={e => setNewDiscount({ ...newDiscount, maxDiscount: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Expiry Date</label>
                                <input
                                    required
                                    type="date"
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={newDiscount.expiryDate}
                                    onChange={e => setNewDiscount({ ...newDiscount, expiryDate: e.target.value })}
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="flex-1 px-4 py-2 border rounded-lg font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
                                >
                                    Create Discount
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {selectedDiscount && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="bg-blue-600 p-6 text-white relative">
                            <button
                                onClick={() => setSelectedDiscount(null)}
                                className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                            <Tag className="h-10 w-10 mb-4 opacity-80" />
                            <h2 className="text-2xl font-bold">{selectedDiscount.code}</h2>
                            <p className="text-[10px] opacity-70 font-mono">ID: {selectedDiscount.id}</p>
                            <p className="opacity-90">{selectedDiscount.description}</p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-500 uppercase font-bold">Type</p>
                                    <p className="font-semibold">{selectedDiscount.type}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-500 uppercase font-bold">Value</p>
                                    <p className="font-semibold text-blue-600">
                                        {selectedDiscount.type === 'PERCENT' ? `${selectedDiscount.value}%` : `${selectedDiscount.value.toLocaleString()} VND`}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-500 uppercase font-bold">Min Spend</p>
                                    <p className="font-semibold">{selectedDiscount.minOrderValue?.toLocaleString() || 0} VND</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-500 uppercase font-bold">Max Cap</p>
                                    <p className="font-semibold">{selectedDiscount.maxDiscount?.toLocaleString() || 'No limit'} VND</p>
                                </div>
                            </div>
                            <div className="pt-4 border-t">
                                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Expires On</p>
                                <p className="font-semibold">{new Date(selectedDiscount.expiryDate).toLocaleString()}</p>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                <span className="text-sm font-medium text-gray-700">Status</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${selectedDiscount.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {selectedDiscount.isActive ? 'ACTIVE' : 'INACTIVE'}
                                </span>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 flex justify-end">
                            <button
                                onClick={() => setSelectedDiscount(null)}
                                className="px-6 py-2 bg-white border border-gray-200 rounded-lg font-bold text-gray-700 hover:bg-gray-100 transition-colors shadow-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DiscountsManagement;
