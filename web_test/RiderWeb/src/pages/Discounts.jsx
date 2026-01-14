
import React, { useEffect, useState } from 'react';
import { apiClient } from '../services/apiService';
import { Tag, CheckCircle2, AlertCircle, Sparkles, X, Info } from 'lucide-react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const Discounts = () => {
    const [discounts, setDiscounts] = useState([]);
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(true);
    const [claiming, setClaiming] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [selectedDiscount, setSelectedDiscount] = useState(null);

    useEffect(() => {
        fetchMyDiscounts();
    }, []);

    const fetchMyDiscounts = async () => {
        try {
            const response = await apiClient('/discounts');
            setDiscounts(response || []);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch discounts", err);
            setLoading(false);
        }
    };

    const handleClaim = async (e) => {
        e.preventDefault();
        if (!code.trim()) return;

        setClaiming(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await apiClient('/discounts/claim', {
                method: 'POST',
                body: { code: code.trim() }
            });

            setMessage({ type: 'success', text: response.message || "Đã nhận mã thành công!" });
            setCode('');
            fetchMyDiscounts(); // Refresh list
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || "Không thể nhận mã" });
        } finally {
            setClaiming(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 border-b pb-4">Mã giảm giá của tôi</h1>
                <p className="text-slate-500">Nhập mã khuyến mãi hoặc ID để nhận thêm ưu đãi cho chuyến đi tiếp theo.</p>
            </div>

            {/* Claim Section */}
            <div className="bg-gradient-to-br from-indigo-50 to-violet-50 p-8 rounded-2xl border border-indigo-100 shadow-sm">
                <form onSubmit={handleClaim} className="flex gap-3 max-w-md">
                    <div className="relative flex-1">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Nhập mã (WELCOME) hoặc ID"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="pl-10 h-12 bg-white border-indigo-200 focus:ring-indigo-500"
                        />
                    </div>
                    <Button
                        disabled={claiming}
                        className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700 font-bold"
                    >
                        {claiming ? 'Đang kiểm tra...' : 'Nhận mã'}
                    </Button>
                </form>

                {message.text && (
                    <div className={`mt-4 flex items-center gap-2 text-sm font-medium ${message.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {message.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                        {message.text}
                    </div>
                )}
            </div>

            {/* List Section */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-amber-500" />
                    Mã của bạn ({discounts.length})
                </h2>

                {loading ? (
                    <div className="text-center py-12 text-slate-400">Đang tải danh sách...</div>
                ) : discounts.length === 0 ? (
                    <div className="bg-slate-50 border border-dashed rounded-xl py-12 text-center text-slate-400">
                        Bạn chưa có mã giảm giá nào. Hãy thử nhập mã ở trên!
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {discounts.map((discount) => (
                            <div
                                key={discount.id}
                                onClick={() => setSelectedDiscount(discount)}
                                className="group relative bg-white p-5 rounded-xl border border-slate-200 hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer active:scale-[0.98]"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <div className="inline-flex bg-indigo-50 text-indigo-700 text-xs font-bold px-2 py-1 rounded-md tracking-wider">
                                            {discount.code}
                                        </div>
                                        <h3 className="font-bold text-slate-800">{discount.description}</h3>
                                        <p className="text-xs text-slate-500">
                                            Hết hạn: {new Date(discount.expiryDate).toLocaleDateString('vi-VN')}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-black text-indigo-600">
                                            {discount.type === 'PERCENT' ? `-${discount.value}%` : `-${(discount.value / 1000).toFixed(0)}k`}
                                        </div>
                                        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">OFF</div>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                                    <span className="text-[10px] text-indigo-500 font-medium flex items-center gap-1">
                                        <Info className="h-3 w-3" /> Chi tiết ưu đãi
                                    </span>
                                    <Tag className="h-3 w-3 text-slate-200 group-hover:text-indigo-200" />
                                </div>
                                {/* Decorative circles for "ticket" look */}
                                <div className="absolute -left-2 top-1/2 -translate-y-1/2 h-4 w-4 bg-slate-50 rounded-full border-r shadow-inner"></div>
                                <div className="absolute -right-2 top-1/2 -translate-y-1/2 h-4 w-4 bg-slate-50 rounded-full border-l shadow-inner"></div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Rider Detail Modal */}
            {selectedDiscount && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-300">
                        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 text-white relative">
                            <button
                                onClick={() => setSelectedDiscount(null)}
                                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                            <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                                <Tag className="h-8 w-8 text-white" />
                            </div>
                            <h2 className="text-3xl font-black mb-1">{selectedDiscount.code}</h2>
                            <p className="text-indigo-100 font-medium">{selectedDiscount.description}</p>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Chi tiết ưu đãi</h4>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                        <span className="text-sm font-medium text-slate-600">Giảm tối đa</span>
                                        <span className="font-bold text-indigo-600">
                                            {selectedDiscount.maxDiscount ? `${selectedDiscount.maxDiscount.toLocaleString()}đ` : 'Không giới hạn'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                        <span className="text-sm font-medium text-slate-600">Đơn hàng tối thiểu</span>
                                        <span className="font-bold text-slate-900">{selectedDiscount.minOrderValue?.toLocaleString() || 0}đ</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-100 italic text-center">
                                <p className="text-xs text-slate-400">
                                    Hạn sử dụng đến {new Date(selectedDiscount.expiryDate).toLocaleDateString('vi-VN')}
                                </p>
                            </div>

                            <Button
                                onClick={() => setSelectedDiscount(null)}
                                className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all active:scale-95"
                            >
                                Đóng
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Discounts;
