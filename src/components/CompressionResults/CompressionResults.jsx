"use client";
import React, { useState } from 'react';
import { formatFileSize, getFileIcon, getAlgorithmInfo, decompressFile } from '@/utils/compression';

export default function CompressionResults({ result, onReset }) {
    const [isDecompressing, setIsDecompressing] = useState(false);
    const [decompressed, setDecompressed] = useState(null);
    const [error, setError] = useState(null);

    const handleDownload = async () => {
        // Create a downloadable blob from the compressed data
        const dataStr = JSON.stringify(result.data);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${result.fileName.split('.')[0]}_compressed.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleDecompress = async () => {
        setIsDecompressing(true);
        setError(null);
        
        try {
            const decompressedResult = await decompressFile(
                result.data,
                result.fileName,
                result.algorithm,
                result.fileType
            );
            
            if (decompressedResult.success) {
                setDecompressed(decompressedResult);
            } else {
                setError(decompressedResult.error);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsDecompressing(false);
        }
    };

    const handleDownloadDecompressed = () => {
        if (!decompressed?.blob) return;
        
        const url = URL.createObjectURL(decompressed.blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = decompressed.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="w-full space-y-6">
            {/* Success Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="text-5xl">{getFileIcon(result.fileType)}</div>
                        <div>
                            <h3 className="text-2xl font-bold">Compression Complete!</h3>
                            <p className="opacity-90">{result.fileName}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-4xl font-bold">{result.ratio}%</div>
                        <p className="opacity-80">Compression Ratio</p>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                    <p className="text-sm text-gray-500">Original Size</p>
                    <p className="text-xl font-bold text-gray-800">{formatFileSize(result.originalSize)}</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                    <p className="text-sm text-gray-500">Compressed Size</p>
                    <p className="text-xl font-bold text-blue-600">{formatFileSize(result.compressedSize)}</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                    <p className="text-sm text-gray-500">Algorithm</p>
                    <p className="text-xl font-bold text-purple-600 uppercase">{result.algorithm}</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                    <p className="text-sm text-gray-500">File Type</p>
                    <p className="text-xl font-bold text-orange-600 capitalize">{result.fileType}</p>
                </div>
            </div>

            {/* Algorithm Info */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <p className="text-sm text-blue-700">{getAlgorithmInfo(result.algorithm)}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
                <button
                    onClick={handleDownload}
                    className="flex-1 min-w-[200px] bg-blue-600 text-white py-3 px-6 rounded-xl font-medium
                             hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg
                             flex items-center justify-center space-x-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Download Compressed File</span>
                </button>
                
                <button
                    onClick={handleDecompress}
                    disabled={isDecompressing}
                    className="flex-1 min-w-[200px] bg-green-600 text-white py-3 px-6 rounded-xl font-medium
                             hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg
                             flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                    {isDecompressing ? (
                        <>
                            <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span>Decompressing...</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-9l-4-4m0 0l4-4m-4 4h12" />
                            </svg>
                            <span>Test Decompression</span>
                        </>
                    )}
                </button>
                
                <button
                    onClick={onReset}
                    className="flex-1 min-w-[200px] bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-medium
                             hover:bg-gray-300 transition-all duration-200
                             flex items-center justify-center space-x-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Compress Another File</span>
                </button>
            </div>

            {/* Decompression Result */}
            {decompressed && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-green-800">Decompression Successful!</h4>
                        <button
                            onClick={handleDownloadDecompressed}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            <span>Download</span>
                        </button>
                    </div>
                    <p className="text-green-700">File successfully decompressed and verified!</p>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-red-700">Error: {error}</p>
                </div>
            )}
        </div>
    );
}

