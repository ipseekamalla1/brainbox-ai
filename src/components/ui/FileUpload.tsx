// src/components/ui/FileUpload.tsx — Firebase File Upload with Progress

"use client";

import { useState, useRef } from "react";
import { uploadFile, getStoragePath } from "@/lib/firebase";

interface FileUploadProps {
  type: "notes" | "videos" | "avatars";
  userId: string;
  accept?: string;
  maxSizeMB?: number;
  onUploadComplete: (fileUrl: string, fileName: string, fileSize: number) => void;
  onError?: (error: string) => void;
}

export default function FileUpload({
  type,
  userId,
  accept = ".pdf,.docx,.pptx,.doc,.ppt",
  maxSizeMB = 50,
  onUploadComplete,
  onError,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    // Validate size
    if (file.size > maxSizeMB * 1024 * 1024) {
      onError?.(`File must be under ${maxSizeMB}MB`);
      return;
    }

    setUploading(true);
    setFileName(file.name);
    setProgress(0);

    try {
      const path = getStoragePath(type, userId, file.name);
      const downloadURL = await uploadFile(file, path, (p) => setProgress(Math.round(p)));
      onUploadComplete(downloadURL, file.name, file.size);
    } catch (err) {
      console.error("Upload error:", err);
      onError?.("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      setProgress(0);
      setFileName("");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => !uploading && inputRef.current?.click()}
      className={`relative rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-200 ${
        dragOver
          ? "border-primary bg-primary/5"
          : uploading
          ? "border-border bg-muted/30 cursor-default"
          : "border-border hover:border-primary/40 hover:bg-muted/20"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
        disabled={uploading}
      />

      {uploading ? (
        <div className="space-y-3">
          <div className="w-10 h-10 mx-auto rounded-xl bg-primary/10 flex items-center justify-center">
            <svg className="animate-spin w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <p className="text-sm font-medium">Uploading {fileName}...</p>
          <div className="max-w-xs mx-auto">
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">{progress}%</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="w-10 h-10 mx-auto rounded-xl bg-primary/10 flex items-center justify-center text-xl">
            📤
          </div>
          <p className="text-sm font-medium">
            Drop a file here or <span className="text-primary">browse</span>
          </p>
          <p className="text-xs text-muted-foreground">
            {accept.replace(/\./g, "").toUpperCase().replace(/,/g, ", ")} · Max {maxSizeMB}MB
          </p>
        </div>
      )}
    </div>
  );
}