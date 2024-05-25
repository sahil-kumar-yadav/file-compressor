// Huffman coding implementation

class HuffmanNode {
    constructor(char, frequency) {
        this.char = char;
        this.frequency = frequency;
        this.left = null;
        this.right = null;
    }
}

function buildFrequencyMap(text) {
    const frequencyMap = new Map();
    for (let char of text) {
        frequencyMap.set(char, (frequencyMap.get(char) || 0) + 1);
    }
    return frequencyMap;
}

function buildHuffmanTree(frequencyMap) {
    const nodes = [];
    for (let [char, frequency] of frequencyMap) {
        nodes.push(new HuffmanNode(char, frequency));
    }

    while (nodes.length > 1) {
        nodes.sort((a, b) => a.frequency - b.frequency);
        const left = nodes.shift();
        const right = nodes.shift();
        const parent = new HuffmanNode(null, left.frequency + right.frequency);
        parent.left = left;
        parent.right = right;
        nodes.push(parent);
    }

    return nodes[0];
}

function buildEncodingMap(root, prefix = '', encodingMap = {}) {
    if (root) {
        if (root.char !== null) {
            encodingMap[root.char] = prefix;
        }
        buildEncodingMap(root.left, prefix + '0', encodingMap);
        buildEncodingMap(root.right, prefix + '1', encodingMap);
    }
    return encodingMap;
}

function encodeText(text, encodingMap) {
    let encodedText = '';
    for (let char of text) {
        encodedText += encodingMap[char];
    }
    return encodedText;
}

function decodeText(encodedText, root) {
    let decodedText = '';
    let currentNode = root;
    for (let bit of encodedText) {
        if (bit === '0') {
            currentNode = currentNode.left;
        } else if (bit === '1') {
            currentNode = currentNode.right;
        }

        if (currentNode.char !== null) {
            decodedText += currentNode.char;
            currentNode = root;
        }
    }
    return decodedText;
}
// Next.js API route
export default function handler(req, res) {
    const text = req.body.text;
    const frequencyMap = buildFrequencyMap(text);
    const huffmanTree = buildHuffmanTree(frequencyMap);
    const encodingMap = buildEncodingMap(huffmanTree);
    const encodedText = encodeText(text, encodingMap);
    const decodedText = decodeText(encodedText, huffmanTree);
    
    res.status(200).json({ encodedText, decodedText });
}
export {buildFrequencyMap, buildHuffmanTree, buildEncodingMap, encodeText, decodeText}
