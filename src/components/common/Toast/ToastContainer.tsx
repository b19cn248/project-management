import React from 'react';
import {Toast, useToast} from './ToastContext';

const ToastItem: React.FC<{ toast: Toast }> = ({toast}) => {
    const {removeToast} = useToast();

    // Icon and color based on toast type
    const getToastStyles = (type: Toast['type']) => {
        switch (type) {
            case 'success':
                return {
                    bgColor: 'bg-green-50',
                    iconColor: 'text-green-400',
                    borderColor: 'border-green-400',
                    icon: (
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                        </svg>
                    )
                };
            case 'error':
                return {
                    bgColor: 'bg-red-50',
                    iconColor: 'text-red-400',
                    borderColor: 'border-red-400',
                    icon: (
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    )
                };
            case 'warning':
                return {
                    bgColor: 'bg-yellow-50',
                    iconColor: 'text-yellow-400',
                    borderColor: 'border-yellow-400',
                    icon: (
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                        </svg>
                    )
                };
            case 'info':
            default:
                return {
                    bgColor: 'bg-blue-50',
                    iconColor: 'text-blue-400',
                    borderColor: 'border-blue-400',
                    icon: (
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    )
                };
        }
    };

    const {bgColor, iconColor, borderColor, icon} = getToastStyles(toast.type);

    return (
        <div
            className={`max-w-md w-full ${bgColor} border-l-4 ${borderColor} p-4 mb-3 rounded-md shadow-lg pointer-events-auto flex`}
            role="alert"
        >
            <div className={`flex-shrink-0 ${iconColor}`}>
                {icon}
            </div>
            <div className="ml-3 flex-1">
                <div className="text-sm font-medium text-gray-900">
                    {toast.title}
                </div>
                {toast.message && (
                    <div className="mt-1 text-sm text-gray-500">
                        {toast.message}
                    </div>
                )}
            </div>
            <div className="ml-4 flex-shrink-0 flex">
                <button
                    onClick={() => removeToast(toast.id)}
                    className="bg-transparent text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                    <span className="sr-only">Close</span>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>
        </div>
    );
};

const ToastContainer: React.FC = () => {
    const {toasts} = useToast();

    return (
        <div className="fixed top-0 right-0 p-4 w-full md:max-w-sm z-50 pointer-events-none">
            <div aria-live="assertive" className="flex flex-col items-end">
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast}/>
                ))}
            </div>
        </div>
    );
};

export default ToastContainer;