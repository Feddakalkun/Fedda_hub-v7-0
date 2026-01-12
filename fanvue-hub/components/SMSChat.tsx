'use client';

import { useState, useEffect, useRef } from 'react';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'character';
    timestamp: Date;
}

interface Character {
    id: string;
    name: string;
    slug: string;
    avatarUrl?: string;
    bio?: string;
}

interface SMSChatProps {
    character: Character;
    onBack: () => void;
}

export default function SMSChat({ character, onBack }: SMSChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async () => {
        if (!inputText.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputText,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsTyping(true);

        try {
            // 🎨 Check for image commands
            const { parseCommand } = await import('@/lib/command-parser');
            const command = parseCommand(inputText);

            if (command.type === 'image') {
                const imgRes = await fetch('/api/comfyui/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        characterSlug: character.slug,
                        prompt: command.prompt || 'sexy selfie',
                        numImages: 1
                    })
                });

                const imgData = await imgRes.json();
                const aiResponse = imgData.success
                    ? `Mmm okay babe 😘 generating that for you now...`
                    : `I tried but my camera's being weird rn 😅`;

                const aiMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    text: aiResponse,
                    sender: 'character',
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, aiMessage]);
                setIsTyping(false);
                return; // Skip normal chat
            }

            // Call Ollama API
            const res = await fetch('/api/ollama/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    characterId: character.id,  // ✅ ADDED: Required for memory loading
                    characterSlug: character.slug,
                    userId: 'sms-user',  // ✅ ADDED: Required for memory loading (use unique ID if you track users)
                    messages: [
                        ...messages.map(m => ({
                            role: m.sender === 'user' ? 'user' : 'assistant',
                            content: m.text
                        })),
                        { role: 'user', content: inputText }
                    ],
                    systemPrompt: character.bio,
                    systemInstruction: character.bio,  // ✅ ADDED: More context
                    nsfwEnabled: true
                })
            });

            const data = await res.json();

            if (data.success) {
                const aiMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    text: data.message,
                    sender: 'character',
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, aiMessage]);
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: '#000'
        }}>
            {/* Header */}
            <div style={{
                background: 'rgba(30,30,30,0.95)',
                backdropFilter: 'blur(20px)',
                padding: '12px 16px',
                borderBottom: '0.5px solid rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
            }}>
                <button
                    onClick={onBack}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#0A84FF',
                        fontSize: '16px',
                        cursor: 'pointer',
                        padding: '4px'
                    }}
                >
                    ‹ Back
                </button>
                <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: '#2a2a2a',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {character.avatarUrl ? (
                        <img src={character.avatarUrl} alt={character.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <span style={{ fontSize: '18px' }}>{character.name.charAt(0)}</span>
                    )}
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ color: '#fff', fontWeight: '600', fontSize: '16px' }}>{character.name}</div>
                </div>
            </div>

            {/* Messages */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
            }}>
                {messages.length === 0 && (
                    <div style={{ textAlign: 'center', color: '#666', marginTop: '40px' }}>
                        <div style={{ fontSize: '40px', marginBottom: '12px' }}>💬</div>
                        <div style={{ fontSize: '14px' }}>Start a conversation with {character.name}</div>
                    </div>
                )}

                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        style={{
                            display: 'flex',
                            justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                            marginBottom: '4px'
                        }}
                    >
                        <div style={{
                            maxWidth: '75%',
                            padding: '12px 16px',
                            borderRadius: '20px',
                            background: msg.sender === 'user'
                                ? '#0A84FF'
                                : 'rgba(60,60,60,1)',
                            color: '#fff',
                            fontSize: '16px',
                            lineHeight: '1.4',
                            wordWrap: 'break-word'
                        }}>
                            {msg.text}
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <div style={{
                            padding: '12px 16px',
                            borderRadius: '20px',
                            background: 'rgba(60,60,60,1)',
                            color: '#999',
                            fontSize: '16px'
                        }}>
                            <span style={{ animation: 'pulse 1.5s infinite' }}>●</span>
                            <span style={{ animation: 'pulse 1.5s infinite 0.2s' }}>●</span>
                            <span style={{ animation: 'pulse 1.5s infinite 0.4s' }}>●</span>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div style={{
                background: 'rgba(30,30,30,0.95)',
                backdropFilter: 'blur(20px)',
                padding: '8px 16px',
                borderTop: '0.5px solid rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}>
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="iMessage"
                    disabled={isTyping}
                    style={{
                        flex: 1,
                        background: 'rgba(60,60,60,1)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '20px',
                        padding: '10px 16px',
                        color: '#fff',
                        fontSize: '16px',
                        outline: 'none'
                    }}
                />
                <button
                    onClick={sendMessage}
                    disabled={!inputText.trim() || isTyping}
                    style={{
                        background: inputText.trim() ? '#0A84FF' : 'rgba(60,60,60,1)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: inputText.trim() ? 'pointer' : 'not-allowed',
                        fontSize: '20px',
                        transition: 'all 0.2s'
                    }}
                >
                    ↑
                </button>
            </div>

            <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
        </div>
    );
}
