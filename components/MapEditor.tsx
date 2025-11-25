"use client";

import { useEffect, useRef, useState } from "react";
import type { Evidence, MapData } from "../types/types";

interface MapEditorProps {
    baseImage: string;
    mapData: MapData;
    evidence: Evidence[];
    onEvidenceUpdate: (evidence: Evidence[]) => void;
    resolution?: number; // meters per pixel
}

export default function MapEditor({
    baseImage,
    mapData,
    evidence,
    onEvidenceUpdate,
    resolution = 0.05,
}: MapEditorProps) {
    // Keep marker IDs incremental so they round-trip cleanly with CSV rows
    const getNextMarkerId = () => {
        let maxId = 0;
        for (const ev of evidence) {
            const numeric = Number(ev.id);
            if (!Number.isNaN(numeric)) {
                maxId = Math.max(maxId, numeric);
            }
        }
        return String(maxId + 1);
    };

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [scale, setScale] = useState(2);
    const [imageLoaded, setImageLoaded] = useState<HTMLImageElement | null>(null);

    // Ruler state
    const [rulerMode, setRulerMode] = useState(false);
    const [rulerStart, setRulerStart] = useState<{ x: number; y: number } | null>(null);
    const [rulerEnd, setRulerEnd] = useState<{ x: number; y: number } | null>(null);
    const [distance, setDistance] = useState<number | null>(null);

    const scaledWidth = mapData.width * scale;
    const scaledHeight = mapData.height * scale;
    const selectedEvidence = evidence.find((e) => e.id === selectedId);

    useEffect(() => {
        const img = new Image();
        img.src = baseImage;
        img.onload = () => setImageLoaded(img);
    }, [baseImage]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !imageLoaded) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, scaledWidth, scaledHeight);
        ctx.drawImage(imageLoaded, 0, 0, scaledWidth, scaledHeight);

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

        for (const ev of evidence) {
            const x = ev.pixel.x * scale;
            const y = ev.pixel.y * scale;
            ctx.beginPath();
            ctx.arc(x, y, 8, 0, 2 * Math.PI);
            ctx.fillStyle = selectedId === ev.id ? "#ffeb3b" : "#f44336";
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 2;
            ctx.fill();
            ctx.stroke();
        }

        if (rulerStart) {
            const startX = rulerStart.x * scale;
            const startY = rulerStart.y * scale;
            ctx.beginPath();
            ctx.arc(startX, startY, 6, 0, 2 * Math.PI);
            ctx.fillStyle = "#4CAF50";
            ctx.fill();
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 2;
            ctx.stroke();

            if (rulerEnd) {
                const endX = rulerEnd.x * scale;
                const endY = rulerEnd.y * scale;
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(endX, endY);
                ctx.strokeStyle = "#4CAF50";
                ctx.lineWidth = 3;
                ctx.setLineDash([5, 5]);
                ctx.stroke();
                ctx.setLineDash([]);

                ctx.beginPath();
                ctx.arc(endX, endY, 6, 0, 2 * Math.PI);
                ctx.fillStyle = "#4CAF50";
                ctx.fill();
                ctx.strokeStyle = "#fff";
                ctx.lineWidth = 2;
                ctx.stroke();

                const midX = (startX + endX) / 2;
                const midY = (startY + endY) / 2;
                ctx.fillStyle = "#000";
                ctx.font = "bold 14px Arial";
                ctx.fillRect(midX - 40, midY - 15, 80, 20);
                ctx.fillStyle = "#fff";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(`${distance?.toFixed(2)}m`, midX, midY);
            }
        }
    }, [evidence, imageLoaded, selectedId, scale, mapData, rulerMode, rulerStart, rulerEnd, distance]);

    const getMarkerAt = (x: number, y: number) => {
        const r = 8 * scale;
        return evidence.find((ev) => Math.hypot(x - ev.pixel.x * scale, y - ev.pixel.y * scale) <= r);
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / scale;
        const y = (e.clientY - rect.top) / scale;

        if (rulerMode) {
            if (!rulerStart) {
                setRulerStart({ x, y });
                setRulerEnd(null);
                setDistance(null);
            } else if (!rulerEnd) {
                setRulerEnd({ x, y });
                const dx = (x - rulerStart.x) * resolution;
                const dy = (y - rulerStart.y) * resolution;
                setDistance(Math.sqrt(dx * dx + dy * dy));
            } else {
                setRulerStart({ x, y });
                setRulerEnd(null);
                setDistance(null);
            }
        } else {
            const hit = getMarkerAt(e.clientX - rect.left, e.clientY - rect.top);
            if (hit) {
                setSelectedId(hit.id);
                setDraggingId(hit.id);
            } else {
                setSelectedId(null);
            }
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!draggingId || !canvasRef.current || rulerMode) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const updated = evidence.map((ev) =>
            ev.id === draggingId ? { ...ev, pixel: { x: x / scale, y: y / scale } } : ev
        );
        onEvidenceUpdate(updated);
    };

    const handleMouseUp = () => {
        setDraggingId(null);
    };

    const toggleRulerMode = () => {
        setRulerMode(!rulerMode);
        setRulerStart(null);
        setRulerEnd(null);
        setDistance(null);
        setSelectedId(null);
    };

    const handleAddMarker = () => {
        const newEvidence: Evidence = {
            id: getNextMarkerId(),
            x: "0",
            y: "0",
            time: new Date().toLocaleTimeString(),
            pixel: { x: mapData.width / 2, y: mapData.height / 2 },
            label: "New Marker",
            category: "uncategorized",
            notes: "",
        };
        onEvidenceUpdate([...evidence, newEvidence]);
        setSelectedId(newEvidence.id);
    };

    const handleDelete = () => {
        if (selectedId) {
            onEvidenceUpdate(evidence.filter((ev) => ev.id !== selectedId));
            setSelectedId(null);
        }
    };

    const updateField = (field: keyof Evidence, value: string) => {
        if (!selectedId) return;
        const updated = evidence.map((ev) => (ev.id === selectedId ? { ...ev, [field]: value } : ev));
        onEvidenceUpdate(updated);
    };

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
        <div className="flex flex-col gap-6 p-4 xl:flex-row xl:p-0">
            <div className="flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/30 bg-secondary/20 px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                        <span className="text-xs uppercase tracking-wide text-muted-foreground">Zoom</span>
                        <input
                            type="range"
                            min="1"
                            max="4"
                            step="0.5"
                            value={scale}
                            onChange={(e) => setScale(Number(e.target.value))}
                            className="h-2 w-32 accent-primary"
                        />
                        <span className="font-semibold text-primary">{scale}x</span>
                    </div>
                    <button
                        onClick={toggleRulerMode}
                        type="button"
                        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition ${
                            rulerMode
                                ? "bg-emerald-500/90 text-emerald-950 shadow-[0_10px_25px_rgba(16,185,129,0.35)]"
                                : "border border-border/40 bg-secondary/40 text-foreground"
                        }`}
                    >
                        📏 Ruler {rulerMode ? "On" : ""}
                    </button>
                    <button
                        onClick={handleAddMarker}
                        type="button"
                        disabled={rulerMode}
                        className="inline-flex items-center rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-[0_12px_30px_rgba(14,165,233,0.35)] transition disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        + Add Marker
                    </button>
                    <button
                        onClick={handleExport}
                        type="button"
                        className="inline-flex items-center rounded-full bg-blue-500/90 px-4 py-2 text-xs font-semibold text-slate-950 shadow-[0_12px_30px_rgba(59,130,246,0.35)]"
                    >
                        Download Map
                    </button>
                    <span className="ml-auto text-xs text-muted-foreground">
                        Total markers: <span className="font-semibold text-primary">{evidence.length}</span>
                    </span>
                </div>

                {rulerMode && (
                    <div className="rounded-2xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                        <strong className="text-emerald-300">Ruler mode:</strong> Click to set start point, then end point.
                        {distance && (
                            <span className="ml-3 text-emerald-200">
                                Distance <strong>{distance.toFixed(2)}m</strong>
                            </span>
                        )}
                    </div>
                )}

                <div className="overflow-auto rounded-[28px] border border-border/40 bg-neutral-900/60 p-4">
                    <canvas
                        ref={canvasRef}
                        width={scaledWidth}
                        height={scaledHeight}
                        className="mx-auto block rounded-[24px] border-2 border-slate-800 bg-slate-900/80 shadow-inner"
                        style={{ cursor: rulerMode ? "crosshair" : draggingId ? "grabbing" : "pointer" }}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                    />
                </div>
            </div>

            <div className="w-full rounded-3xl border border-border/40 bg-[#05090f] p-5 text-sm shadow-[0_20px_60px_rgba(0,0,0,0.55)] xl:w-[320px]">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-foreground">Marker Editor</h3>
                    <span className="text-xs text-muted-foreground">Click a marker to edit</span>
                </div>
                <div className="mt-4 space-y-4">
                    {selectedEvidence ? (
                        <>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">ID: {selectedEvidence.id}</p>
                            <label className="space-y-1 text-muted-foreground">
                                <span>Label</span>
                                <input
                                    value={selectedEvidence.label}
                                    onChange={(e) => updateField("label", e.target.value)}
                                    className="w-full rounded-xl border border-border/40 bg-secondary/20 px-3 py-2 text-foreground focus:border-primary focus:outline-none"
                                />
                            </label>
                            <label className="space-y-1 text-muted-foreground">
                                <span>Category</span>
                                <input
                                    value={selectedEvidence.category}
                                    onChange={(e) => updateField("category", e.target.value)}
                                    className="w-full rounded-xl border border-border/40 bg-secondary/20 px-3 py-2 text-foreground focus:border-primary focus:outline-none"
                                />
                            </label>
                            <label className="space-y-1 text-muted-foreground">
                                <span>Notes</span>
                                <textarea
                                    value={selectedEvidence.notes}
                                    onChange={(e) => updateField("notes", e.target.value)}
                                    rows={4}
                                    className="w-full rounded-xl border border-border/40 bg-secondary/20 px-3 py-2 text-foreground focus:border-primary focus:outline-none"
                                />
                            </label>
                            <p className="text-xs text-muted-foreground">
                                x: {selectedEvidence.pixel.x.toFixed(1)}, y: {selectedEvidence.pixel.y.toFixed(1)}
                            </p>
                            <button
                                onClick={handleDelete}
                                type="button"
                                className="w-full rounded-2xl bg-red-500/90 px-4 py-2 text-sm font-semibold text-white shadow-[0_15px_30px_rgba(239,68,68,0.35)] transition hover:bg-red-500"
                            >
                                Delete Marker
                            </button>
                        </>
                    ) : (
                        <div className="rounded-2xl border border-dashed border-border/40 bg-secondary/10 px-3 py-6 text-center text-muted-foreground">
                            {rulerMode ? "Ruler mode active — exit to edit markers." : "Select or drag a marker to edit its details."}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
