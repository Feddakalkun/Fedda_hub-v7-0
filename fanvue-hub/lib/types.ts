
// Common types for content generation

export interface Scene {
    id: string;
    title: string;
    caption: string;
    scene: string;
    mood: string;
    color_scheme?: 'red' | 'black' | 'white' | 'pink' | 'purple' | 'natural';
    lighting?: 'warm-2700K' | 'warm-3000K' | 'natural' | 'golden-hour' | 'soft' | 'dramatic';
    optimal_time?: string;
    best_days?: string[];
    time_window?: 'morning-tease' | 'afternoon-casual' | 'evening-money' | 'late-night-intimate' | 'weekend-lazy';
}
