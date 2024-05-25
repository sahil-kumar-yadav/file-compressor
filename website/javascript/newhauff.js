

class HuffmanNode {
    constructor(char, freq) {
        this.char = char;
        this.freq = freq;
        this.left = null;
        this.right = null;
    }
}

class HuffmanCoding {
    constructor() {
        this.codes = {};
        this.reverseMapping = {};
    }

    // Calculate frequency of characters in text
    static calculateFrequency(text) {
        const frequency = {};
        for (const char of text) {
            if (!(char in frequency)) {
                frequency[char] = 0;
            }
            frequency[char]++;
        }
        return frequency;
    }

    // Build Huffman tree
    static buildTree(frequency) {
        const heap = Object.entries(frequency).map(([char, freq]) => new HuffmanNode(char, freq));

        while (heap.length > 1) {
            heap.sort((a, b) => a.freq - b.freq);

            const left = heap.shift();
            const right = heap.shift();

            const mergedNode = new HuffmanNode(null, left.freq + right.freq);
            mergedNode.left = left;
            mergedNode.right = right;

            heap.push(mergedNode);
        }

        return heap[0];
    }

    // Generate Huffman codes
    static generateCodes(root, currentCode, codes, reverseMapping) {
        if (root === null) return;

        if (root.char !== null) {
            codes[root.char] = currentCode;
            reverseMapping[currentCode] = root.char;
            return;
        }

        HuffmanCoding.generateCodes(root.left, currentCode + '0', codes, reverseMapping);
        HuffmanCoding.generateCodes(root.right, currentCode + '1', codes, reverseMapping);
    }

    // Compress text using Huffman coding
    static compressText(text) {
        const frequency = HuffmanCoding.calculateFrequency(text);
        const root = HuffmanCoding.buildTree(frequency);

        const codes = {};
        const reverseMapping = {};
        HuffmanCoding.generateCodes(root, '', codes, reverseMapping);

        let encodedText = '';
        for (const char of text) {
            encodedText += codes[char];
        }

        const padding = '0'.repeat((8 - encodedText.length % 8) % 8);
        const paddedEncodedText = padding + encodedText;

        const encodedBytes = [];
        for (let i = 0; i < paddedEncodedText.length; i += 8) {
            encodedBytes.push(parseInt(paddedEncodedText.slice(i, i + 8), 2));
        }

        return { encodedBytes, reverseMapping };
    }
    // Decompress data using Huffman coding
    static decompressData(encodedBytes, reverseMapping) {
        // Reverse the reverseMapping dictionary
        const reverseMap = {};
        for (const key in reverseMapping) {
            reverseMap[reverseMapping[key]] = key;
        }

        let currentCode = '';
        let decompressedText = '';

        // Check if encodedBytes is an object
        if (typeof encodedBytes !== 'object' || encodedBytes === null) {
            throw new Error('Invalid encodedBytes');
        }

        // Process each byte in the object
        for (const key in encodedBytes) {
            console.log('s')
            const byte = encodedBytes[key];

            // Process each bit of the byte
            for (let j = 7; j >= 0; j--) {
                const bit = (byte >> j) & 1; // Extract the j-th bit from the byte

                currentCode += bit;

                if (currentCode in reverseMap) {
                    // Found a code match in the reverse mapping
                    decompressedText += reverseMap[currentCode];
                    currentCode = ''; // Reset currentCode for the next code
                }
            }
        }
        console.log('decom', decompressedText)

        return decompressedText;
    }

    // Decompress data using Huffman coding
    static decompressData(encodedBytes, reverseMapping) {
        // Reverse the reverseMapping dictionary
        const reverseMap = {};
        for (const key in reverseMapping) {
            reverseMap[reverseMapping[key]] = key;
        }

        console.log('Reverse Map:', reverseMap);

        let currentCode = '';
        let decompressedText = '';

        // Extract values of encodedBytes object and process each byte
        const bytes = Object.values(encodedBytes);
        for (let i = 0; i < bytes.length; i++) {
            console.log('Processing byte:', bytes[i]);
            const binary = bytes[i].toString(2).padStart(8, '0');

            console.log('Binary:', binary);

            for (const bit of binary) {
                console.log('bit:', bit);
                currentCode += bit;
                if (currentCode in reverseMap) {
                    console.log('Match found:', currentCode);
                    // Found a code match in the reverse mapping
                    decompressedText += reverseMap[currentCode];
                    currentCode = ''; // Reset currentCode for the next code
                }
            }
        }

        return decompressedText;
    }



    // Save compressed data to file
    static saveCompressedData(encodedBytes, reverseMapping, outputPath) {
        const data = {
            reverseMapping,
            encodedBytes: Buffer.from(encodedBytes),
        };

        require('fs').writeFileSync(outputPath, JSON.stringify(data));
    }

    // Load compressed data from file
    static loadCompressedData(filePath) {
        const data = require('fs').readFileSync(filePath);
        return JSON.parse(data);
    }
}

// Usage example for compression
const text = 'Hello my name is sahil.';

// Compress text
const { encodedBytes, reverseMapping } = HuffmanCoding.compressText(text);

// Save compressed data to file
const compressedFilePath = 'compressed_data.huffman';
HuffmanCoding.saveCompressedData(encodedBytes, reverseMapping, compressedFilePath);

console.log('Text compressed and saved to:', compressedFilePath);

// Usage example for decompression
// Load compressed data from file
const { encodedBytes: compressedBytes, reverseMapping: reverseMap } = HuffmanCoding.loadCompressedData(compressedFilePath);

// console.log('encoded  =', compressedBytes);
// Decompress data
const decompressedText = HuffmanCoding.decompressData(compressedBytes, reverseMap);

console.log('D =', decompressedText);
