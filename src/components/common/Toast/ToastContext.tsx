import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
}

interface ToastContextType {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, 'id'>) => string;
    removeToast: (id: string) => void;
    removeAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

interface ToastProviderProps {
    children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }, []);

    const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
        const id = uuidv4();
        setToasts((prevToasts) => [
            ...prevToasts,
            { ...toast, id }
        ]);
        return id;
    }, []);

    const removeAllToasts = useCallback(() => {
        setToasts([]);
    }, []);

    // Auto-remove toasts after duration
    useEffect(() => {
        const timers: NodeJS.Timeout[] = [];

        toasts.forEach((toast) => {
            if (toast.duration !== Infinity) {
                const timer = setTimeout(() => {
                    removeToast(toast.id);
                }, toast.duration || 5000);

                timers.push(timer);
            }
        });

        return () => {
            timers.forEach((timer) => clearTimeout(timer));
        };
    }, [toasts, removeToast]);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast, removeAllToasts }}>
            {children}
        </ToastContext.Provider>
    );
};