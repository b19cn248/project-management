// src/components/common/Input.tsx
import React, { useState } from 'react';

interface InputProps {
    type?: 'text' | 'password' | 'email' | 'number' | 'date' | 'time' | 'tel' | 'url';
    id: string;
    name: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    placeholder?: string;
    label?: string;
    error?: string;
    helpText?: string;
    required?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    className?: string;
    autoComplete?: string;
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
    fullWidth?: boolean;
    min?: number | string;
    max?: number | string;
    step?: number | string;
}

const Input: React.FC<InputProps> = ({
                                         type = 'text',
                                         id,
                                         name,
                                         value,
                                         onChange,
                                         onBlur,
                                         placeholder = '',
                                         label,
                                         error,
                                         helpText,
                                         required = false,
                                         disabled = false,
                                         readOnly = false,
                                         className = '',
                                         autoComplete,
                                         prefix,
                                         suffix,
                                         fullWidth = true,
                                         min,
                                         max,
                                         step,
                                     }) => {
    const [focused, setFocused] = useState(false);

    const handleFocus = () => {
        setFocused(true);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        setFocused(false);
        if (onBlur) onBlur(e);
    };

    const inputBaseStyles = `
        block px-3 py-2 border rounded-md shadow-sm
        placeholder-gray-400 focus:outline-none
        ${fullWidth ? 'w-full' : ''} 
        ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''} 
        ${readOnly ? 'bg-gray-50 cursor-default' : ''}
        ${error
        ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500'
        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
    }
    `;

    const renderInput = () => (
        <input
            type={type}
            id={id}
            name={name}
            value={value}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            readOnly={readOnly}
            className={`${inputBaseStyles} ${prefix || suffix ? (prefix ? 'rounded-l-none' : 'rounded-r-none') : ''} ${className}`}
            autoComplete={autoComplete}
            min={min}
            max={max}
            step={step}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${id}-error` : helpText ? `${id}-help` : undefined}
        />
    );

    return (
        <div className={`mb-4 ${fullWidth ? 'w-full' : ''}`}>
            {label && (
                <label
                    htmlFor={id}
                    className={`block text-sm font-medium mb-1 ${error ? 'text-red-700' : 'text-gray-700'} ${disabled ? 'opacity-70' : ''}`}
                >
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <div className={`relative ${focused ? 'z-10' : ''}`}>
                {prefix || suffix ? (
                    <div className="flex">
                        {prefix && (
                            <div className="inline-flex items-center px-3 bg-gray-50 border border-r-0 border-gray-300 rounded-l-md text-gray-500">
                                {prefix}
                            </div>
                        )}

                        {renderInput()}

                        {suffix && (
                            <div className="inline-flex items-center px-3 bg-gray-50 border border-l-0 border-gray-300 rounded-r-md text-gray-500">
                                {suffix}
                            </div>
                        )}
                    </div>
                ) : (
                    renderInput()
                )}
            </div>

            {error && (
                <p className="mt-1 text-sm text-red-600" id={`${id}-error`}>
                    {error}
                </p>
            )}

            {helpText && !error && (
                <p className="mt-1 text-sm text-gray-500" id={`${id}-help`}>
                    {helpText}
                </p>
            )}
        </div>
    );
};

export default Input;