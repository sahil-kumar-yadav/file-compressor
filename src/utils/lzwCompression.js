// LZW Compression Algorithm for Images and Videos

// Compress data using LZW algorithm
export function lzwCompress(data) {
    if (typeof data === 'string') {
        return lzwCompressString(data);
    }
    return lzwCompressArray(new Uint8Array(data));
}

// Decompress LZW data
export function lzwDecompress(compressed, isString = false) {
    if (isString) {
        return lzwDecompressString(compressed);
    }
    return lzwDecompressArray(compressed);
}

// String LZW Compression
function lzwCompressString(data) {
    const dict = {};
    let dictSize = 256;
    
    for (let i = 0; i < 256; i++) {
        dict[String.fromCharCode(i)] = i;
    }
    
    let current = '';
    const result = [];
    
    for (let i = 0; i < data.length; i++) {
        const char = data[i];
        const combined = current + char;
        
        if (dict.hasOwnProperty(combined)) {
            current = combined;
        } else {
            result.push(dict[current]);
            dict[combined] = dictSize++;
            current = char;
        }
    }
    
    if (current !== '') {
        result.push(dict[current]);
    }
    
    return result;
}

// String LZW Decompression
function lzwDecompressString(compressed) {
    if (compressed.length === 0) return '';
    
    const dict = {};
    let dictSize = 256;
    
    for (let i = 0; i < 256; i++) {
        dict[i] = String.fromCharCode(i);
    }
    
    let current = String.fromCharCode(compressed[0]);
    const result = [current];
    
    for (let i = 1; i < compressed.length; i++) {
        const code = compressed[i];
        const entry = dict[code];
        
        if (entry !== undefined) {
            result.push(entry);
        } else if (code === dictSize) {
            result.push(current + current[0]);
        }
        
        dict[dictSize++] = current + entry?.[0] || '';
        current = entry || '';
    }
    
    return result.join('');
}

// Array LZW Compression (for binary data like images/videos)
function lzwCompressArray(data) {
    const dict = new Map();
    let dictSize = 256;
    
    // Initialize dictionary with single bytes
    for (let i = 0; i < 256; i++) {
        dict.set(String.fromCharCode(i), i);
    }
    
    let current = String.fromCharCode(data[0]);
    const result = [dict.get(current)];
    
    for (let i = 1; i < data.length; i++) {
        const char = String.fromCharCode(data[i]);
        const combined = current + char;
        
        if (dict.has(combined)) {
            current = combined;
        } else {
            result.push(dict.get(current));
            dict.set(combined, dictSize++);
            current = char;
        }
    }
    
    if (current) {
        result.push(dict.get(current));
    }
    
    return result;
}

// Array LZW Decompression
function lzwDecompressArray(compressed) {
    if (!compressed || compressed.length === 0) return new Uint8Array(0);
    
    const dict = new Map();
    let dictSize = 256;
    
    // Initialize dictionary
    for (let i = 0; i < 256; i++) {
        dict.set(i, String.fromCharCode(i));
    }
    
    let current = String.fromCharCode(compressed[0]);
    const result = new Uint8Array([current.charCodeAt(0)]);
    
    for (let i = 1; i < compressed.length; i++) {
        const code = compressed[i];
        let entry;
        
        if (dict.has(code)) {
            entry = dict.get(code);
        } else if (code === dictSize) {
            entry = current + current[0];
        } else {
            entry = '';
        }
        
        for (let j = 0; j < entry.length; j++) {
            result.push(entry.charCodeAt(j));
        }
        
        dict.set(dictSize++, current + entry?.[0] || '');
        current = entry;
    }
    
    return result;
}

// Convert Array to Base64 for display
export function arrayToBase64(arr) {
    // Handle LZW compressed arrays which contain numbers (not bytes)
    // Convert to proper binary string using Uint8Array directly
    const bytes = new Uint8Array(arr);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    // Use btoa with proper encoding
    return btoa(binary);
}

// Convert Base64 to Array
export function base64ToArray(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

