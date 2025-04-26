// src/components/common/Button.tsx
import React from 'react';

interface ButtonProps {
    type?: 'button' | 'submit' | 'reset';
    variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info' | 'outline';
    size?: 'xs' | 'sm' | 'md' | 'lg';
    onClick?: () => void;
    disabled?: boolean;
    fullWidth?: boolean;
    children: React.ReactNode;
    className?: string;
    loading?: boolean;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    rounded?: boolean;
}

const Button: React.FC<ButtonProps> = ({
                                           type = 'button',
                                           variant = 'primary',
                                           size = 'md',
                                           onClick,
                                           disabled = false,
                                           fullWidth = false,
                                           children,
                                           className = '',
                                           loading = false,
                                           icon,
                                           iconPosition = 'left',
                                           rounded = false,
                                       }) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2';

    const variantStyles = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 border border-transparent',
        secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500 border border-transparent',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 border border-transparent',
        success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 border border-transparent',
        warning: 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500 border border-transparent',
        info: 'bg-cyan-500 text-white hover:bg-cyan-600 focus:ring-cyan-500 border border-transparent',
        outline: 'bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500 border border-gray-300',
    };

    const sizeStyles = {
        xs: 'py-1 px-2 text-xs',
        sm: 'py-1.5 px-3 text-sm',
        md: 'py-2 px-4 text-sm',
        lg: 'py-2 px-6 text-base',
    };

    const widthStyle = fullWidth ? 'w-full' : '';
    const roundedStyle = rounded ? 'rounded-full' : 'rounded-md';
    const disabledStyle = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${disabledStyle} ${roundedStyle} ${className}`}
        >
            {loading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            )}

            {icon && iconPosition === 'left' && !loading && (
                <span className="mr-2">{icon}</span>
            )}

            <span>{children}</span>

            {icon && iconPosition === 'right' && (
                <span className="ml-2">{icon}</span>
            )}
        </button>
    );
};

export default Button;