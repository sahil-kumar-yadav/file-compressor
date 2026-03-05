// LZW Compression Algorithm with proper binary output

// Compress data using LZW algorithm
export function lzwCompress(data) {
    if (!data || data.length === 0) {
        return {
            data: new Uint8Array(0),
            originalSize: 0
        };
    }
    
    if (typeof data === 'string') {
        return lzwCompressString(data);
    }
    return lzwCompressArray(new Uint8Array(data));
}

// Decompress LZW data
export function lzwDecompress(compressed, originalSize = 0) {
    if (!compressed || compressed.length === 0) {
        return new Uint8Array(0);
    }
    
    // Handle both Uint8Array and Array formats
    const data = compressed instanceof Uint8Array ? 
        Array.from(compressed) : compressed;
    
    return lzwDecompressArray(data);
}

// String LZW Compression with binary output
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
    
    // Pack 12-bit codes into bytes
    const packedData = packLZWCodes(result);
    
    return {
        data: packedData,
        originalSize: data.length
    };
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
        let entry;
        
        if (dict[code] !== undefined) {
            entry = dict[code];
        } else if (code === dictSize) {
            entry = current + current[0];
        }
        
        if (entry) {
            dict[dictSize++] = current + entry[0];
            current = entry;
            result.push(entry);
        }
    }
    
    return result.join('');
}

// Array LZW Compression with binary packing (for binary data like images/videos)
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
    
    // Pack 12-bit codes into bytes
    const packedData = packLZWCodes(result);
    
    return {
        data: packedData,
        originalSize: data.length
    };
}

// Pack LZW codes (12-bit) into bytes
function packLZWCodes(codes) {
    if (!codes || codes.length === 0) {
        return new Uint8Array(0);
    }
    
    // Use 12-bit codes (4096 possible values)
    // Pack 2 codes into 3 bytes
    const byteCount = Math.ceil(codes.length * 12 / 8);
    const bytes = new Uint8Array(byteCount);
    
    for (let i = 0; i < codes.length; i++) {
        const code = codes[i];
        const bitPosition = i * 12;
        const byteIndex = Math.floor(bitPosition / 8);
        const bitOffset = bitPosition % 8;
        
        if (bitOffset <= 4) {
            // Code fits in current byte and may spill to next
            bytes[byteIndex] |= (code << (4 - bitOffset));
            if (bitOffset + 12 > 8) {
                bytes[byteIndex + 1] |= (code >> (8 - (4 - bitOffset)));
            }
        } else {
            // Code spans across bytes
            bytes[byteIndex] |= (code >> (bitOffset - 4));
            if (bitOffset + 12 > 16) {
                bytes[byteIndex + 2] |= (code >> (16 - (bitOffset - 4)));
            }
        }
    }
    
    return bytes;
}

// Unpack LZW codes from bytes
function unpackLZWCodes(bytes, numCodes) {
    if (!bytes || bytes.length === 0 || numCodes === 0) {
        return [];
    }
    
    const codes = [];
    
    for (let i = 0; i < numCodes; i++) {
        const bitPosition = i * 12;
        const byteIndex = Math.floor(bitPosition / 8);
        const bitOffset = bitPosition % 8;
        
        let code;
        if (bitOffset <= 4) {
            code = (bytes[byteIndex] >> (4 - bitOffset)) & 0xFFF;
            if (bitOffset + 12 > 8 && byteIndex + 1 < bytes.length) {
                code |= ((bytes[byteIndex + 1] & ((1 << (8 - (4 - bitOffset))) - 1)) << (8 - (4 - bitOffset)));
            }
        } else {
            code = ((bytes[byteIndex] & ((1 << (16 - bitOffset)) - 1)) >> (16 - bitOffset - 4));
            if (bitOffset + 12 > 16 && byteIndex + 2 < bytes.length) {
                code |= (bytes[byteIndex + 2] << (16 - bitOffset - 4));
            }
        }
        
        codes.push(code);
    }
    
    return codes;
}

// Array LZW Decompression
function lzwDecompressArray(compressed) {
    if (!compressed || compressed.length === 0) return new Uint8Array(0);
    
    // Try to decode as packed bytes first
    let codes;
    try {
        // If it's already an array of small numbers, treat as unpacked
        const maxCode = Math.max(...compressed);
        if (maxCode < 256) {
            codes = compressed;
        } else {
            // It's packed bytes - need to unpack
            // Estimate number of codes (rough calculation)
            const estimatedCodes = Math.floor(compressed.length * 8 / 12);
            codes = unpackLZWCodes(compressed, estimatedCodes);
        }
    } catch (e) {
        codes = compressed;
    }
    
    const dict = new Map();
    let dictSize = 256;
    
    // Initialize dictionary
    for (let i = 0; i < 256; i++) {
        dict.set(i, String.fromCharCode(i));
    }
    
    if (codes.length === 0) return new Uint8Array(0);
    
    let current = String.fromCharCode(codes[0]);
    const result = new Uint8Array([current.charCodeAt(0)]);
    
    for (let i = 1; i < codes.length; i++) {
        const code = codes[i];
        let entry;
        
        if (dict.has(code)) {
            entry = dict.get(code);
        } else if (code === dictSize) {
            entry = current + current[0];
        } else {
            entry = '';
        }
        
        if (entry) {
            for (let j = 0; j < entry.length; j++) {
                result.push(entry.charCodeAt(j));
            }
            
            dict.set(dictSize++, current + entry[0]);
            current = entry;
        }
    }
    
    return result;
}

// Convert Uint8Array to Base64 for display/storage
export function arrayToBase64(arr) {
    if (!arr || arr.length === 0) return '';
    
    let binary = '';
    for (let i = 0; i < arr.length; i++) {
        binary += String.fromCharCode(arr[i]);
    }
    return btoa(binary);
}

// Convert Base64 to Uint8Array
export function base64ToArray(base64) {
    if (!base64) return new Uint8Array(0);
    
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

// Simple compression for smaller overhead - just store as JSON but more efficiently
// This is a fallback that works better for small files
export function lzwCompressSimple(data) {
    if (typeof data === 'string') {
        return lzwCompressString(data);
    }
    return lzwCompressArray(new Uint8Array(data));
}

// Legacy functions for compatibility
export function lzwCompressLegacy(data) {
    if (typeof data === 'string') {
        return lzwCompressString(data);
    }
    
    const dict = new Map();
    let dictSize = 256;
    
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

export function lzwDecompressLegacy(compressed, isString = false) {
    if (isString) {
        return lzwDecompressString(compressed);
    }
    return lzwDecompressArray(compressed);
}

