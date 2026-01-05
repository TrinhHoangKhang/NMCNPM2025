import { useState } from 'react';

/**
 * Basic useToast hook to satisfy build requirements
 */
export const useToast = () => {
    const [toasts, setToasts] = useState([]);

    const showToast = (title, description, variant = 'default') => {
        const id = Date.now().toString();
        const newToast = { id, title, description, variant };
        setToasts((prev) => [...prev, newToast]);

        // Log for debugging since we don't have a UI for it yet
        console.log(`[Toast ${variant}]: ${title} - ${description}`);

        // Auto dismiss after 3 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    };

    return { showToast, toasts };
};
