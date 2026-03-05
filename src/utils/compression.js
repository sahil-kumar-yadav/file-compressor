// Unified Compression Handler for Text, Image, and Video files
import { encodeText, decodeText } from './huffmanCoding';
import { lzwCompress, lzwDecompress } from './lzwCompression';

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
    
    // Default to binary (treat as image for compression purposes)
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
        compressed = {
            encodedText: result.encodedText,
            codes: JSON.parse(result.codesString)
        };
        algorithm = 'huffman';
        metadata = { originalSize: text.length, fileType: 'text' };
    } else {
        // Use LZW for images and videos - store as JSON string (numbers array)
        const lzwCompressed = lzwCompress(uint8Array);
        // Store compressed data as JSON string to avoid base64 encoding issues
        compressed = {
            data: JSON.stringify(lzwCompressed),
            originalSize: uint8Array.length
        };
        algorithm = 'lzw';
        metadata = { originalSize: uint8Array.length, fileType };
    }
    
    // Calculate compression ratio
    const compressedSize = JSON.stringify(compressed).length;
    const ratio = ((1 - compressedSize / uint8Array.length) * 100).toFixed(2);
    
    return {
        success: true,
        algorithm,
        fileType,
        fileName: file.name,
        originalSize: uint8Array.length,
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
            const codesString = JSON.stringify(compressedData.codes);
            decompressed = decodeText(compressedData.encodedText, codesString);
            
            // Create download
            const blob = new Blob([decompressed], { type: 'text/plain' });
            return {
                success: true,
                blob,
                fileName: 'decoded_' + originalFileName,
                fileType: 'text'
            };
        } else if (algorithm === 'lzw') {
            // Decode using LZW - parse JSON string to get numbers array
            const lzwData = JSON.parse(compressedData.data);
            const decompressedArray = lzwDecompress(lzwData);
            
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

