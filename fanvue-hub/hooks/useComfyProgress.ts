'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

interface ProgressState {
    status: 'idle' | 'queued' | 'running' | 'done' | 'error';
    progress: number;  // 0-100
    currentNode: string;
    message: string;
    promptId?: string;
    error?: string;
}

export function useComfyProgress() {
    const [state, setState] = useState<ProgressState>({
        status: 'idle',
        progress: 0,
        currentNode: '',
        message: '',
    });

    const wsRef = useRef<WebSocket | null>(null);
    const pollTimerRef = useRef<NodeJS.Timeout | null>(null);
    const usePollingRef = useRef(false);

    // Cleanup function
    const cleanup = useCallback(() => {
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
        if (pollTimerRef.current) {
            clearTimeout(pollTimerRef.current);
            pollTimerRef.current = null;
        }
    }, []);

    // Polling fallback for when WebSocket fails
    const startPolling = useCallback(async (promptId: string) => {
        usePollingRef.current = true;

        const poll = async () => {
            try {
                // Use Next.js API proxy instead of direct ComfyUI (avoids CORS)
                const statusRes = await fetch(`/api/comfyui/status/${promptId}`);
                const statusData = await statusRes.json();

                setState(prev => ({
                    ...prev,
                    status: statusData.status,
                    message: statusData.message,
                    progress: statusData.progress
                }));

                // If done or error, stop polling
                if (statusData.status === 'done' || statusData.status === 'error') {
                    return;
                }

                // Continue polling
                pollTimerRef.current = setTimeout(poll, 2000);

            } catch (error) {
                console.error('Polling error:', error);
                setState(prev => ({
                    ...prev,
                    status: 'error',
                    message: 'Failed to check status'
                }));
            }
        };

        poll();
    }, []);

    // WebSocket monitoring (with fallback to polling)
    const startMonitoring = useCallback((promptId: string) => {
        cleanup();

        setState(prev => ({
            ...prev,
            promptId,
            status: 'queued',
            message: 'Connecting...',
            progress: 5
        }));

        // Try WebSocket first
        try {
            const ws = new WebSocket('ws://localhost:8188/ws');
            wsRef.current = ws;

            let wsConnected = false;

            ws.onopen = () => {
                console.log('🔗 ComfyUI WebSocket connected');
                wsConnected = true;
                setState(prev => ({ ...prev, message: 'Queued...', progress: 10 }));
            };

            ws.onmessage = (event) => {
                try {
                    const msg = JSON.parse(event.data);

                    // Filter messages for our prompt
                    if (msg.data?.prompt_id && msg.data.prompt_id !== promptId) return;

                    switch (msg.type) {
                        case 'status':
                            const execInfo = msg.data?.status?.exec_info;
                            if (execInfo?.queue_remaining !== undefined && execInfo.queue_remaining > 0) {
                                setState(prev => ({
                                    ...prev,
                                    status: 'queued',
                                    message: `Queued (${execInfo.queue_remaining} ahead)...`,
                                    progress: 15
                                }));
                            }
                            break;

                        case 'execution_start':
                            setState(prev => ({
                                ...prev,
                                status: 'running',
                                message: 'Starting execution...',
                                progress: 20
                            }));
                            break;

                        case 'executing':
                            const node = msg.data?.node;
                            if (node === null) {
                                // Execution complete
                                setState(prev => ({
                                    ...prev,
                                    message: 'Finalizing...',
                                    progress: 95
                                }));
                            } else {
                                // Node-specific messages
                                const nodeMap: Record<string, { msg: string, progress: number }> = {
                                    '28': { msg: 'Downloading models...', progress: 25 },
                                    '16': { msg: 'Loading diffusion model...', progress: 35 },
                                    '17': { msg: 'Loading VAE...', progress: 40 },
                                    '18': { msg: 'Loading CLIP...', progress: 45 },
                                    '126': { msg: 'Loading LoRA...', progress: 50 },
                                    '3': { msg: 'Generating image...', progress: 65 },
                                    '8': { msg: 'Decoding...', progress: 85 },
                                    '9': { msg: 'Saving...', progress: 90 }
                                };

                                const nodeInfo = nodeMap[node] || { msg: `Processing...`, progress: 60 };
                                setState(prev => ({
                                    ...prev,
                                    currentNode: node,
                                    message: nodeInfo.msg,
                                    progress: nodeInfo.progress
                                }));
                            }
                            break;

                        case 'progress':
                            if (msg.data?.value !== undefined && msg.data?.max !== undefined) {
                                const stepPct = Math.round((msg.data.value / msg.data.max) * 100);
                                setState(prev => ({
                                    ...prev,
                                    message: `Generating (step ${msg.data.value}/${msg.data.max})...`,
                                    progress: 65 + (stepPct * 0.2) // 65-85% range
                                }));
                            }
                            break;

                        case 'executed':
                            setState(prev => ({
                                ...prev,
                                status: 'done',
                                message: 'Complete!',
                                progress: 100
                            }));
                            cleanup();
                            break;

                        case 'execution_error':
                            setState(prev => ({
                                ...prev,
                                status: 'error',
                                message: 'Generation failed',
                                error: JSON.stringify(msg.data)
                            }));
                            cleanup();
                            break;
                    }
                } catch (e) {
                    console.error('WebSocket message error:', e);
                }
            };

            ws.onerror = (error) => {
                console.warn('WebSocket error, falling back to polling:', error);
                if (!wsConnected && !usePollingRef.current) {
                    // WebSocket failed to connect, use polling instead
                    cleanup();
                    startPolling(promptId);
                }
            };

            ws.onclose = () => {
                if (!usePollingRef.current && state.status !== 'done' && state.status !== 'error') {
                    // Connection closed unexpectedly, fallback to polling
                    console.log('WebSocket closed, falling back to polling');
                    startPolling(promptId);
                }
            };

            // Failsafe: If WebSocket doesn't connect in 3 seconds, use polling
            setTimeout(() => {
                if (!wsConnected && !usePollingRef.current) {
                    console.log('WebSocket timeout, using polling instead');
                    cleanup();
                    startPolling(promptId);
                }
            }, 3000);

        } catch (error) {
            console.error('WebSocket creation error, using polling:', error);
            startPolling(promptId);
        }
    }, [cleanup, startPolling]);

    const reset = useCallback(() => {
        cleanup();
        usePollingRef.current = false;
        setState({
            status: 'idle',
            progress: 0,
            currentNode: '',
            message: ''
        });
    }, [cleanup]);

    // Cleanup on unmount
    useEffect(() => {
        return () => cleanup();
    }, [cleanup]);

    return { state, startMonitoring, reset };
}
