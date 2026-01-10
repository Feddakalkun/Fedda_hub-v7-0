'use client';

import { useState, useEffect, useRef } from 'react';

export default function ChatbotPage() {
    const [isActive, setIsActive] = useState(false);
    const [autoPilot, setAutoPilot] = useState(false);
    const [logs, setLogs] = useState<any[]>([]);
    const [pendingActions, setPendingActions] = useState<any[]>([]);

    // Polling Interval
    useEffect(() => {
        let interval: any;
        if (isActive) {
            interval = setInterval(checkMessages, 5000); // Check every 5s
        }
        return () => clearInterval(interval);
    }, [isActive, autoPilot]);

    const checkMessages = async () => {
        try {
            const res = await fetch('/api/fanvue/bot/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ autoExecute: autoPilot })
            });
            const data = await res.json();

            if (data.success && data.actions.length > 0) {
                if (autoPilot) {
                    // Log execution
                    const newLogs = data.actions.map((a: any) => ({
                        time: new Date().toLocaleTimeString(),
                        msg: `🤖 Auto-Replied to ${a.userName}: "${a.proposedReply}" ${a.price ? `($${a.price})` : ''}`,
                        type: 'success'
                    }));
                    setLogs(prev => [...newLogs, ...prev]);
                } else {
                    // Update pending
                    setPendingActions(data.actions);
                }
            }
        } catch (e) {
            console.error(e);
        }
    };

    const approveAction = (action: any) => {
        // In real app, call API to send. For now, simulate.
        const newLog = {
            time: new Date().toLocaleTimeString(),
            msg: `✅ Approved reply to ${action.userName}`,
            type: 'success'
        };
        setLogs(prev => [newLog, ...prev]);
        setPendingActions(prev => prev.filter(a => a.conversationId !== action.conversationId));
    };

    return (
        <div style={{ padding: '0 24px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        🤖 Emily AI Auto-Responder
                        {isActive && <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 10px #4ade80' }}></span>}
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        Autonomous sales agent. Detects keywords and upsells PPV content while you sleep.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px', color: autoPilot ? '#ef4444' : 'var(--text-secondary)' }}>
                            {autoPilot ? '⚠️ AUTO-PILOT ON' : 'Manual Approval'}
                        </span>
                        <button
                            onClick={() => setAutoPilot(!autoPilot)}
                            style={{
                                width: '40px', height: '24px', borderRadius: '12px',
                                background: autoPilot ? '#ef4444' : 'rgba(255,255,255,0.1)',
                                position: 'relative', border: 'none', cursor: 'pointer', transition: 'all 0.3s'
                            }}
                        >
                            <div style={{
                                width: '20px', height: '20px', borderRadius: '50%', background: 'white',
                                position: 'absolute', top: '2px', left: autoPilot ? '18px' : '2px', transition: 'all 0.3s'
                            }} />
                        </button>
                    </div>
                    <button
                        onClick={() => setIsActive(!isActive)}
                        className={`btn ${isActive ? 'btn-secondary' : 'btn-primary'}`}
                        style={{ minWidth: '120px' }}
                    >
                        {isActive ? '🛑 STOP BOT' : '▶ START BOT'}
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', height: '600px' }}>

                {/* LEFT: Live Feed / Pending Actions */}
                <div className="glass-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', fontWeight: '600' }}>
                        👀 Detected Conversations
                    </div>
                    <div style={{ padding: '16px', flex: 1, overflowY: 'auto' }}>
                        {!isActive ? (
                            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '40px' }}>
                                Bot is offline. Click START to listen for messages.
                            </div>
                        ) : pendingActions.length === 0 ? (
                            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '40px' }}>
                                <div style={{ fontSize: '40px', marginBottom: '16px' }}>📡</div>
                                Scanning for new messages...
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {pendingActions.map((action, i) => (
                                    <div key={i} style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        borderRadius: '12px',
                                        padding: '16px',
                                        border: '1px solid rgba(255,255,255,0.1)'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span style={{ fontWeight: '600', color: '#60a5fa' }}>@{action.userName}</span>
                                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Just now</span>
                                        </div>
                                        <div style={{ padding: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', marginBottom: '12px', fontSize: '14px' }}>
                                            "{action.userMessage}"
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <div style={{ flex: 1, fontSize: '14px' }}>
                                                <span style={{ color: 'var(--text-secondary)' }}>Proposed Reply:</span><br />
                                                <span style={{ color: '#4ade80' }}>"{action.proposedReply}"</span>
                                                {action.price > 0 && <span style={{ color: '#fbbf24', marginLeft: '8px' }}>💰 ${action.price}</span>}
                                            </div>
                                            <button
                                                onClick={() => approveAction(action)}
                                                className="btn btn-primary"
                                                style={{ padding: '8px 16px', fontSize: '12px' }}
                                            >
                                                Approve
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: Terminal Logs */}
                <div style={{
                    background: '#0f172a',
                    borderRadius: '16px',
                    padding: '24px',
                    fontFamily: 'monospace',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div style={{ marginBottom: '16px', color: '#4ade80', fontSize: '14px' }}>
                        root@emily-ai:~# ./start_sales_agent.sh
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {logs.map((log, i) => (
                            <div key={i} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>
                                <span style={{ color: 'var(--text-secondary)', marginRight: '8px' }}>[{log.time}]</span>
                                {log.msg}
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
