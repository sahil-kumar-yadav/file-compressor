// pages/api/compress.js

import { buildFrequencyMap, buildHuffmanTree, buildEncodingMap, encodeText, decodeText } from "@/utils/huffmanCoding";

// import { buildFrequencyMap, buildHuffmanTree, buildEncodingMap, encodeText, decodeText } from '../../utils/huffman';

export default function handler(req, res) {
    if (req.method === 'POST') {
        const text = req.body.text;
        const frequencyMap = buildFrequencyMap(text);
        const huffmanTree = buildHuffmanTree(frequencyMap);
        const encodingMap = buildEncodingMap(huffmanTree);
        const encodedText = encodeText(text, encodingMap);

        res.status(200).json({ encodedText });
    } else {
        // res.status(405).end();
    }
}
