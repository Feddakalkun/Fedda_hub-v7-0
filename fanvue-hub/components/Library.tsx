'use client';

import { useState, useEffect } from 'react';

interface LibraryItem {
    id: string;
    imageUrl: string;
    prompt: string;
    createdAt: string;
    mood?: string;
    isFavorite: boolean;
}

interface LibraryProps {
    characterSlug: string;
    onSelect?: (imageUrl: string) => void;
}

export default function Library({ characterSlug, onSelect }: LibraryProps) {
    const [items, setItems] = useState<LibraryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [previewItem, setPreviewItem] = useState<LibraryItem | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isSelectionMode, setIsSelectionMode] = useState(false);

    useEffect(() => {
        loadLibrary();
    }, [characterSlug]);

    const loadLibrary = async () => {
        try {
            const res = await fetch(`/api/characters/${characterSlug}/library`);
            const data = await res.json();
            if (data.success) {
                setItems(data.content);
            }
        } catch (e) {
            console.error('Failed to load library:', e);
        } finally {
            setLoading(false);
        }
    };

    const [isPosting, setIsPosting] = useState<string | null>(null);

    const handlePostToFanvue = async (imageUrl: string, prompt: string) => {
        if (!confirm(`Post this to Fanvue?`)) return;

        setIsPosting(imageUrl);
        try {
            const res = await fetch(`/api/characters/${characterSlug}/post`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageUrl,
                    caption: prompt || "From my library 📸",
                    isSubscriberOnly: false
                }),
            });
            const data = await res.json();
            if (data.success) {
                alert('Success! Posted to Fanvue.');
            } else {
                alert('Failed to post: ' + data.error);
            }
        } catch (e) {
            alert('Failed to post to Fanvue');
        } finally {
            setIsPosting(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this item from your library?')) return;

        // TODO: Create delete endpoint
        alert('Delete functionality coming soon!');
    };

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;
        if (!confirm(`Delete ${selectedIds.size} selected items?`)) return;

        // TODO: Create bulk delete endpoint
        alert(`Bulk delete for ${selectedIds.size} items coming soon!`);
        // After implementation, clear selection
        // setSelectedIds(new Set());
        // setIsSelectionMode(false);
    };

    const toggleSelection = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const selectAll = () => {
        setSelectedIds(new Set(items.map(item => item.id)));
    };

    const deselectAll = () => {
        setSelectedIds(new Set());
    };

    const handleSendToLipsync = (imageUrl: string) => {
        // Store in localStorage so the Lipsync tab can pick it up
        localStorage.setItem('lipsyncInputImage', imageUrl);
        alert('Image sent to Lipsync tab! 🎤 Switch to the "Lipsync Video" tab to continue.');
    };

    const handleSendToWan21 = (imageUrl: string) => {
        // Store in localStorage so the Wan2.1 tab can pick it up
        localStorage.setItem('wan21InputImage', imageUrl);
        alert('Image sent to Wan 2.1 Video tab! 🎬 Switch to the "Wan 2.1 Video" tab to continue.');
    };

    if (loading) {
        return (
            <div style={{
                padding: '60px 20px',
                textAlign: 'center',
                color: '#666'
            }}>
                <div style={{ fontSize: '24px', marginBottom: '12px' }}>⏳</div>
                <p>Loading library...</p>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div style={{
                padding: '60px 20px',
                textAlign: 'center',
                color: '#666',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '16px',
                border: '2px dashed #333'
            }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🖼️</div>
                <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Content Library</h3>
                <p>Your generated content will appear here.</p>
                <p style={{ fontSize: '13px', color: '#555', marginTop: '8px' }}>
                    Generate images or videos and click "Save to Library" to see them here!
                </p>
            </div>
        );
    }

    return (
        <div>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
                flexWrap: 'wrap',
                gap: '12px'
            }}>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold' }}>
                    Content Library ({items.length})
                    {selectedIds.size > 0 && (
                        <span style={{
                            fontSize: '14px',
                            color: '#3b82f6',
                            marginLeft: '12px',
                            fontWeight: 'normal'
                        }}>
                            ({selectedIds.size} selected)
                        </span>
                    )}
                </h3>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {!isSelectionMode ? (
                        <button
                            onClick={() => setIsSelectionMode(true)}
                            style={{
                                padding: '8px 16px',
                                background: 'rgba(59, 130, 246, 0.1)',
                                border: '1px solid rgba(59, 130, 246, 0.3)',
                                borderRadius: '8px',
                                color: '#3b82f6',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: '600'
                            }}
                        >
                            ☑️ Select Mode
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={selectAll}
                                style={{
                                    padding: '8px 16px',
                                    background: 'rgba(34, 197, 94, 0.1)',
                                    border: '1px solid rgba(34, 197, 94, 0.3)',
                                    borderRadius: '8px',
                                    color: '#22c55e',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: '600'
                                }}
                            >
                                ✅ Select All
                            </button>
                            <button
                                onClick={deselectAll}
                                style={{
                                    padding: '8px 16px',
                                    background: 'rgba(156, 163, 175, 0.1)',
                                    border: '1px solid rgba(156, 163, 175, 0.3)',
                                    borderRadius: '8px',
                                    color: '#9ca3af',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: '600'
                                }}
                            >
                                ⬜ Deselect All
                            </button>
                            <button
                                onClick={handleBulkDelete}
                                disabled={selectedIds.size === 0}
                                style={{
                                    padding: '8px 16px',
                                    background: selectedIds.size > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                                    border: `1px solid ${selectedIds.size > 0 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(107, 114, 128, 0.3)'}`,
                                    borderRadius: '8px',
                                    color: selectedIds.size > 0 ? '#ef4444' : '#6b7280',
                                    cursor: selectedIds.size > 0 ? 'pointer' : 'not-allowed',
                                    fontSize: '13px',
                                    fontWeight: '600'
                                }}
                            >
                                🗑️ Delete Selected
                            </button>
                            <button
                                onClick={() => {
                                    setIsSelectionMode(false);
                                    setSelectedIds(new Set());
                                }}
                                style={{
                                    padding: '8px 16px',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '8px',
                                    color: '#ccc',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: '600'
                                }}
                            >
                                ✕ Cancel
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Grid of content */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '20px'
            }}>
                {items.map((item) => {
                    const isVideo = item.mood === 'lipsync' || item.imageUrl.includes('.mp4') || item.imageUrl.includes('.gif');
                    const isSelected = selectedIds.has(item.id);

                    return (
                        <div
                            key={item.id}
                            style={{
                                position: 'relative',
                                background: '#111',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                border: isSelected ? '2px solid #3b82f6' : '1px solid #333',
                                transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.5)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                            onClick={() => {
                                if (isSelectionMode) {
                                    toggleSelection(item.id);
                                } else if (onSelect) {
                                    onSelect(item.imageUrl);
                                } else {
                                    setPreviewItem(item);
                                }
                            }}
                        >
                            {/* Media */}
                            {isVideo ? (
                                <video
                                    src={item.imageUrl}
                                    style={{
                                        width: '100%',
                                        height: '280px',
                                        objectFit: 'cover',
                                        display: 'block'
                                    }}
                                    muted
                                    loop
                                    onMouseEnter={(e) => (e.currentTarget as HTMLVideoElement).play()}
                                    onMouseLeave={(e) => (e.currentTarget as HTMLVideoElement).pause()}
                                />
                            ) : (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={item.imageUrl}
                                    alt="Generated content"
                                    style={{
                                        width: '100%',
                                        height: '280px',
                                        objectFit: 'cover',
                                        display: 'block'
                                    }}
                                />
                            )}

                            {/* Selection Checkbox - Top Left */}
                            {isSelectionMode && (
                                <div
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleSelection(item.id);
                                    }}
                                    style={{
                                        position: 'absolute',
                                        top: '12px',
                                        left: '12px',
                                        width: '32px',
                                        height: '32px',
                                        background: isSelected ? '#3b82f6' : 'rgba(0,0,0,0.7)',
                                        border: isSelected ? 'none' : '2px solid white',
                                        borderRadius: '6px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        zIndex: 20,
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {isSelected && <span style={{ color: 'white', fontSize: '18px' }}>✓</span>}
                                </div>
                            )}

                            {/* Select Overlay (for onSelect mode) */}
                            {onSelect && !isSelectionMode && (
                                <div style={{
                                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                    background: 'rgba(0,0,0,0.3)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    opacity: 0, transition: 'opacity 0.2s',
                                    zIndex: 10
                                }}
                                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                                    onMouseLeave={e => e.currentTarget.style.opacity = '0'}
                                >
                                    <div style={{
                                        padding: '8px 16px', borderRadius: '20px',
                                        background: '#3b82f6', color: 'white', fontWeight: 'bold',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                                    }}>
                                        Select Image
                                    </div>
                                </div>
                            )}

                            {/* Info bar */}
                            <div style={{
                                padding: '12px',
                                background: 'rgba(0,0,0,0.9)',
                                backdropFilter: 'blur(10px)'
                            }}>
                                <div style={{
                                    fontSize: '11px',
                                    color: '#888',
                                    marginBottom: '8px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                    {isVideo && <span style={{ color: '#f59e0b' }}>🎬 Video</span>}
                                </div>

                                {item.prompt && (
                                    <p style={{
                                        fontSize: '12px',
                                        color: '#ccc',
                                        marginBottom: '8px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {item.prompt}
                                    </p>
                                )}

                                {/* Action buttons - only show if NOT a video */}
                                {!isVideo && (
                                    <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSendToLipsync(item.imageUrl);
                                            }}
                                            style={{
                                                flex: '1 1 calc(50% - 3px)',
                                                padding: '6px 8px',
                                                background: 'rgba(168, 85, 247, 0.15)',
                                                border: '1px solid rgba(168, 85, 247, 0.3)',
                                                color: '#a855f7',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '11px',
                                                fontWeight: '600',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            🎤 Lipsync
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSendToWan21(item.imageUrl);
                                            }}
                                            style={{
                                                flex: '1 1 calc(50% - 3px)',
                                                padding: '6px 8px',
                                                background: 'rgba(34, 197, 94, 0.15)',
                                                border: '1px solid rgba(34, 197, 94, 0.3)',
                                                color: '#22c55e',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '11px',
                                                fontWeight: '600',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            🎬 Wan 2.1
                                        </button>
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: '6px' }}>
                                    <a
                                        href={item.imageUrl}
                                        download
                                        onClick={(e) => e.stopPropagation()}
                                        style={{
                                            flex: 1,
                                            padding: '6px 12px',
                                            background: '#333',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            textDecoration: 'none',
                                            textAlign: 'center'
                                        }}
                                    >
                                        ⬇️ Download
                                    </a>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handlePostToFanvue(item.imageUrl, item.prompt);
                                        }}
                                        disabled={isPosting === item.imageUrl}
                                        style={{
                                            padding: '6px 12px',
                                            background: '#0ea5e9',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: isPosting === item.imageUrl ? 'not-allowed' : 'pointer',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            opacity: isPosting === item.imageUrl ? 0.7 : 1
                                        }}
                                    >
                                        {isPosting === item.imageUrl ? '⏳' : '🚀 Post'}
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(item.id);
                                        }}
                                        style={{
                                            padding: '6px 12px',
                                            background: 'rgba(239, 68, 68, 0.2)',
                                            color: '#ef4444',
                                            border: '1px solid rgba(239, 68, 68, 0.3)',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                            fontWeight: '600'
                                        }}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Preview Modal */}
            {previewItem && (
                <div
                    onClick={() => setPreviewItem(null)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'rgba(0,0,0,0.95)',
                        zIndex: 2000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        padding: '40px'
                    }}
                >
                    <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
                        {previewItem.mood === 'lipsync' ? (
                            <video
                                src={previewItem.imageUrl}
                                controls
                                autoPlay
                                style={{
                                    maxWidth: '90vw',
                                    maxHeight: '90vh',
                                    borderRadius: '8px',
                                    boxShadow: '0 20px 60px rgba(0,0,0,0.8)'
                                }}
                                onClick={(e) => e.stopPropagation()}
                            />
                        ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={previewItem.imageUrl}
                                alt="Preview"
                                style={{
                                    maxWidth: '90vw',
                                    maxHeight: '90vh',
                                    objectFit: 'contain',
                                    borderRadius: '8px',
                                    boxShadow: '0 20px 60px rgba(0,0,0,0.8)'
                                }}
                                onClick={(e) => e.stopPropagation()}
                            />
                        )}
                        <button
                            onClick={() => setPreviewItem(null)}
                            style={{
                                position: 'absolute',
                                top: '-40px',
                                right: '0',
                                background: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                color: 'white',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '600'
                            }}
                        >
                            ✕ Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
