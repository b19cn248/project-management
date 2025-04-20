// src/components/common/Input.tsx
import React from 'react';

interface InputProps {
    type?: 'text' | 'password' | 'email' | 'number' | 'date';
    id: string;
    name: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    label?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
}

const Input: React.FC<InputProps> = ({
                                         type = 'text',
                                         id,
                                         name,
                                         value,
                                         onChange,
                                         placeholder = '',
                                         label,
                                         error,
                                         required = false,
                                         disabled = false,
                                         className = '',
                                     }) => {
    return (
        <div className="mb-4">
            {label && (
                <label
                    htmlFor={id}
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <input
                type={type}
                id={id}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                className={`w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                    error ? 'border-red-500' : ''
                } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''} ${className}`}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
};

export default Input;