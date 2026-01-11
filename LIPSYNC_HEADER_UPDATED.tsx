'use client';

import { useState, useEffect } from 'react';

interface LipsyncGeneratorProps {
    characterSlug: string;
    characterName: string;
    avatarUrl?: string;
    generatedVideos?: { url: string, text: string }[];
    setGeneratedVideos?: React.Dispatch<React.SetStateAction<{ url: string, text: string }[]>>;
}

export default function LipsyncGenerator({
    characterSlug,
    characterName,
    avatarUrl,
    generatedVideos: propVideos,
    setGeneratedVideos: propSetVideos
}: LipsyncGeneratorProps) {
    const [text, setText] = useState('');
    const [referenceImage, setReferenceImage] = useState(avatarUrl || '');
    const [resolution, setResolution] = useState('512');
    const [uploadedVoicePath, setUploadedVoicePath] = useState<string | null>(null);
    const [uploadedVoiceName, setUploadedVoiceName] = useState<string | null>(null);
    const [availableVoices, setAvailableVoices] = useState<{ name: string, description: string }[]>([]);
    const [selectedPresetVoice, setSelectedPresetVoice] = useState<string>('');
    const [isUploading, setIsUploading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    // Internal state fallback if props are not provided
    const [internalVideos, setInternalVideos] = useState<{ url: string, text: string }[]>([]);

    // Use props if available, otherwise internal state
    const generatedVideos = propVideos || internalVideos;
    const setGeneratedVideos = propSetVideos || setInternalVideos;

    // Check localStorage for image sent from Library
    useEffect(() => {
        const storedImage = localStorage.getItem('lipsyncInputImage');
        if (storedImage) {
            setReferenceImage(storedImage);
            // Clear it so it doesn't auto-populate again
            localStorage.removeItem('lipsyncInputImage');
        }
    }, []);

    // Load available voices
    useEffect(() => {
        fetch('/api/voxcpm/voices')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.voices) {
                    setAvailableVoices(data.voices);
                }
            })
            .catch(err => console.error('Failed to load voices:', err));
    }, []);

// ... rest of the component stays the same
// (processVoiceFile, handleVoiceUpload, handleVoiceDrop functions remain unchanged)
