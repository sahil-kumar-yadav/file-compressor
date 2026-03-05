// Huffman Coding with proper bit packing for efficient compression

class HuffmanNode {
    constructor(char, freq) {
        this.char = char;
        this.freq = freq;
        this.left = null;
        this.right = null;
    }
}

// Build Huffman tree from frequency map
export function buildHuffmanTree(frequencies) {
    const nodes = Object.keys(frequencies).map(char => new HuffmanNode(char, frequencies[char]));

    while (nodes.length > 1) {
        nodes.sort((a, b) => a.freq - b.freq);
        const left = nodes.shift();
        const right = nodes.shift();

        const merged = new HuffmanNode(null, left.freq + right.freq);
        merged.left = left;
        merged.right = right;

        nodes.push(merged);
    }

    return nodes[0];
}

// Generate Huffman codes from tree
export function generateHuffmanCodes(root, prefix = '', codes = {}) {
    if (root === null) return;

    if (root.char !== null) {
        codes[root.char] = prefix;
    }

    generateHuffmanCodes(root.left, prefix + '0', codes);
    generateHuffmanCodes(root.right, prefix + '1', codes);
    return codes;
}

// Encode text using Huffman coding with bit packing
export function encodeText(text) {
    if (!text || text.length === 0) {
        return {
            encodedData: new Uint8Array(0),
            codesString: '{}',
            originalSize: 0
        };
    }

    const frequencies = text.split('').reduce((acc, char) => {
        acc[char] = (acc[char] || 0) + 1;
        return acc;
    }, {});

    const huffmanTree = buildHuffmanTree(frequencies);
    const huffmanCodes = generateHuffmanCodes(huffmanTree);

    // Create bit string
    let bitString = '';
    for (let i = 0; i < text.length; i++) {
        bitString += huffmanCodes[text[i]];
    }

    // Pack bits into bytes
    const encodedData = packBits(bitString);
    
    // Store codes as JSON
    const codesString = JSON.stringify(huffmanCodes);

    return {
        encodedData,
        codesString,
        originalSize: text.length
    };
}

// Pack bit string into Uint8Array
function packBits(bitString) {
    if (!bitString || bitString.length === 0) {
        return new Uint8Array(0);
    }

    const byteCount = Math.ceil(bitString.length / 8);
    const bytes = new Uint8Array(byteCount);

    for (let i = 0; i < bitString.length; i++) {
        if (bitString[i] === '1') {
            const byteIndex = Math.floor(i / 8);
            const bitIndex = 7 - (i % 8);
            bytes[byteIndex] |= (1 << bitIndex);
        }
    }

    return bytes;
}

// Unpack bytes back to bit string
function unpackBits(bytes, totalBits) {
    let bitString = '';
    for (let i = 0; i < bytes.length; i++) {
        for (let j = 7; j >= 0; j--) {
            if (bitString.length < totalBits) {
                bitString += (bytes[i] & (1 << j)) ? '1' : '0';
            }
        }
    }
    return bitString;
}

// Decode Huffman-encoded text
export function decodeText(encodedData, codesString, originalSize) {
    if (!encodedData || encodedData.length === 0) {
        return '';
    }

    const huffmanCodes = JSON.parse(codesString);
    const reversedCodes = {};
    
    // Build reverse lookup (code -> char)
    for (const [char, code] of Object.entries(huffmanCodes)) {
        reversedCodes[code] = char;
    }

    // Calculate total bits needed (8 bits per byte except possibly last byte)
    const totalBits = originalSize * 8; // Approximate - we'll handle this better
    
    // Get the maximum code length to determine exact bit count
    let maxCodeLength = 0;
    for (const code of Object.keys(huffmanCodes)) {
        maxCodeLength = Math.max(maxCodeLength, code.length);
    }
    
    // For accurate decoding, we need to know the actual bit count
    // We'll recalculate from original text length
    const actualBitCount = originalSize * maxCodeLength; // This is approximate
    
    // Better approach: unpack all bits and decode
    let bitString = '';
    for (let i = 0; i < encodedData.length; i++) {
        for (let j = 7; j >= 0; j--) {
            bitString += (encodedData[i] & (1 << j)) ? '1' : '0';
        }
    }

    // Decode bit by bit
    let currentCode = '';
    let decodedText = '';

    for (const bit of bitString) {
        currentCode += bit;
        if (reversedCodes[currentCode]) {
            decodedText += reversedCodes[currentCode];
            currentCode = '';
            if (decodedText.length >= originalSize) break;
        } else if (currentCode.length > maxCodeLength) {
            // Invalid code, stop decoding
            break;
        }
    }

    return decodedText;
}

// Legacy function for compatibility - uses string output (less efficient)
export function encodeTextLegacy(text) {
    const frequencies = text.split('').reduce((acc, char) => {
        acc[char] = (acc[char] || 0) + 1;
        return acc;
    }, {});

    const huffmanTree = buildHuffmanTree(frequencies);
    const huffmanCodes = generateHuffmanCodes(huffmanTree);

    const encodedText = text.split('').map(char => huffmanCodes[char]).join('');
    const codesString = JSON.stringify(huffmanCodes);

    return {
        encodedText,
        codesString
    };
}

// Legacy decode for compatibility
export function decodeTextLegacy(encodedText, codesString) {
    const huffmanCodes = JSON.parse(codesString);
    const reversedCodes = Object.fromEntries(Object.entries(huffmanCodes).map(([k, v]) => [v, k]));
    
    let currentCode = '';
    let decodedText = '';

    for (let bit of encodedText) {
        currentCode += bit;
        if (reversedCodes[currentCode]) {
            decodedText += reversedCodes[currentCode];
            currentCode = '';
        }
    }

    return decodedText;
}

