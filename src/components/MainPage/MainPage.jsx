"use client";
import React, { useState } from 'react';
import { buildHuffmanTree, generateHuffmanCodes, encodeText, decodeText } from '@/utils/huffmanCoding';

function MainPage() {
    const [inputText, setInputText] = useState('');
    const [encodedText, setEncodedText] = useState('');
    const [codesString, setCodesString] = useState('');
    const [decodeInputText, setDecodeInputText] = useState('');
    const [decodeCodesString, setDecodeCodesString] = useState('');
    const [decodedText, setDecodedText] = useState('');
    const [isEncoding, setIsEncoding] = useState(false);
    const [isDecoding, setIsDecoding] = useState(false);

    const handleEncode = () => {
        setIsEncoding(true);
        setTimeout(() => {
            const { encodedText, codesString } = encodeText(inputText);
            setEncodedText(encodedText);
            setCodesString(codesString);
            setIsEncoding(false);
        }, 1000);
    };

    const handleDecode = () => {
        setIsDecoding(true);
        setTimeout(() => {
            try {
                const decoded = decodeText(decodeInputText, decodeCodesString);
                setDecodedText(decoded);
            } catch (error) {
                setDecodedText("Error during decoding. Ensure Huffman codes are correct.");
            } finally {
                setIsDecoding(false);
            }
        }, 1000);
    };

    return (
        <div className="App p-8 bg-gray-100 min-h-screen flex flex-col items-center space-y-8">
            <h1 className="text-4xl font-bold text-blue-600 animate-fadeIn">Compression using Huffman Coding </h1>

            <div className="section bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl space-y-6">
                <h2 className="text-2xl font-semibold text-gray-800">Encode Text</h2>
                <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Enter text to encode"
                    rows="4"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    onClick={handleEncode}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition transform hover:scale-105 focus:scale-95"
                >
                    {isEncoding ? <span className="animate-spin">🔄 Encoding...</span> : 'Encode'}
                </button>
                <div className="encoded-output">
                    <h3 className="text-lg font-semibold text-gray-700">Encoded Text:</h3>
                    <textarea
                        value={encodedText}
                        readOnly
                        rows="4"
                        className="w-full p-3 mt-2 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none"
                    />
                </div>
                <div className="huffman-codes-output">
                    <h3 className="text-lg font-semibold text-gray-700">Huffman Codes (JSON):</h3>
                    <textarea
                        value={codesString}
                        readOnly
                        rows="4"
                        className="w-full p-3 mt-2 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none"
                    />
                </div>
            </div>

            <div className="section bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl space-y-6">
                <h2 className="text-2xl font-semibold text-gray-800">Decode Text</h2>
                <textarea
                    value={decodeInputText}
                    onChange={(e) => setDecodeInputText(e.target.value)}
                    placeholder="Enter binary string to decode"
                    rows="4"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                    value={decodeCodesString}
                    onChange={(e) => setDecodeCodesString(e.target.value)}
                    placeholder='Enter Huffman codes as JSON (e.g., {"A":"0","B":"110"})'
                    rows="4"
                    className="w-full p-3 mt-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    onClick={handleDecode}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition transform hover:scale-105 focus:scale-95"
                >
                    {isDecoding ? <span className="animate-spin">🔄 Decoding...</span> : 'Decode'}
                </button>
                <div className="decoded-output">
                    <h3 className="text-lg font-semibold text-gray-700">Decoded Text:</h3>
                    <textarea
                        value={decodedText}
                        readOnly
                        rows="4"
                        className="w-full p-3 mt-2 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none"
                    />
                </div>
            </div>
        </div>
    );
}

export default MainPage;
