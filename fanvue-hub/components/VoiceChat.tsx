'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Trash2, Send } from 'lucide-react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    temperature?: number;
    audioUrl?: string;
}

interface VoiceChatProps {
    characterId: string;  // ✅ ADDED for memory
    characterSlug: string;
    characterName: string;
    systemPrompt?: string;
    systemInstruction?: string;  // ✅ ADDED for better context
    nsfwEnabled?: boolean;
}

export default function VoiceChat({
    characterId,
    characterSlug,
    characterName,
    systemPrompt,
    systemInstruction,
    nsfwEnabled = false
}: VoiceChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [temperature, setTemperature] = useState(20);
    const [moodLevel, setMoodLevel] = useState<'sfw' | 'suggestive' | 'explicit'>('sfw');
    const [error, setError] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Start recording
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);

            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                await processAudio(audioBlob);

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setError(null);
        } catch (err) {
            console.error('Error starting recording:', err);
            setError('Microphone access denied. Please allow microphone permissions.');
        }
    };

    // Stop recording
    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    // Process recorded audio
    const processAudio = async (audioBlob: Blob) => {
        setIsProcessing(true);
        setError(null);

        try {
            // 1. Transcribe audio (Whisper via VoxCPM)
            const formData = new FormData();
            formData.append('audio', audioBlob, 'recording.webm');

            const transcribeRes = await fetch('/api/voxcpm/transcribe', {
                method: 'POST',
                body: formData
            });

            if (!transcribeRes.ok) {
                throw new Error('Transcription failed');
            }

            const { transcript } = await transcribeRes.json();

            if (!transcript) {
                throw new Error('No transcript returned');
            }

            // Add user message
            const userMessage: Message = {
                role: 'user',
                content: transcript,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, userMessage]);

            // 2. Get AI response from Ollama
            const chatRes = await fetch('/api/ollama/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    characterId,  // ✅ ADDED for memory
                    characterSlug,
                    userId: 'voice-user',  // ✅ ADDED for memory (use unique ID if tracking users)
                    messages: [...messages, userMessage],
                    systemPrompt,
                    systemInstruction,  // ✅ ADDED for better context
                    nsfwEnabled
                })
            });

            if (!chatRes.ok) {
                throw new Error('AI response failed');
            }

            const { message: aiResponse, temperature: newTemp, moodLevel: newMood } = await chatRes.json();

            // Update temperature
            setTemperature(newTemp);
            setMoodLevel(newMood);

            // 3. Synthesize voice (VoxCPM)
            const ttsRes = await fetch('/api/voxcpm/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: aiResponse,
                    character: characterSlug
                })
            });

            if (!ttsRes.ok) {
                throw new Error('Voice synthesis failed');
            }

            const { audioUrl } = await ttsRes.json();

            // Add assistant message with audio
            const assistantMessage: Message = {
                role: 'assistant',
                content: aiResponse,
                timestamp: new Date(),
                temperature: newTemp,
                audioUrl
            };
            setMessages(prev => [...prev, assistantMessage]);

            // Play audio
            if (audioUrl) {
                const audio = new Audio(audioUrl);
                audio.play();
            }

        } catch (err: any) {
            console.error('Error processing audio:', err);
            setError(err.message || 'Voice chat failed');
        } finally {
            setIsProcessing(false);
        }
    };

    // Clear conversation
    const clearHistory = () => {
        setMessages([]);
        setTemperature(20);
        setMoodLevel('sfw');
    };

    // Get temperature meter visual
    const getTemperatureMeter = () => {
        const filled = Math.round(temperature / 10);
        const empty = 10 - filled;
        return '█'.repeat(filled) + '░'.repeat(empty);
    };

    // Get mood color
    const getMoodColor = () => {
        if (temperature < 30) return 'text-green-500';
        if (temperature < 70) return 'text-amber-500';
        return 'text-red-500';
    };

    return (
        <div className="flex flex-col h-[600px] bg-gray-900 rounded-lg border border-gray-800">
            {/* Header with temperature meter */}
            <div className="p-4 border-b border-gray-800">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-white">
                        💬 Voice Chat with {characterName}
                    </h3>
                    <button
                        onClick={clearHistory}
                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                        title="Clear conversation"
                    >
                        <Trash2 className="w-4 h-4 text-gray-400" />
                    </button>
                </div>

                {/* Temperature display */}
                <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Mood Meter:</span>
                        <span className={`font-mono ${getMoodColor()}`}>
                            {temperature}%
                        </span>
                    </div>
                    <div className="font-mono text-lg text-gray-300">
                        [{getTemperatureMeter()}]
                    </div>
                    <div className="text-sm text-gray-500">
                        Current Mode: <span className={`capitalize ${getMoodColor()}`}>{moodLevel}</span>
                        {' • Auto-adapting to conversation'}
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                        <Mic className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Press and hold the microphone to start talking</p>
                        <p className="text-sm mt-2">Your conversation will adapt to the mood</p>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[70%] rounded-lg p-3 ${msg.role === 'user'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-800 text-gray-100'
                                }`}
                        >
                            <div className="text-xs opacity-70 mb-1">
                                {msg.role === 'user' ? 'You' : characterName} •{' '}
                                {msg.timestamp.toLocaleTimeString()}
                            </div>
                            <div className="whitespace-pre-wrap">{msg.content}</div>
                            {msg.audioUrl && (
                                <audio controls className="mt-2 w-full" src={msg.audioUrl} />
                            )}
                        </div>
                    </div>
                ))}

                {isProcessing && (
                    <div className="flex justify-start">
                        <div className="bg-gray-800 rounded-lg p-3 text-gray-400">
                            <div className="flex items-center space-x-2">
                                <div className="animate-pulse">💭</div>
                                <span>Thinking...</span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Error display */}
            {error && (
                <div className="px-4 py-2 bg-red-900/20 border-t border-red-900/50 text-red-400 text-sm">
                    ⚠️ {error}
                </div>
            )}

            {/* Controls */}
            <div className="p-4 border-t border-gray-800">
                <div className="flex items-center justify-center">
                    <button
                        onMouseDown={startRecording}
                        onMouseUp={stopRecording}
                        onTouchStart={startRecording}
                        onTouchEnd={stopRecording}
                        disabled={isProcessing}
                        className={`
              flex items-center justify-center w-16 h-16 rounded-full transition-all
              ${isRecording
                                ? 'bg-red-600 scale-110 animate-pulse'
                                : isProcessing
                                    ? 'bg-gray-700 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
                            }
              disabled:opacity-50
            `}
                    >
                        {isRecording ? (
                            <Square className="w-6 h-6 text-white" />
                        ) : (
                            <Mic className="w-6 h-6 text-white" />
                        )}
                    </button>
                </div>
                <p className="text-center text-xs text-gray-500 mt-2">
                    {isRecording ? 'Recording... Release to send' : 'Hold to talk'}
                </p>
            </div>
        </div>
    );
}
