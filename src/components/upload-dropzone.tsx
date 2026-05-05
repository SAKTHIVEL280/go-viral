"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, X, Film, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadDropzoneProps {
  onFileSelect: (file: File) => void;
  accept: string[];
  maxSizeBytes: number;
  uploading: boolean;
  progress: number;
  preview: string | null;
  selectedFile: File | null;
  onClear: () => void;
}

export function UploadDropzone({
  onFileSelect, accept, maxSizeBytes,
  uploading, progress, preview, selectedFile, onClear,
}: UploadDropzoneProps) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validate = useCallback((file: File) => {
    setError(null);
    if (!accept.includes(file.type)) {
      setError("Unsupported file type. Use MP4, MOV, WebM, JPG, PNG, GIF, or WebP.");
      return;
    }
    if (file.size > maxSizeBytes) {
      setError(`File too large. Max ${Math.round(maxSizeBytes / 1024 / 1024)}MB.`);
      return;
    }
    onFileSelect(file);
  }, [accept, maxSizeBytes, onFileSelect]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) validate(f);
  }, [validate]);

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) validate(f);
  }, [validate]);

  const isVideo = selectedFile?.type.startsWith("video/");
  const isImage = selectedFile?.type.startsWith("image/");

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload file — drag and drop or click to browse"
        data-testid="upload-dropzone"
        className={cn(
          "relative rounded-xl border transition-all duration-300 cursor-pointer min-h-[160px] flex flex-col items-center justify-center p-8",
          uploading && "pointer-events-none opacity-60"
        )}
        style={{
          background: dragging ? "rgba(222,219,200,0.04)" : "#101010",
          borderColor: dragging
            ? "rgba(222,219,200,0.3)"
            : selectedFile
              ? "rgba(222,219,200,0.15)"
              : "rgba(225,224,204,0.06)",
        }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click(); }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept.join(",")}
          onChange={onChange}
          className="hidden"
          data-testid="upload-file-input"
          aria-hidden
        />

        {selectedFile ? (
          <div className="flex flex-col items-center gap-3 text-center">
            {isImage && preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Preview" className="max-h-32 rounded-lg object-contain" data-testid="upload-preview" />
            ) : isVideo ? (
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "rgba(222,219,200,0.08)" }}>
                <Film className="w-5 h-5 text-primary/60" />
              </div>
            ) : null}
            <div>
              <p className="text-base font-medium truncate max-w-xs" style={{ color: "#E1E0CC" }}>{selectedFile.name}</p>
              <p className="text-gray-600 text-base mt-0.5">{(selectedFile.size / 1024 / 1024).toFixed(1)} MB</p>
            </div>
            {!uploading && (
              <div className="flex items-center gap-1.5 text-base" style={{ color: "rgba(222,219,200,0.6)" }}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                Ready to analyze
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300"
              style={{ background: dragging ? "rgba(222,219,200,0.1)" : "rgba(255,255,255,0.04)" }}
            >
              <Upload className="w-5 h-5" style={{ color: dragging ? "#DEDBC8" : "rgba(225,224,204,0.3)" }} />
            </div>
            <div>
              <p className="text-base" style={{ color: "rgba(225,224,204,0.7)" }}>
                {dragging ? "Drop it here" : "Drag & drop or click to browse"}
              </p>
              <p className="text-gray-700 text-base mt-1.5 font-light">
                Video: MP4, MOV, WebM (max 200MB) · Image: JPG, PNG, GIF, WebP (max 10MB)
              </p>
            </div>
          </div>
        )}

        {uploading && (
          <div className="absolute bottom-0 left-0 right-0 px-6 pb-4" data-testid="upload-progress-bar">
            <div className="h-px overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
              <div
                className="h-full transition-all duration-300"
                style={{ width: `${progress}%`, background: "#DEDBC8" }}
              />
            </div>
            <p className="text-gray-600 text-base text-center mt-2">Uploading {progress}%</p>
          </div>
        )}
      </div>

      {error && (
        <p className="text-red-400 text-base flex items-center gap-2 px-1" role="alert">
          <X className="w-3.5 h-3.5 flex-shrink-0" />
          {error}
        </p>
      )}

      {selectedFile && !uploading && (
        <button
          onClick={(e) => { e.stopPropagation(); onClear(); setError(null); }}
          className="text-gray-700 hover:text-red-400 text-base flex items-center gap-1 transition-colors duration-200"
        >
          <X className="w-3 h-3" />
          Remove file
        </button>
      )}
    </div>
  );
}
