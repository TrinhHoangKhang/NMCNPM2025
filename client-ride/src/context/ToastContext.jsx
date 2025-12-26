import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = Date.now().toString();
        setToasts(prev => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    }, []);

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        onClick={() => removeToast(toast.id)}
                        className={`
                            min-w-[300px] p-4 rounded-lg shadow-lg cursor-pointer transform transition-all duration-300 animate-in slide-in-from-right fade-in
                            ${toast.type === 'success' ? 'bg-green-600 text-white' : ''}
                            ${toast.type === 'error' ? 'bg-red-600 text-white' : ''}
                            ${toast.type === 'info' ? 'bg-blue-600 text-white' : ''}
                            ${toast.type === 'warning' ? 'bg-yellow-500 text-white' : ''}
                        `}
                    >
                        <div className="flex items-center justify-between">
                            <p className="font-medium text-sm">{toast.message}</p>
                            <span className="text-xs opacity-70 hover:opacity-100 ml-4">✕</span>
                        </div>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
