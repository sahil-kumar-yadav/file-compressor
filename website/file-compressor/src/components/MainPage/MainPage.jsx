// pages/index.js
"use client"

import { useState } from 'react';

export default function MainPage() {
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');

    const compressText = async () => {
        const res = await fetch('/api/compress', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: inputText }),
        });
        const data = await res.json();
        setOutputText(data.encodedText);
    };

    const decompressText = async () => {
        const res = await fetch('/api/decompress', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ encodedText: outputText }),
        });
        const data = await res.json();
        setInputText(data.decodedText);
    };

    return (
        <div>
            <h1>Huffman Coding Text Compression and Decompression</h1>
            <div>
                <h2>Input Text</h2>
                <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    rows={5}
                    cols={50}
                />
            </div>
            <div>
                <button onClick={compressText}>Compress</button>
                <button onClick={decompressText}>Decompress</button>
            </div>
            <div>
                <h2>Output Text</h2>
                <textarea
                    value={outputText}
                    readOnly
                    rows={5}
                    cols={50}
                />
            </div>
        </div>
    );
}
