import { useRef, useEffect, useState } from "react";
import { ArrowLeft, Plus, RotateCcw, Download, Trash2, RefreshCw, ZoomIn, ZoomOut, Lock, Unlock, Image as ImageIcon } from "lucide-react";
import type { Evidence, MapData } from "../types/types";

interface MapEditorProps {
    baseImage: string;
    edgesImage?: string;
    mapData: MapData;
    evidence: Evidence[];
    onEvidenceUpdate: (evidence: Evidence[]) => void;
    onReset: () => void;
}

type TabType = "details" | "notes" | "images";

export default function MapEditor({
    baseImage,
    edgesImage,
    mapData,
    evidence,
    onEvidenceUpdate,
    onReset,
}: MapEditorProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [scale, setScale] = useState(3); // Default 300% zoom
    const [imageLoaded, setImageLoaded] = useState<HTMLImageElement | null>(null);
    const [initialized, setInitialized] = useState(false);
    const [showEdges, setShowEdges] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>("details");
    const [originalEvidence, setOriginalEvidence] = useState<Evidence[]>([]);

    const scaledWidth = mapData.width * scale;
    const scaledHeight = mapData.height * scale;
    const selectedEvidence = evidence.find((e) => e.id === selectedId);

    // Use edges image if available and showEdges is true
    const displayImage = showEdges && edgesImage ? edgesImage : baseImage;

    // Initialize original positions for existing markers and store original state
    useEffect(() => {
        if (!initialized && evidence.length > 0) {
            const needsInitialization = evidence.some(e => !e.originalPosition);
            
            if (needsInitialization) {
                const updated = evidence.map(e => ({
                    ...e,
                    originalPosition: e.originalPosition || { ...e.pixel },
                    images: e.images || [],
                    locked: e.locked || false,
                }));
                onEvidenceUpdate(updated);
                setOriginalEvidence(JSON.parse(JSON.stringify(updated))); // Deep clone
            } else {
                setOriginalEvidence(JSON.parse(JSON.stringify(evidence))); // Deep clone
            }
            
            setInitialized(true);
        }
    }, [evidence, initialized, onEvidenceUpdate]);

    // Load image
    useEffect(() => {
        const img = new Image();
        img.src = displayImage;
        img.onload = () => setImageLoaded(img);
    }, [displayImage]);

    // Draw everything
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !imageLoaded) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, scaledWidth, scaledHeight);
        ctx.drawImage(imageLoaded, 0, 0, scaledWidth, scaledHeight);

        // Draw contours (only if showEdges is true)
        if (showEdges) {
            ctx.strokeStyle = "rgba(59, 130, 246, 0.6)";
            ctx.lineWidth = 1.5;
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
        }

        // Draw markers
        for (const e of evidence) {
            const x = e.pixel.x * scale;
            const y = e.pixel.y * scale;
            
            // Draw marker circle
            ctx.beginPath();
            ctx.arc(x, y, 10, 0, 2 * Math.PI);
            ctx.fillStyle = selectedId === e.id ? "#22d3ee" : "#ec4899";
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 3;
            ctx.fill();
            ctx.stroke();

            // Draw lock icon if marker is locked
            if (e.locked) {
                ctx.fillStyle = "#fbbf24";
                ctx.font = "bold 12px sans-serif";
                ctx.textAlign = "center";
                ctx.fillText("🔒", x, y - 15);
            }

            // Draw label below marker
            ctx.fillStyle = "#fff";
            ctx.font = "bold 12px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(e.label || "Marker", x, y + 25);
        }
    }, [evidence, imageLoaded, selectedId, scale, mapData, showEdges]);

    // Handle click and drag
    const getMarkerAt = (x: number, y: number) => {
        const r = 10;
        return evidence.find(
            (e) => {
                const dx = x - e.pixel.x;
                const dy = y - e.pixel.y;
                return Math.hypot(dx, dy) <= r;
            }
        );
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / scale;
        const y = (e.clientY - rect.top) / scale;
        const hit = getMarkerAt(x, y);

        if (hit) {
            setSelectedId(hit.id);
            // Only allow dragging if not locked
            if (!hit.locked) {
                setDraggingId(hit.id);
            }
        } else {
            setSelectedId(null);
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!draggingId || !canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / scale;
        const y = (e.clientY - rect.top) / scale;

        const updated = evidence.map((ev) =>
            ev.id === draggingId
                ? { ...ev, pixel: { x, y } }
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
            category: "Physical",
            notes: "",
            images: [],
            locked: false,
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

    // Toggle lock on marker
    const toggleLock = () => {
        if (!selectedId) return;
        const updated = evidence.map((e) =>
            e.id === selectedId ? { ...e, locked: !e.locked } : e
        );
        onEvidenceUpdate(updated);
    };

    // Reset markers to original state
    const handleResetMarkers = () => {
        if (originalEvidence.length > 0) {
            // Reset to original evidence state (deep clone)
            onEvidenceUpdate(JSON.parse(JSON.stringify(originalEvidence)));
            setSelectedId(null);
        }
    };

    // Reset position to original for selected marker
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

    // Update position fields
    const updatePosition = (axis: 'x' | 'y', value: string) => {
        if (!selectedId) return;
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return;
        
        const updated = evidence.map((e) =>
            e.id === selectedId
                ? { 
                    ...e, 
                    pixel: { 
                        ...e.pixel, 
                        [axis]: numValue 
                    } 
                }
                : e
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

    // Zoom controls
    const handleZoomIn = () => setScale(Math.min(scale + 0.5, 4));
    const handleZoomOut = () => setScale(Math.max(scale - 0.5, 0.5));

    return (
        <div className="min-h-screen w-full bg-[#0A0B1A] px-4 py-6 md:px-8">
            <div className="mx-auto max-w-[1800px]">
                {/* Top Navigation Bar */}
                <div className="mb-6 flex items-center justify-between">
                    <button
                        onClick={onReset}
                        className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Upload
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-100 backdrop-blur">
                            <span className="mr-2 h-2 w-2 rounded-full bg-pink-500" />
                            Next-Gen Crime Scene Documentation
                        </div>

                        <div className="inline-flex items-center rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-300">
                            {evidence.length} Evidence Markers
                        </div>
                    </div>
                </div>

                {/* Header Section */}
                <div className="mb-6 flex items-start gap-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-bold text-white">
                        2
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                            Review & Edit Evidence Points
                        </h1>
                        <p className="mt-2 text-sm text-slate-400">
                            Click markers to edit details, drag to reposition, or add new evidence points to your crime scene map.
                        </p>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="mb-6 flex flex-wrap items-center gap-3">
                    <button
                        onClick={handleAddMarker}
                        className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 transition-transform hover:scale-105"
                    >
                        <Plus className="h-4 w-4" />
                        Add Marker
                    </button>

                    <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-900/50 px-3 py-2">
                        <button
                            onClick={handleZoomOut}
                            className="text-slate-400 hover:text-white transition-colors disabled:opacity-30"
                            disabled={scale <= 0.5}
                        >
                            <ZoomOut className="h-4 w-4" />
                        </button>
                        <span className="min-w-[60px] text-center text-sm text-slate-300">
                            {Math.round(scale * 100)}%
                        </span>
                        <button
                            onClick={handleZoomIn}
                            className="text-slate-400 hover:text-white transition-colors disabled:opacity-30"
                            disabled={scale >= 4}
                        >
                            <ZoomIn className="h-4 w-4" />
                        </button>
                    </div>

                    <button
                        onClick={handleResetMarkers}
                        className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-slate-900/50 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800/50 hover:text-white transition-colors"
                    >
                        <RotateCcw className="h-4 w-4" />
                        Reset
                    </button>

                    {edgesImage && (
                        <label className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-slate-900/50 px-4 py-2 text-sm font-medium text-slate-300 cursor-pointer hover:bg-slate-800/50 hover:text-white transition-colors">
                            <input
                                type="checkbox"
                                checked={showEdges}
                                onChange={(e) => setShowEdges(e.target.checked)}
                                className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-2 focus:ring-blue-500"
                            />
                            Show Edges
                        </label>
                    )}

                    <button
                        onClick={handleExport}
                        className="ml-auto inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition-transform hover:scale-105"
                    >
                        <Download className="h-4 w-4" />
                        Export Map
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Canvas Panel */}
                    <div className="lg:col-span-2">
                        <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-4 shadow-2xl">
                            <div ref={containerRef} className="overflow-auto max-h-[700px]">
                                <canvas
                                    ref={canvasRef}
                                    width={scaledWidth}
                                    height={scaledHeight}
                                    className="rounded-lg border border-slate-800"
                                    style={{
                                        backgroundColor: "#1a1a2e",
                                        cursor: draggingId ? "grabbing" : "crosshair",
                                        maxWidth: "100%",
                                    }}
                                    onMouseDown={handleMouseDown}
                                    onMouseMove={handleMouseMove}
                                    onMouseUp={handleMouseUp}
                                    onMouseLeave={handleMouseUp}
                                />
                            </div>
                            <div className="mt-4 text-xs text-slate-500 flex items-center gap-2">
                                <span className="inline-flex items-center gap-1">
                                    <span className="text-cyan-400">+</span> Click to select
                                </span>
                                <span>•</span>
                                <span className="inline-flex items-center gap-1">
                                    Drag to move markers
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Details Panel */}
                    <div className="lg:col-span-1">
                        <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-6 shadow-2xl">
                            {selectedEvidence ? (
                                <>
                                    {/* Header */}
                                    <div className="mb-6 flex items-start justify-between">
                                        <div>
                                            <h2 className="text-xl font-bold text-white">
                                                Edit Evidence Marker
                                            </h2>
                                            <p className="mt-1 text-xs text-slate-500">
                                                ID: {selectedEvidence.id}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={toggleLock}
                                                className={`rounded-lg p-2 transition-colors ${
                                                    selectedEvidence.locked
                                                        ? "text-yellow-400 hover:bg-yellow-500/10"
                                                        : "text-slate-400 hover:bg-slate-500/10"
                                                }`}
                                                title={selectedEvidence.locked ? "Unlock Marker" : "Lock Marker"}
                                            >
                                                {selectedEvidence.locked ? (
                                                    <Lock className="h-5 w-5" />
                                                ) : (
                                                    <Unlock className="h-5 w-5" />
                                                )}
                                            </button>
                                            <button
                                                onClick={handleResetPosition}
                                                disabled={!selectedEvidence.originalPosition}
                                                className="rounded-lg p-2 text-cyan-400 hover:bg-cyan-500/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                title="Reset Position"
                                            >
                                                <RefreshCw className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={handleDelete}
                                                className="rounded-lg p-2 text-red-400 hover:bg-red-500/10 transition-colors"
                                                title="Delete Marker"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Tabs */}
                                    <div className="mb-6 flex gap-2">
                                        <button
                                            onClick={() => setActiveTab("details")}
                                            className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                                                activeTab === "details"
                                                    ? "border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-300"
                                                    : "border border-transparent text-slate-400 hover:text-slate-300"
                                            }`}
                                        >
                                            Details
                                        </button>
                                        <button
                                            onClick={() => setActiveTab("notes")}
                                            className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                                                activeTab === "notes"
                                                    ? "border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-300"
                                                    : "border border-transparent text-slate-400 hover:text-slate-300"
                                            }`}
                                        >
                                            Notes
                                        </button>
                                        <button
                                            onClick={() => setActiveTab("images")}
                                            className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                                                activeTab === "images"
                                                    ? "border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-300"
                                                    : "border border-transparent text-slate-400 hover:text-slate-300"
                                            }`}
                                        >
                                            Images ({selectedEvidence.images?.length || 0})
                                        </button>
                                    </div>

                                    {/* Tab Content */}
                                    <div className="space-y-4">
                                        {/* Details Tab */}
                                        {activeTab === "details" && (
                                            <>
                                                {/* Label */}
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-slate-300">
                                                        Label
                                                    </label>
                                                    <input
                                                        key={`label-${selectedEvidence.id}`}
                                                        type="text"
                                                        value={selectedEvidence.label}
                                                        onChange={(e) => updateField("label", e.target.value)}
                                                        className="w-full rounded-lg border border-slate-700/50 bg-slate-900/50 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                                                    />
                                                </div>

                                                {/* Type */}
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-slate-300">
                                                        Type
                                                    </label>
                                                    <input
                                                        key={`type-${selectedEvidence.id}`}
                                                        type="text"
                                                        value={selectedEvidence.category}
                                                        onChange={(e) => updateField("category", e.target.value)}
                                                        className="w-full rounded-lg border border-slate-700/50 bg-slate-900/50 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                                                    />
                                                </div>

                                                {/* Position */}
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="mb-2 block text-sm font-medium text-slate-300">
                                                            X Position
                                                        </label>
                                                        <input
                                                            key={`x-${selectedEvidence.id}`}
                                                            type="number"
                                                            value={Math.round(selectedEvidence.pixel.x)}
                                                            onChange={(e) => updatePosition('x', e.target.value)}
                                                            disabled={selectedEvidence.locked}
                                                            className="w-full rounded-lg border border-slate-700/50 bg-slate-900/50 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="mb-2 block text-sm font-medium text-slate-300">
                                                            Y Position
                                                        </label>
                                                        <input
                                                            key={`y-${selectedEvidence.id}`}
                                                            type="number"
                                                            value={Math.round(selectedEvidence.pixel.y)}
                                                            onChange={(e) => updatePosition('y', e.target.value)}
                                                            disabled={selectedEvidence.locked}
                                                            className="w-full rounded-lg border border-slate-700/50 bg-slate-900/50 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Description */}
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-slate-300">
                                                        Description
                                                    </label>
                                                    <textarea
                                                        key={`desc-${selectedEvidence.id}`}
                                                        value={selectedEvidence.notes}
                                                        onChange={(e) => updateField("notes", e.target.value)}
                                                        rows={6}
                                                        placeholder="Add detailed description about this evidence..."
                                                        className="w-full rounded-lg border border-slate-700/50 bg-slate-900/50 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 resize-none"
                                                    />
                                                </div>

                                                {/* Status Badge */}
                                                <div>
                                                    <span className="inline-flex items-center rounded-full bg-purple-500/20 border border-purple-500/30 px-3 py-1 text-xs font-medium text-purple-300">
                                                        Status: Active
                                                    </span>
                                                </div>
                                            </>
                                        )}

                                        {/* Notes Tab */}
                                        {activeTab === "notes" && (
                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-slate-300">
                                                    Investigation Notes
                                                </label>
                                                <textarea
                                                    key={`notes-${selectedEvidence.id}`}
                                                    value={selectedEvidence.notes}
                                                    onChange={(e) => updateField("notes", e.target.value)}
                                                    rows={16}
                                                    placeholder="Add investigation notes, observations, chain of custody information, or any other relevant details..."
                                                    className="w-full rounded-lg border border-slate-700/50 bg-slate-900/50 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 resize-none"
                                                />
                                                <p className="mt-2 text-xs text-slate-500">
                                                    Notes are separate from the description and can be used for internal documentation
                                                </p>
                                            </div>
                                        )}

                                        {/* Images Tab */}
                                        {activeTab === "images" && (
                                            <div>
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    onChange={handleImageUpload}
                                                    className="hidden"
                                                />
                                                <button
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="w-full rounded-lg border-2 border-dashed border-slate-600 bg-slate-900/30 px-4 py-12 text-center hover:border-cyan-500/50 hover:bg-slate-800/30 transition-colors"
                                                >
                                                    <div className="flex flex-col items-center gap-3">
                                                        <div className="rounded-full bg-cyan-500/10 p-3">
                                                            <ImageIcon className="h-6 w-6 text-cyan-400" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-slate-300">
                                                                Upload Images
                                                            </p>
                                                            <p className="mt-1 text-xs text-slate-500">
                                                                Click to select or drag and drop
                                                            </p>
                                                        </div>
                                                    </div>
                                                </button>

                                                {/* Display uploaded images */}
                                                {selectedEvidence.images && selectedEvidence.images.length > 0 && (
                                                    <div className="mt-4 grid grid-cols-2 gap-3">
                                                        {selectedEvidence.images.map((img, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="relative group"
                                                            >
                                                                <img
                                                                    src={img}
                                                                    alt={`Evidence ${idx + 1}`}
                                                                    className="w-full h-32 object-cover rounded-lg border border-slate-700"
                                                                />
                                                                <button
                                                                    onClick={() => handleDeleteImage(idx)}
                                                                    className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-sm font-bold shadow-lg"
                                                                >
                                                                    ×
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/10">
                                        <svg
                                            className="h-8 w-8 text-purple-400"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-white mb-2">
                                        No Marker Selected
                                    </h3>
                                    <p className="text-sm text-slate-400 max-w-xs">
                                        Click on any evidence marker on the map to view and edit its details
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}