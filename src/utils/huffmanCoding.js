class HuffmanNode {
    constructor(char, freq) {
        this.char = char;
        this.freq = freq;
        this.left = null;
        this.right = null;
    }
}

export function buildHuffmanTree(frequencies) {
    const nodes = Object.keys(frequencies).map(char => new HuffmanNode(char, frequencies[char]));

    while (nodes.length > 1) {
        nodes.sort((a, b) => a.freq - b.freq); // Sort nodes by frequency
        const left = nodes.shift(); // Remove the node with the smallest frequency
        const right = nodes.shift(); // Remove the next node with the smallest frequency

        const merged = new HuffmanNode(null, left.freq + right.freq); // Create a new internal node
        merged.left = left;
        merged.right = right;

        nodes.push(merged); // Add the merged node back into the list
    }

    return nodes[0]; // The root of the Huffman tree
}

export function generateHuffmanCodes(root, prefix = '', codes = {}) {
    if (root === null) return;

    if (root.char !== null) {
        codes[root.char] = prefix;
    }

    generateHuffmanCodes(root.left, prefix + '0', codes);
    generateHuffmanCodes(root.right, prefix + '1', codes);
    return codes;
}

export function encodeText(text) {
    const frequencies = text.split('').reduce((acc, char) => {
        acc[char] = (acc[char] || 0) + 1;
        return acc;
    }, {});

    const huffmanTree = buildHuffmanTree(frequencies);
    const huffmanCodes = generateHuffmanCodes(huffmanTree);

    const encodedText = text.split('').map(char => huffmanCodes[char]).join('');

    // Convert Huffman codes to a string representation
    const codesString = JSON.stringify(huffmanCodes);

    // Combine encoded text and Huffman codes
    return {
        encodedText,
        codesString
    };
}

export function decodeText(encodedText, codesString) {
    // Parse Huffman codes from the input
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
