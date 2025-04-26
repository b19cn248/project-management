// src/components/common/FileUpload/FileUpload.tsx
import React, { useState, useRef, useEffect } from 'react';
import Button from '../Button';

interface FileUploadProps {
    onUpload: (files: File[]) => void;
    accept?: string;
    multiple?: boolean;
    maxSize?: number; // in bytes
    className?: string;
    loading?: boolean;
    compact?: boolean;
    label?: string;
    hint?: string;
    error?: string;
}

interface FilePreviewProps {
    file: File;
    onRemove: () => void;
    error?: string;
}

const FilePreview: React.FC<FilePreviewProps> = ({ file, onRemove, error }) => {
    // Get file extension
    const extension = file.name.split('.').pop()?.toLowerCase() || '';

    // Format file size
    const formatFileSize = (sizeInBytes: number): string => {
        if (sizeInBytes < 1024) {
            return `${sizeInBytes} B`;
        } else if (sizeInBytes < 1024 * 1024) {
            return `${(sizeInBytes / 1024).toFixed(1)} KB`;
        } else if (sizeInBytes < 1024 * 1024 * 1024) {
            return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
        } else {
            return `${(sizeInBytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
        }
    };

    // Get icon based on file type
    const getFileIcon = () => {
        switch (extension) {
            case 'pdf':
                return (
                    <svg className="w-8 h-8 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                );
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
                return (
                    <svg className="w-8 h-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                );
            case 'doc':
            case 'docx':
                return (
                    <svg className="w-8 h-8 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                );
            case 'xls':
            case 'xlsx':
                return (
                    <svg className="w-8 h-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                );
            case 'ppt':
            case 'pptx':
                return (
                    <svg className="w-8 h-8 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                );
            case 'zip':
            case 'rar':
                return (
                    <svg className="w-8 h-8 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-8 h-8 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                );
        }
    };

    return (
        <div className={`flex items-center p-3 border rounded-md ${error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex-shrink-0">
                {getFileIcon()}
            </div>
            <div className="ml-3 flex-1 min-w-0">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
                    </div>
                    <button
                        type="button"
                        onClick={onRemove}
                        className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                        <span className="sr-only">Remove file</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

const FileUpload: React.FC<FileUploadProps> = ({
                                                   onUpload,
                                                   accept = '*',
                                                   multiple = false,
                                                   maxSize,
                                                   className = '',
                                                   loading = false,
                                                   compact = false,
                                                   label = 'Upload files',
                                                   hint = 'Drag and drop files here, or click to select files',
                                                   error
                                               }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [fileErrors, setFileErrors] = useState<Record<string, string>>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Reset files when parent needs to clear
    useEffect(() => {
        if (!loading) {
            setFiles([]);
            setFileErrors({});
        }
    }, [loading]);

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const validateFile = (file: File): string | null => {
        // Check file size
        if (maxSize && file.size > maxSize) {
            const sizeMB = Math.round(maxSize / (1024 * 1024));
            return `File size exceeds ${sizeMB} MB limit.`;
        }

        // Check file type if accept is specified and not wildcard
        if (accept && accept !== '*') {
            const acceptTypes = accept.split(',').map(type => type.trim());
            const fileType = file.type;
            const fileExtension = `.${file.name.split('.').pop()}`.toLowerCase();

            const isValid = acceptTypes.some(type => {
                // Check for mime type match
                if (type.includes('/')) {
                    if (type.endsWith('/*')) {
                        const typeCategory = type.split('/')[0];
                        return fileType.startsWith(`${typeCategory}/`);
                    }
                    return fileType === type;
                }
                // Check for extension match
                return fileExtension === type.toLowerCase();
            });

            if (!isValid) {
                return 'File type not supported.';
            }
        }

        return null;
    };

    const processFiles = (fileList: FileList) => {
        const newFiles: File[] = [];
        const newErrors: Record<string, string> = {};

        Array.from(fileList).forEach(file => {
            // Validate the file
            const error = validateFile(file);

            if (error) {
                newErrors[file.name] = error;
            }

            // Add file to the list regardless of validation (to show error)
            if (multiple) {
                newFiles.push(file);
            } else {
                // If not multiple, replace existing files
                newFiles.length = 0;
                newFiles.push(file);
            }
        });

        // Set the files and errors
        setFiles(multiple ? [...files, ...newFiles] : newFiles);
        setFileErrors({...fileErrors, ...newErrors});

        // Call the onUpload callback with valid files only
        const validFiles = newFiles.filter(file => !newErrors[file.name]);
        if (validFiles.length > 0) {
            onUpload(multiple ? [...files.filter(f => !fileErrors[f.name]), ...validFiles] : validFiles);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFiles(e.dataTransfer.files);
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            processFiles(e.target.files);
        }
    };

    const handleRemoveFile = (fileToRemove: File) => {
        const updatedFiles = files.filter(file => file !== fileToRemove);
        setFiles(updatedFiles);

        // Remove any errors for this file
        const updatedErrors = {...fileErrors};
        delete updatedErrors[fileToRemove.name];
        setFileErrors(updatedErrors);

        // Call onUpload with remaining valid files
        const validFiles = updatedFiles.filter(file => !updatedErrors[file.name]);
        onUpload(validFiles);
    };

    const renderDropzone = () => {
        if (compact) {
            return (
                <div className="flex items-center justify-center">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={loading}
                        size="sm"
                        icon={
                            <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                        }
                    >
                        {label}
                    </Button>
                </div>
            );
        }

        return (
            <div
                className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer
                    ${error ? 'border-red-300 bg-red-50' : isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100'}`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <svg className={`w-12 h-12 ${error ? 'text-red-400' : 'text-gray-400'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="mt-2 text-sm font-medium text-gray-900">{label}</p>
                <p className="mt-1 text-xs text-gray-500">{hint}</p>
                {accept && accept !== '*' && (
                    <p className="mt-1 text-xs text-gray-500">
                        Accepted file types: {accept.split(',').join(', ')}
                    </p>
                )}
                {maxSize && (
                    <p className="mt-1 text-xs text-gray-500">
                        Maximum file size: {Math.round(maxSize / (1024 * 1024))} MB
                    </p>
                )}
                {error && (
                    <p className="mt-2 text-sm text-red-600">{error}</p>
                )}
            </div>
        );
    };

    return (
        <div className={className}>
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                multiple={multiple}
                className="hidden"
                onChange={handleFileInputChange}
                disabled={loading}
            />

            {/* Dropzone */}
            {renderDropzone()}

            {/* File preview */}
            {files.length > 0 && (
                <div className="mt-4 space-y-3">
                    {files.map((file, index) => (
                        <FilePreview
                            key={`${file.name}-${index}`}
                            file={file}
                            onRemove={() => handleRemoveFile(file)}
                            error={fileErrors[file.name]}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default FileUpload;