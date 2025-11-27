export type Point = { x: number; y: number };

export type MapData = {
  width: number;
  height: number;
  contours: Point[][];
}

export type Evidence = {
  id: string;
  x?: string;
  y?: string;
  time?: string;
  pixel: Point;
  label?: string;
  category?: string;
  notes?: string;
  imageKey?: string | null;
  imageUrl?: string | null;
  imageData?: string | null; // data URL for pending uploads only
}
