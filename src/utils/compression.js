// Unified Compression Handler for Text, Image, and Video files
// Now with proper binary output and efficient compression

import { encodeText, decodeText } from './huffmanCoding';
import { lzwCompress, lzwDecompress, arrayToBase64, base64ToArray } from './lzwCompression';

// File type detection
export function detectFileType(file) {
    const extension = file.name.split('.').pop().toLowerCase();
    const mimeType = file.type;
    
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico', 'tiff'];
    const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm', 'm4v', '3gp'];
    const textExtensions = ['txt', 'json', 'xml', 'html', 'css', 'js', 'ts', 'md', 'csv', 'log', 'py', 'java', 'c', 'cpp', 'h'];
    
    if (imageExtensions.includes(extension) || mimeType.startsWith('image/')) {
        return 'image';
    }
    if (videoExtensions.includes(extension) || mimeType.startsWith('video/')) {
        return 'video';
    }
    if (textExtensions.includes(extension) || mimeType.startsWith('text/')) {
        return 'text';
    }
    
    // Default to binary
    return 'binary';
}

// Compress file based on type
export async function compressFile(file) {
    const fileType = detectFileType(file);
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    let compressed, algorithm, metadata;
    
    if (fileType === 'text') {
        // Use Huffman coding for text
        const text = new TextDecoder().decode(uint8Array);
        const result = encodeText(text);
        
        // Convert binary data to base64 for storage
        const base64Data = arrayToBase64(result.encodedData);
        
        compressed = {
            encodedData: base64Data,
            codes: result.codesString,
            originalSize: result.originalSize
        };
        algorithm = 'huffman';
        metadata = { originalSize: text.length, fileType: 'text' };
    } else {
        // Use LZW for images and videos with proper binary output
        const lzwResult = lzwCompress(uint8Array);
        
        // Convert binary data to base64 for storage
        const base64Data = arrayToBase64(lzwResult.data);
        
        compressed = {
            encodedData: base64Data,
            originalSize: lzwResult.originalSize
        };
        algorithm = 'lzw';
        metadata = { originalSize: uint8Array.length, fileType };
    }
    
    // Calculate actual compressed size in bytes
    const compressedDataString = JSON.stringify(compressed);
    const compressedSize = compressedDataString.length;
    const originalSize = uint8Array.length;
    
    // Calculate compression ratio
    const ratio = originalSize > 0 ? 
        ((1 - compressedSize / originalSize) * 100).toFixed(2) : 0;
    
    return {
        success: true,
        algorithm,
        fileType,
        fileName: file.name,
        originalSize,
        compressedSize,
        ratio: Math.max(0, ratio),
        data: compressed,
        metadata
    };
}

// Decompress file
export async function decompressFile(compressedData, originalFileName, algorithm, fileType) {
    try {
        let decompressed;
        
        if (algorithm === 'huffman') {
            // Decode text using Huffman
            const encodedData = base64ToArray(compressedData.encodedData);
            decompressed = decodeText(encodedData, compressedData.codes, compressedData.originalSize);
            
            // Create download
            const blob = new Blob([decompressed], { type: 'text/plain' });
            return {
                success: true,
                blob,
                fileName: 'decoded_' + originalFileName,
                fileType: 'text'
            };
        } else if (algorithm === 'lzw') {
            // Decode using LZW
            const encodedData = base64ToArray(compressedData.encodedData);
            const decompressedArray = lzwDecompress(encodedData, compressedData.originalSize);
            
            // Determine MIME type based on fileType
            let mimeType = 'application/octet-stream';
            if (fileType === 'image') {
                const ext = originalFileName.split('.').pop().toLowerCase();
                const imageMimes = {
                    'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png',
                    'gif': 'image/gif', 'webp': 'image/webp', 'bmp': 'image/bmp'
                };
                mimeType = imageMimes[ext] || 'image/png';
            } else if (fileType === 'video') {
                mimeType = 'video/mp4';
            }
            
            const blob = new Blob([decompressedArray], { type: mimeType });
            return {
                success: true,
                blob,
                fileName: 'decompressed_' + originalFileName,
                fileType
            };
        }
        
        return { success: false, error: 'Unknown algorithm' };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Format file size for display
export function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Get file icon based on type
export function getFileIcon(fileType) {
    const icons = {
        text: '📄',
        image: '🖼️',
        video: '🎬',
        binary: '📦'
    };
    return icons[fileType] || icons.binary;
}

// Get algorithm description
export function getAlgorithmInfo(algorithm) {
    const info = {
        huffman: 'Huffman Coding - Optimal for text files with repeated characters',
        lzw: 'LZW (Lempel-Ziv-Welch) - Lossless compression for images and videos'
    };
    return info[algorithm] || '';
}

