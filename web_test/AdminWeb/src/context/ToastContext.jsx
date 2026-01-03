import { createContext, useContext, useState, useCallback } from "react";
import * as Toast from "@radix-ui/react-toast";
import { X } from "lucide-react";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState("info"); // info, success, error, warning

    const showToast = useCallback((msgTitle, msgDescription = "", msgType = "info") => {
        setTitle(msgTitle);
        setDescription(msgDescription);
        setType(msgType);
        setOpen(true);
    }, []);

    // Determine toast styles based on type
    const getToastStyles = () => {
        switch (type) {
            case "success": return "bg-green-100 border-green-500 text-green-900";
            case "error": return "bg-red-100 border-red-500 text-red-900";
            case "warning": return "bg-yellow-100 border-yellow-500 text-yellow-900";
            default: return "bg-white border-gray-200 text-gray-900";
        }
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            <Toast.Provider swipeDirection="right">
                {children}
                <Toast.Root
                    className={`group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:animate-in data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full sm:w-full md:max-w-[420px] ${getToastStyles()}`}
                    open={open}
                    onOpenChange={setOpen}
                >
                    <div className="grid gap-1">
                        {title && <Toast.Title className="text-sm font-semibold">{title}</Toast.Title>}
                        {description && (
                            <Toast.Description className="text-sm opacity-90">
                                {description}
                            </Toast.Description>
                        )}
                    </div>
                    <Toast.Close className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100">
                        <X className="h-4 w-4" />
                    </Toast.Close>
                </Toast.Root>
                <Toast.Viewport className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]" />
            </Toast.Provider>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
};
