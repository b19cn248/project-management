// src/components/common/Card.tsx
import React from 'react';

interface CardProps {
    title?: string;
    children: React.ReactNode;
    className?: string;
    footer?: React.ReactNode;
    loading?: boolean;
    noPadding?: boolean;
    bordered?: boolean;
    headerAction?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
                                       title,
                                       children,
                                       className = '',
                                       footer,
                                       loading = false,
                                       noPadding = false,
                                       bordered = false,
                                       headerAction,
                                   }) => {
    return (
        <div className={`bg-white rounded-lg shadow-sm overflow-hidden ${bordered ? 'border border-gray-200' : ''} ${className}`}>
            {loading && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            )}

            {title && (
                <div className="px-4 py-4 sm:px-6 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">{title}</h3>
                    {headerAction && (
                        <div>{headerAction}</div>
                    )}
                </div>
            )}

            <div className={`${noPadding ? '' : 'p-4 sm:p-6'} relative`}>
                {children}
            </div>

            {footer && (
                <div className="px-4 py-3 sm:px-6 bg-gray-50 border-t border-gray-200">
                    {footer}
                </div>
            )}
        </div>
    );
};

export default Card;