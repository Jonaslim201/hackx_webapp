import { useRef, useEffect, useState } from "react";
import type { Evidence, MapData } from "../types/types";

interface MapEditorProps {
    baseImage: string;
    mapData: MapData;
    evidence: Evidence[];
    onEvidenceUpdate: (evidence: Evidence[]) => void;
}

export default function MapEditor({
    baseImage,
    mapData,
    evidence,
    onEvidenceUpdate,
}: MapEditorProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [scale, setScale] = useState(2);
    const [imageLoaded, setImageLoaded] = useState<HTMLImageElement | null>(null);
    const [initialized, setInitialized] = useState(false); // NEW: Track initialization

    const scaledWidth = mapData.width * scale;
    const scaledHeight = mapData.height * scale;
    const selectedEvidence = evidence.find((e) => e.id === selectedId);

    // NEW: Initialize original positions for existing markers
    useEffect(() => {
        if (!initialized && evidence.length > 0) {
            const needsInitialization = evidence.some(e => !e.originalPosition);
            
            if (needsInitialization) {
                const updated = evidence.map(e => ({
                    ...e,
                    originalPosition: e.originalPosition || { ...e.pixel }, // Set original position if not exists
                    images: e.images || [], // Ensure images array exists
                }));
                onEvidenceUpdate(updated);
            }
            
            setInitialized(true);
        }
    }, [evidence, initialized, onEvidenceUpdate]);

    // Load image
    useEffect(() => {
        const img = new Image();
        img.src = baseImage;
        img.onload = () => setImageLoaded(img);
    }, [baseImage]);

    // Draw everything
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !imageLoaded) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, scaledWidth, scaledHeight);
        ctx.drawImage(imageLoaded, 0, 0, scaledWidth, scaledHeight);

        // Draw contours
        ctx.strokeStyle = "rgba(0, 100, 255, 0.5)";
        ctx.lineWidth = 1;
        for (const contour of mapData.contours) {
            ctx.beginPath();
            contour.forEach((p, i) => {
                const x = p.x * scale;
                const y = p.y * scale;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.closePath();
            ctx.stroke();
        }

        // Draw markers
        for (const e of evidence) {
            const x = e.pixel.x * scale;
            const y = e.pixel.y * scale;
            ctx.beginPath();
            ctx.arc(x, y, 8, 0, 2 * Math.PI);
            ctx.fillStyle = selectedId === e.id ? "#ffeb3b" : "#f44336";
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 2;
            ctx.fill();
            ctx.stroke();
        }
    }, [evidence, imageLoaded, selectedId, scale, mapData]);

    // Handle click and drag
    const getMarkerAt = (x: number, y: number) => {
        const r = 8 * scale;
        return evidence.find(
            (e) =>
                Math.hypot(x - e.pixel.x * scale, y - e.pixel.y * scale) <=
                r
        );
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const hit = getMarkerAt(x, y);

        if (hit) {
            setSelectedId(hit.id);
            setDraggingId(hit.id);
        } else {
            setSelectedId(null);
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!draggingId || !canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const updated = evidence.map((ev) =>
            ev.id === draggingId
                ? { ...ev, pixel: { x: x / scale, y: y / scale } }
                : ev
        );
        onEvidenceUpdate(updated);
    };

    const handleMouseUp = () => {
        setDraggingId(null);
    };

    // Add marker
    const handleAddMarker = () => {
        const centerPixel = { x: mapData.width / 2, y: mapData.height / 2 };
        const newEvidence: Evidence = {
            id: `marker-${Date.now()}`,
            x: "0",
            y: "0",
            time: new Date().toLocaleTimeString(),
            pixel: centerPixel,
            originalPosition: centerPixel,
            label: "New Marker",
            category: "uncategorized",
            notes: "",
            images: [],
        };
        onEvidenceUpdate([...evidence, newEvidence]);
        setSelectedId(newEvidence.id);
    };

    // Delete marker
    const handleDelete = () => {
        if (selectedId) {
            onEvidenceUpdate(evidence.filter((e) => e.id !== selectedId));
            setSelectedId(null);
        }
    };

    // Reset position to original
    const handleResetPosition = () => {
        if (!selectedId || !selectedEvidence?.originalPosition) return;
        const updated = evidence.map((e) =>
            e.id === selectedId
                ? { ...e, pixel: { ...e.originalPosition! } }
                : e
        );
        onEvidenceUpdate(updated);
    };

    // Update field
    const updateField = (field: keyof Evidence, value: string) => {
        if (!selectedId) return;
        const updated = evidence.map((e) =>
            e.id === selectedId ? { ...e, [field]: value } : e
        );
        onEvidenceUpdate(updated);
    };

    // Handle image upload
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || !selectedId) return;

        const fileArray = Array.from(files);
        const readers = fileArray.map((file) => {
            return new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    resolve(event.target?.result as string);
                };
                reader.readAsDataURL(file);
            });
        });

        Promise.all(readers).then((base64Images) => {
            const updated = evidence.map((e) =>
                e.id === selectedId
                    ? { ...e, images: [...(e.images || []), ...base64Images] }
                    : e
            );
            onEvidenceUpdate(updated);
        });

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // Delete image
    const handleDeleteImage = (imageIndex: number) => {
        if (!selectedId || !selectedEvidence) return;
        const updated = evidence.map((e) =>
            e.id === selectedId
                ? {
                      ...e,
                      images: e.images?.filter((_, i) => i !== imageIndex) || [],
                  }
                : e
        );
        onEvidenceUpdate(updated);
    };

    // Export map
    const handleExport = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const url = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = url;
        a.download = "annotated-map.png";
        a.click();
    };

    return (
        <div style={{ display: "flex", gap: "20px", padding: "20px" }}>
            {/* Canvas */}
            <div style={{ flex: 1 }}>
                <div style={{ marginBottom: "10px" }}>
                    <label>Zoom: </label>
                    <input
                        type="range"
                        min="1"
                        max="4"
                        step="0.5"
                        value={scale}
                        onChange={(e) => setScale(Number(e.target.value))}
                    />
                    <span>{scale}x</span>
                    <button onClick={handleAddMarker} style={{ marginLeft: "20px" }}>
                        Add Marker
                    </button>
                    <button
                        onClick={handleExport}
                        style={{
                            marginLeft: "20px",
                            backgroundColor: "#2196f3",
                            color: "white",
                            padding: "6px 10px",
                            borderRadius: "4px",
                            border: "none",
                        }}
                    >
                        Download Map
                    </button>
                    <span style={{ marginLeft: "20px", color: "#666" }}>
                        Total markers: {evidence.length}
                    </span>
                </div>
                <canvas
                    ref={canvasRef}
                    width={scaledWidth}
                    height={scaledHeight}
                    style={{
                        border: "2px solid #ccc",
                        backgroundColor: "#f0f0f0",
                        cursor: draggingId ? "grabbing" : "pointer",
                    }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                />
            </div>

            {/* Editor Panel */}
            <div
                style={{
                    width: "350px",
                    padding: "20px",
                    border: "1px solid #ccc",
                    backgroundColor: "#f9f9f9",
                    borderRadius: "8px",
                    maxHeight: "80vh",
                    overflowY: "auto",
                }}
            >
                <h3>Marker Editor</h3>
                {selectedEvidence ? (
                    <>
                        <p style={{ fontSize: "12px", color: "#777" }}>
                            ID: {selectedEvidence.id}
                        </p>
                        <div style={{ marginBottom: "10px" }}>
                            <label>Label</label>
                            <input
                                value={selectedEvidence.label}
                                onChange={(e) => updateField("label", e.target.value)}
                                style={{ width: "100%", padding: "5px" }}
                            />
                        </div>
                        <div style={{ marginBottom: "10px" }}>
                            <label>Category</label>
                            <input
                                value={selectedEvidence.category}
                                onChange={(e) => updateField("category", e.target.value)}
                                style={{ width: "100%", padding: "5px" }}
                            />
                        </div>
                        <div style={{ marginBottom: "10px" }}>
                            <label>Notes</label>
                            <textarea
                                value={selectedEvidence.notes}
                                onChange={(e) => updateField("notes", e.target.value)}
                                rows={4}
                                style={{ width: "100%", padding: "5px" }}
                            />
                        </div>

                        {/* Images Section */}
                        <div style={{ marginBottom: "15px" }}>
                            <label style={{ fontWeight: "bold", display: "block", marginBottom: "5px" }}>
                                Images ({selectedEvidence.images?.length || 0})
                            </label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageUpload}
                                style={{ display: "none" }}
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    width: "100%",
                                    padding: "8px",
                                    backgroundColor: "#4caf50",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    marginBottom: "10px",
                                }}
                            >
                                Upload Images
                            </button>

                            {/* Display uploaded images */}
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                                {selectedEvidence.images?.map((img, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            position: "relative",
                                            width: "80px",
                                            height: "80px",
                                        }}
                                    >
                                        <img
                                            src={img}
                                            alt={`Evidence ${idx + 1}`}
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                                borderRadius: "4px",
                                                border: "1px solid #ddd",
                                            }}
                                        />
                                        <button
                                            onClick={() => handleDeleteImage(idx)}
                                            style={{
                                                position: "absolute",
                                                top: "-5px",
                                                right: "-5px",
                                                width: "20px",
                                                height: "20px",
                                                borderRadius: "50%",
                                                backgroundColor: "#f44336",
                                                color: "white",
                                                border: "none",
                                                cursor: "pointer",
                                                fontSize: "12px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <p style={{ color: "#666", fontSize: "12px" }}>
                            x: {selectedEvidence.pixel.x.toFixed(1)}, y:{" "}
                            {selectedEvidence.pixel.y.toFixed(1)}
                        </p>

                        {/* Reset Position Button */}
                        <button
                            onClick={handleResetPosition}
                            disabled={!selectedEvidence.originalPosition}
                            style={{
                                width: "100%",
                                backgroundColor: selectedEvidence.originalPosition ? "#ff9800" : "#ccc",
                                color: "white",
                                padding: "8px",
                                border: "none",
                                borderRadius: "4px",
                                cursor: selectedEvidence.originalPosition ? "pointer" : "not-allowed",
                                marginBottom: "10px",
                            }}
                        >
                            Reset Position
                        </button>

                        <button
                            onClick={handleDelete}
                            style={{
                                width: "100%",
                                backgroundColor: "#f44336",
                                color: "white",
                                padding: "8px",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                            }}
                        >
                            Delete Marker
                        </button>
                    </>
                ) : (
                    <p style={{ color: "#999" }}>Click a marker to edit or move</p>
                )}
            </div>
        </div>
    );
}