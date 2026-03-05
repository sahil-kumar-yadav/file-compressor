"use client";
import React, { useState, useRef } from 'react';

export default function FileUploader({ onFileSelect, disabled }) {
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        if (!disabled) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        
        if (disabled) return;
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    };

    const handleFileSelect = (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFile(files[0]);
        }
    };

    const handleFile = (file) => {
        setSelectedFile(file);
        onFileSelect(file);
    };

    const handleClick = () => {
        if (!disabled) {
            fileInputRef.current?.click();
        }
    };

    const handleRemove = (e) => {
        e.stopPropagation();
        setSelectedFile(null);
        onFileSelect(null);
    };

    return (
        <div className="w-full">
            <div
                onClick={handleClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                    relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
                    transition-all duration-300 ease-in-out
                    ${isDragging 
                        ? 'border-blue-500 bg-blue-50 scale-105' 
                        : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                    }
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={disabled}
                />
                
                {selectedFile ? (
                    <div className="flex items-center justify-center space-x-3">
                        <div className="text-4xl">
                            {selectedFile.type.startsWith('image/') ? '🖼️' : 
                             selectedFile.type.startsWith('video/') ? '🎬' : '📄'}
                        </div>
                        <div className="text-left">
                            <p className="font-medium text-gray-800 truncate max-w-xs">
                                {selectedFile.name}
                            </p>
                            <p className="text-sm text-gray-500">
                                {(selectedFile.size / 1024).toFixed(2)} KB
                            </p>
                        </div>
                        {!disabled && (
                            <button
                                onClick={handleRemove}
                                className="ml-4 p-2 rounded-full hover:bg-red-100 text-red-500 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-lg font-medium text-gray-700">
                                Drop your file here or click to browse
                            </p>
                            <p className="text-sm text-gray-400 mt-1">
                                Supports text, images, and videos
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

