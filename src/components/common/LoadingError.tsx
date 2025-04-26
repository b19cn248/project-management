// src/components/common/LoadingError.tsx
import React from 'react';
import Button from './Button';

interface LoadingProps {
    message?: string;
    size?: 'sm' | 'md' | 'lg';
}

export const Loading: React.FC<LoadingProps> = ({
                                                    message = 'Loading...',
                                                    size = 'md'
                                                }) => {
    const spinnerSizes = {
        sm: 'h-6 w-6',
        md: 'h-12 w-12',
        lg: 'h-16 w-16'
    };

    const textSizes = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg'
    };

    return (
        <div className="flex flex-col items-center justify-center py-8">
            <div className={`${spinnerSizes[size]} border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin mb-4`}></div>
            <p className={`${textSizes[size]} text-gray-600`}>{message}</p>
        </div>
    );
};

interface ErrorProps {
    title?: string;
    message?: string;
    onRetry?: () => void;
    showRetry?: boolean;
}

export const Error: React.FC<ErrorProps> = ({
                                                title = 'Something went wrong',
                                                message = 'An error occurred while fetching data. Please try again later.',
                                                onRetry,
                                                showRetry = false
                                            }) => {
    return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
            <svg className="w-12 h-12 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
            <p className="text-sm text-gray-600 mb-6 max-w-md">{message}</p>
            {showRetry && onRetry && (
                <Button
                    onClick={onRetry}
                    variant="primary"
                    size="sm"
                    icon={
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                        </svg>
                    }
                >
                    Try Again
                </Button>
            )}
        </div>
    );
};

interface EmptyStateProps {
    title: string;
    description?: string;
    icon?: React.ReactNode;
    action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
                                                          title,
                                                          description,
                                                          icon,
                                                          action
                                                      }) => {
    return (
        <div className="text-center py-12">
            {icon || (
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
            )}
            <h3 className="mt-2 text-sm font-medium text-gray-900">{title}</h3>
            {description && (
                <p className="mt-1 text-sm text-gray-500">{description}</p>
            )}
            {action && (
                <div className="mt-6">{action}</div>
            )}
        </div>
    );
};

export default {
    Loading,
    Error,
    EmptyState
};