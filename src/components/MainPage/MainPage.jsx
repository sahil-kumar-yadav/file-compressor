"use client";
import React, { useState } from 'react';
import FileUploader from '@/components/FileUploader/FileUploader';
import CompressionResults from '@/components/CompressionResults/CompressionResults';
import { compressFile, detectFileType, formatFileSize, getFileIcon } from '@/utils/compression';

function MainPage() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isCompressing, setIsCompressing] = useState(false);
    const [compressionResult, setCompressionResult] = useState(null);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('compress'); // 'compress' | 'text'

    const handleFileSelect = (file) => {
        setSelectedFile(file);
        setCompressionResult(null);
        setError(null);
    };

    const handleCompress = async () => {
        if (!selectedFile) return;
        
        setIsCompressing(true);
        setError(null);
        
        try {
            const result = await compressFile(selectedFile);
            setCompressionResult(result);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsCompressing(false);
        }
    };

    const handleReset = () => {
        setSelectedFile(null);
        setCompressionResult(null);
        setError(null);
    };

    const fileType = selectedFile ? detectFileType(selectedFile) : null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Header */}
            <header className="bg-white/10 backdrop-blur-md border-b border-white/10">
                <div className="max-w-6xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">Universal File Compressor</h1>
                                <p className="text-gray-400 text-sm">Compress Text, Images & Videos</p>
                            </div>
                        </div>
                        <div className="hidden md:flex items-center space-x-2 text-sm text-gray-400">
                            <span className="px-3 py-1 bg-white/10 rounded-full">Huffman</span>
                            <span className="px-3 py-1 bg-white/10 rounded-full">LZW</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-6 py-12">
                {/* Tab Navigation */}
                <div className="flex justify-center mb-10">
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-1.5 flex">
                        <button
                            onClick={() => setActiveTab('compress')}
                            className={`px-8 py-3 rounded-xl font-medium transition-all duration-300 ${
                                activeTab === 'compress'
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            <span className="flex items-center space-x-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                <span>File Compression</span>
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab('text')}
                            className={`px-8 py-3 rounded-xl font-medium transition-all duration-300 ${
                                activeTab === 'text'
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            <span className="flex items-center space-x-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span>Text Encoding</span>
                            </span>
                        </button>
                    </div>
                </div>

                {/* File Compression Tab */}
                {activeTab === 'compress' && (
                    <div className="max-w-3xl mx-auto">
                        {!compressionResult ? (
                            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/10">
                                <h2 className="text-2xl font-bold text-white mb-2">Upload Your File</h2>
                                <p className="text-gray-400 mb-8">Select a text, image, or video file to compress</p>
                                
                                <FileUploader 
                                    onFileSelect={handleFileSelect} 
                                    disabled={isCompressing}
                                />

                                {/* File Preview */}
                                {selectedFile && (
                                    <div className="mt-8 space-y-4">
                                        <div className="flex items-center justify-between bg-white/5 rounded-xl p-4 border border-white/10">
                                            <div className="flex items-center space-x-4">
                                                <div className="text-3xl">{getFileIcon(fileType)}</div>
                                                <div>
                                                    <p className="text-white font-medium">{selectedFile.name}</p>
                                                    <p className="text-gray-400 text-sm">
                                                        {fileType.charAt(0).toUpperCase() + fileType.slice(1)} File • {formatFileSize(selectedFile.size)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                    fileType === 'text' ? 'bg-blue-500/20 text-blue-400' :
                                                    fileType === 'image' ? 'bg-purple-500/20 text-purple-400' :
                                                    'bg-orange-500/20 text-orange-400'
                                                }`}>
                                                    {fileType.toUpperCase()}
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleCompress}
                                            disabled={isCompressing}
                                            className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white py-4 px-8 rounded-xl font-bold text-lg
                                                     hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300
                                                     disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
                                        >
                                            {isCompressing ? (
                                                <>
                                                    <svg className="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                    </svg>
                                                    <span>Compressing...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                    </svg>
                                                    <span>Compress File</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}

                                {/* Error Message */}
                                {error && (
                                    <div className="mt-6 bg-red-500/20 border border-red-500/30 rounded-xl p-4">
                                        <p className="text-red-300">{error}</p>
                                    </div>
                                )}

                                {/* Features */}
                                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="text-center p-4">
                                        <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                            <span className="text-2xl">📄</span>
                                        </div>
                                        <h3 className="text-white font-semibold">Text Files</h3>
                                        <p className="text-gray-400 text-sm mt-1">Huffman coding for optimal text compression</p>
                                    </div>
                                    <div className="text-center p-4">
                                        <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                            <span className="text-2xl">🖼️</span>
                                        </div>
                                        <h3 className="text-white font-semibold">Images</h3>
                                        <p className="text-gray-400 text-sm mt-1">LZW algorithm for lossless image compression</p>
                                    </div>
                                    <div className="text-center p-4">
                                        <div className="w-14 h-14 bg-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                            <span className="text-2xl">🎬</span>
                                        </div>
                                        <h3 className="text-white font-semibold">Videos</h3>
                                        <p className="text-gray-400 text-sm mt-1">Efficient compression for video files</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <CompressionResults 
                                result={compressionResult} 
                                onReset={handleReset}
                            />
                        )}
                    </div>
                )}

                {/* Text Encoding Tab */}
                {activeTab === 'text' && (
                    <TextEncoder />
                )}
            </main>

            {/* Footer */}
            <footer className="border-t border-white/10 mt-12 py-8">
                <div className="max-w-6xl mx-auto px-6 text-center text-gray-400">
                    <p>Universal File Compressor • Powered by Huffman Coding & LZW</p>
                </div>
            </footer>
        </div>
    );
}

// Text Encoder Component (legacy functionality)
function TextEncoder() {
    const [inputText, setInputText] = useState('');
    const [encodedText, setEncodedText] = useState('');
    const [codesString, setCodesString] = useState('');
    const [decodeInputText, setDecodeInputText] = useState('');
    const [decodeCodesString, setDecodeCodesString] = useState('');
    const [decodedText, setDecodedText] = useState('');
    const [isEncoding, setIsEncoding] = useState(false);
    const [isDecoding, setIsDecoding] = useState(false);
    const [activeSection, setActiveSection] = useState('encode');

    const handleEncode = () => {
        if (!inputText.trim()) return;
        setIsEncoding(true);
        setTimeout(() => {
            const { encode } = require('@/utils/huffmanCoding');
            // Dynamic import for Huffman coding
            import('@/utils/huffmanCoding').then(module => {
                const result = module.encodeText(inputText);
                setEncodedText(result.encodedText);
                setCodesString(result.codesString);
                setIsEncoding(false);
            });
        }, 500);
    };

    const handleDecode = () => {
        if (!decodeInputText.trim() || !decodeCodesString.trim()) return;
        setIsDecoding(true);
        setTimeout(() => {
            try {
                const { decodeText } = require('@/utils/huffmanCoding');
                import('@/utils/huffmanCoding').then(module => {
                    const decoded = module.decodeText(decodeInputText, decodeCodesString);
                    setDecodedText(decoded);
                    setIsDecoding(false);
                });
            } catch (error) {
                setDecodedText("Error during decoding. Ensure Huffman codes are correct.");
                setIsDecoding(false);
            }
        }, 500);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Section Tabs */}
            <div className="flex justify-center">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-1.5 flex">
                    <button
                        onClick={() => setActiveSection('encode')}
                        className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                            activeSection === 'encode'
                                ? 'bg-green-500 text-white shadow-lg'
                                : 'text-gray-300 hover:text-white hover:bg-white/10'
                        }`}
                    >
                        Encode
                    </button>
                    <button
                        onClick={() => setActiveSection('decode')}
                        className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                            activeSection === 'decode'
                                ? 'bg-blue-500 text-white shadow-lg'
                                : 'text-gray-300 hover:text-white hover:bg-white/10'
                        }`}
                    >
                        Decode
                    </button>
                </div>
            </div>

            {/* Encode Section */}
            {activeSection === 'encode' && (
                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/10 space-y-6">
                    <h3 className="text-2xl font-bold text-white flex items-center space-x-3">
                        <span className="text-2xl">🔐</span>
                        <span>Encode Text</span>
                    </h3>
                    
                    <div>
                        <label className="block text-gray-300 mb-2 font-medium">Enter text to encode:</label>
                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Type your text here..."
                            rows="5"
                            className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                    </div>

                    <button
                        onClick={handleEncode}
                        disabled={isEncoding || !inputText.trim()}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-6 rounded-xl font-bold
                                 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300
                                 disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                        {isEncoding ? (
                            <span className="animate-spin">🔄</span>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        )}
                        <span>Encode with Huffman</span>
                    </button>

                    {encodedText && (
                        <div className="space-y-4 pt-4 border-t border-white/10">
                            <div>
                                <label className="block text-gray-300 mb-2 font-medium">Encoded Binary:</label>
                                <textarea
                                    value={encodedText}
                                    readOnly
                                    rows="4"
                                    className="w-full p-4 bg-blue-500/20 border border-blue-500/30 rounded-xl text-blue-200 font-mono text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-300 mb-2 font-medium">Huffman Codes (JSON):</label>
                                <textarea
                                    value={codesString}
                                    readOnly
                                    rows="4"
                                    className="w-full p-4 bg-purple-500/20 border border-purple-500/30 rounded-xl text-purple-200 font-mono text-sm"
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Decode Section */}
            {activeSection === 'decode' && (
                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/10 space-y-6">
                    <h3 className="text-2xl font-bold text-white flex items-center space-x-3">
                        <span className="text-2xl">🔓</span>
                        <span>Decode Text</span>
                    </h3>
                    
                    <div>
                        <label className="block text-gray-300 mb-2 font-medium">Enter binary string:</label>
                        <textarea
                            value={decodeInputText}
                            onChange={(e) => setDecodeInputText(e.target.value)}
                            placeholder="Enter binary string (e.g., 0101011)"
                            rows="4"
                            className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-300 mb-2 font-medium">Enter Huffman codes (JSON):</label>
                        <textarea
                            value={decodeCodesString}
                            onChange={(e) => setDecodeCodesString(e.target.value)}
                            placeholder='{"A":"0","B":"110"}'
                            rows="4"
                            className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <button
                        onClick={handleDecode}
                        disabled={isDecoding || !decodeInputText.trim() || !decodeCodesString.trim()}
                        className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 px-6 rounded-xl font-bold
                                 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300
                                 disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                        {isDecoding ? (
                            <span className="animate-spin">🔄</span>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                        <span>Decode</span>
                    </button>

                    {decodedText && (
                        <div className="pt-4 border-t border-white/10">
                            <label className="block text-gray-300 mb-2 font-medium">Decoded Text:</label>
                            <textarea
                                value={decodedText}
                                readOnly
                                rows="4"
                                className="w-full p-4 bg-green-500/20 border border-green-500/30 rounded-xl text-green-200"
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default MainPage;

