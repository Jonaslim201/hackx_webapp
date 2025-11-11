export interface Point {
    x: number;
    y: number;
}

export interface Evidence {
    id: string;
    x: string;
    y: string;
    time: string;
    pixel: Point;
    label?: string;
    category?: string;
    notes?: string;
    images?: string[];  // NEW: Array of base64 image strings
    originalPosition?: Point;  // NEW: Store original position for reset
}

export interface MapData {
    width: number;
    height: number;
    contours: Point[][];
}