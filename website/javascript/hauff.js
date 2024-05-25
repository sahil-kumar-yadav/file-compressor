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

    // Save compressed data to file
    static saveCompressedData(encodedBytes, reverseMapping, outputPath) {
        const data = {
            reverseMapping,
            encodedBytes: Buffer.from(encodedBytes),
        };

        require('fs').writeFileSync(outputPath, JSON.stringify(data));
    }

    
}

// Usage example
const text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';

// Compress text
const { encodedBytes, reverseMapping } = HuffmanCoding.compressText(text);

// Save compressed data to file
const outputPath = 'compressed_data.huffman';
HuffmanCoding.saveCompressedData(encodedBytes, reverseMapping, outputPath);

console.log('Text compressed and saved to:', outputPath);
