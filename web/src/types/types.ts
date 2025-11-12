export interface Point {
    x: number;
    y: number;
}

export interface Evidence {
    id: string;
    x: string;
    y: string;
    time: string;
    pixel: { x: number; y: number };
    originalPosition?: { x: number; y: number };
    label: string;
    category: string;
    notes: string;
    images?: string[];
    locked?: boolean; // Add this line
}

export interface MapData {
    width: number;
    height: number;
    contours: Point[][];
}

