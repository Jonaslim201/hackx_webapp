import { useState, useRef } from "react";
import axios from "axios";
import { Upload, ArrowLeft } from "lucide-react";

interface UploadResponse {
  success: boolean;
  map: { width: number; height: number; contours: any[][] };
  evidence: any[];
  baseImage: string;
  edgesImage?: string;
  savedEdgesPath?: string;
}

interface FileUploadProps {
  onUploadComplete: (data: UploadResponse) => void;
}

export default function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mapFile, setMapFile] = useState<File | null>(null);
  const [metaFile, setMetaFile] = useState<File | null>(null);
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);

  const [mapLabel, setMapLabel] = useState("Choose file...");
  const [metaLabel, setMetaLabel] = useState("Choose file...");
  const [evidenceLabel, setEvidenceLabel] = useState("Choose file...");

  const mapInputRef = useRef<HTMLInputElement | null>(null);
  const metaInputRef = useRef<HTMLInputElement | null>(null);
  const evidenceInputRef = useRef<HTMLInputElement | null>(null);

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Check if all files are uploaded
    if (!mapFile || !metaFile || !evidenceFile) {
      setError("Please upload all required files (Map, Meta, and Evidence)");
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("map", mapFile);
    formData.append("meta", metaFile);
    formData.append("evidence", evidenceFile);

    try {
      const response = await axios.post<UploadResponse>(
        "http://localhost:4000/api/upload",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      onUploadComplete(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "map" | "meta" | "evidence"
  ) => {
    const file = e.target.files?.[0];
    const fileName = file?.name || "Choose file...";
    
    if (type === "map") {
      setMapFile(file || null);
      setMapLabel(fileName);
    }
    if (type === "meta") {
      setMetaFile(file || null);
      setMetaLabel(fileName);
    }
    if (type === "evidence") {
      setEvidenceFile(file || null);
      setEvidenceLabel(fileName);
    }
    
    // Clear error when user selects a file
    if (file) {
      setError(null);
    }
  };

  const allFilesUploaded = mapFile && metaFile && evidenceFile;

  return (
    <div className="min-h-screen w-full bg-[#0A0B1A] px-4 py-8 md:px-8 md:py-12">
      <div className="mx-auto max-w-4xl">
        {/* Top badge + Back button */}
        <div className="mb-8 flex items-center justify-between">
          <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-100 backdrop-blur">
            <span className="mr-2 h-2 w-2 rounded-full bg-pink-500" />
            Next-Gen Crime Scene Documentation
          </div>

          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Landing
          </button>
        </div>

        {/* Title + subtitle */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
            Evidence Map Editor
          </h1>
          <p className="mt-3 text-base text-slate-400">
            Upload LiDAR scans, refine evidence points, and export a clean 2D sketch.
          </p>
        </div>

        {/* Step indicator */}
        <div className="mb-6 flex items-start gap-3">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-bold text-white">
            1
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Upload case files</h2>
            <p className="mt-1 text-sm text-slate-400">
              Drop in your .pgm, .yaml, and evidence CSV to generate a working floor plan.
            </p>
          </div>
        </div>

        {/* Main upload card */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/50 to-slate-950/80 p-8 shadow-2xl backdrop-blur">
          {/* Card title */}
          <h3 className="mb-6 text-center text-sm font-semibold uppercase tracking-wider text-slate-300">
            Upload Map Files
          </h3>

          <form onSubmit={handleUpload} className="space-y-5">
            {/* Map (PGM) */}
            <div>
              <label className="mb-2 block text-base font-medium text-slate-300">
                Map (PGM):
              </label>
              <button
                type="button"
                onClick={() => mapInputRef.current?.click()}
                className="group flex w-full items-center justify-between rounded-lg border border-slate-700/50 bg-slate-900/50 px-4 py-3 text-left text-sm text-slate-400 transition-all hover:border-blue-500/50 hover:bg-slate-800/50"
              >
                <span className="group-hover:text-slate-200 text-base">{mapLabel}</span>
                <Upload className="h-5 w-5 text-blue-400" />
              </button>
              <input
                ref={mapInputRef}
                type="file"
                accept=".pgm"
                className="hidden"
                onChange={(e) => handleFileChange(e, "map")}
              />
            </div>

            {/* Meta (YAML) */}
            <div>
              <label className="mb-2 block text-base font-medium text-slate-300">
                Meta (YAML):
              </label>
              <button
                type="button"
                onClick={() => metaInputRef.current?.click()}
                className="group flex w-full items-center justify-between rounded-lg border border-slate-700/50 bg-slate-900/50 px-4 py-3 text-left text-sm text-slate-400 transition-all hover:border-blue-500/50 hover:bg-slate-800/50"
              >
                <span className="group-hover:text-slate-200 text-base">{metaLabel}</span>
                <Upload className="h-5 w-5 text-blue-400" />
              </button>
              <input
                ref={metaInputRef}
                type="file"
                accept=".yaml,.yml"
                className="hidden"
                onChange={(e) => handleFileChange(e, "meta")}
              />
            </div>

            {/* Evidence (CSV) */}
            <div>
              <label className="mb-2 block text-base font-medium text-slate-300">
                Evidence (CSV):
              </label>
              <button
                type="button"
                onClick={() => evidenceInputRef.current?.click()}
                className="group flex w-full items-center justify-between rounded-lg border border-slate-700/50 bg-slate-900/50 px-4 py-3 text-left text-sm text-slate-400 transition-all hover:border-blue-500/50 hover:bg-slate-800/50"
              >
                <span className="group-hover:text-slate-200 text-base">{evidenceLabel}</span>
                <Upload className="h-5 w-5 text-blue-400" />
              </button>
              <input
                ref={evidenceInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => handleFileChange(e, "evidence")}
              />
            </div>

            {/* Upload button */}
            <button
              type="submit"
              disabled={uploading || !allFilesUploaded}
              className="mt-6 w-full rounded-lg bg-gradient-to-r from-cyan-400 via-blue-500 to-pink-500 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-500/50 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {uploading ? "Processing..." : "Upload & Process"}
            </button>
          </form>

          {/* Status messages */}
          {uploading && (
            <p className="mt-4 text-center text-sm text-slate-400">
              Processing map with advanced LiDAR algorithm...
            </p>
          )}
          {error && (
            <p className="mt-4 text-center text-sm font-medium text-red-400">
              ⚠️ {error}
            </p>
          )}
        </div>

        {/* Bottom stepper */}
        <div className="mt-8 flex items-center gap-3 text-sm text-slate-500">
          <span className="rounded-full border border-white/10 bg-slate-800/50 px-4 py-2 text-slate-300">
            1 Upload case files
          </span>
          <span className="h-px w-8 bg-slate-700" />
          <span className="px-4 py-2">2. Review & Edit Evidence Points</span>
          <span className="h-px w-8 bg-slate-700" />
          <span className="px-4 py-2">3. Export Final Documentation</span>
        </div>
      </div>
    </div>
  );
}