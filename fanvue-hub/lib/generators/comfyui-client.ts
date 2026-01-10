import axios from 'axios';
import WebSocket from 'ws';

export class ComfyUIClient {
    private baseURL: string;
    private wsURL: string;

    constructor() {
        // Default to env or local, but methods should prioritize dynamic config if passed or fetched.
        // Ideally we refactor to async init, but for minimal impact, let's leave constructor as fallback
        // and allow setting/updating URL.
        this.baseURL = process.env.COMFYUI_URL || 'http://localhost:8188';
        this.wsURL = this.baseURL.replace('http', 'ws');
    }

    public setBaseUrl(url: string) {
        this.baseURL = url;
        this.wsURL = this.baseURL.replace('http', 'ws');
    }

    /**
     * Check if ComfyUI is running and accessible
     */
    async isAvailable(): Promise<boolean> {
        try {
            await axios.get(`${this.baseURL}/system_stats`, { timeout: 2000 });
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Get system stats from ComfyUI
     */
    async getSystemStats() {
        const response = await axios.get(`${this.baseURL}/system_stats`);
        return response.data;
    }

    /**
     * Queue a workflow for execution
     */
    async queueWorkflow(params: {
        workflow: any; // Workflow JSON
        inputs?: Record<string, any>; // Input overrides
    }): Promise<{ prompt_id: string }> {
        const { workflow, inputs = {} } = params;

        // Replace inputs in workflow if provided
        const modifiedWorkflow = { ...workflow };

        Object.entries(inputs).forEach(([nodeId, values]) => {
            if (modifiedWorkflow[nodeId]) {
                modifiedWorkflow[nodeId].inputs = {
                    ...modifiedWorkflow[nodeId].inputs,
                    ...values,
                };
            }
        });

        const response = await axios.post(`${this.baseURL}/prompt`, {
            prompt: modifiedWorkflow,
            client_id: this.getClientId(),
        });

        return response.data;
    }

    /**
     * Get status of a queued workflow
     */
    async getPromptStatus(promptId: string) {
        const response = await axios.get(`${this.baseURL}/history/${promptId}`);
        return response.data;
    }

    /**
     * Download output file from ComfyUI
     */
    async downloadOutput(params: {
        filename: string;
        subfolder?: string;
        type?: 'output' | 'input' | 'temp';
    }): Promise<Buffer> {
        const { filename, subfolder = '', type = 'output' } = params;

        const response = await axios.get(`${this.baseURL}/view`, {
            params: { filename, subfolder, type },
            responseType: 'arraybuffer',
        });

        return Buffer.from(response.data);
    }

    /**
     * Get the queue status
     */
    async getQueue() {
        const response = await axios.get(`${this.baseURL}/queue`);
        return response.data;
    }

    /**
     * Cancel a prompt in the queue
     */
    async cancelPrompt(promptId: string) {
        const response = await axios.post(`${this.baseURL}/interrupt`, {
            delete: [promptId],
        });
        return response.data;
    }

    /**
     * Monitor workflow execution via WebSocket
     */
    async monitorExecution(promptId: string, onProgress?: (data: any) => void): Promise<any> {
        return new Promise((resolve, reject) => {
            const ws = new WebSocket(`${this.wsURL}/ws?clientId=${this.getClientId()}`);

            ws.on('message', (data) => {
                const message = JSON.parse(data.toString());

                if (message.type === 'progress' && onProgress) {
                    onProgress(message.data);
                }

                if (message.type === 'executing' && message.data.node === null) {
                    // Workflow completed
                    this.getPromptStatus(promptId).then((status) => {
                        ws.close();
                        resolve(status);
                    });
                }
            });

            ws.on('error', (error) => {
                reject(error);
            });
        });
    }

    /**
     * Upload an image to ComfyUI
     */
    async uploadImage(params: {
        image: Buffer;
        filename: string;
        subfolder?: string;
        overwrite?: boolean;
    }): Promise<{ name: string; subfolder: string }> {
        const { image, filename, subfolder = '', overwrite = false } = params;

        const FormData = require('form-data');
        const formData = new FormData();
        formData.append('image', image, {
            filename,
            contentType: 'image/png',
        });
        if (subfolder) formData.append('subfolder', subfolder);
        formData.append('overwrite', String(overwrite));

        const response = await axios.post(`${this.baseURL}/upload/image`, formData, {
            headers: {
                ...formData.getHeaders(),
            },
        });

        return response.data;
    }

    private getClientId(): string {
        return `fanvue_hub_${Date.now()}`;
    }
}

export const comfyuiClient = new ComfyUIClient();
