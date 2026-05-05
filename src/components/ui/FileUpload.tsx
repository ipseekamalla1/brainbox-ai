"use client";

import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";

interface FileUploadProps {
  type: "notes" | "videos" | "avatars";
  userId: string;
  accept?: string;
  maxSizeMB?: number;
  onUploadComplete: (
    fileUrl: string,
    fileName: string,
    fileSize: number
  ) => void;
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
  const [fileName, setFileName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const simulateProgress = () => {
    let value = 0;
    const interval = setInterval(() => {
      value += Math.random() * 20;
      if (value >= 95) {
        value = 95;
        clearInterval(interval);
      }
      setProgress(Math.floor(value));
    }, 200);

    return interval;
  };

  const handleFile = async (file: File) => {
    if (!userId) return onError?.("User not authenticated");

    if (file.size > maxSizeMB * 1024 * 1024) {
      return onError?.(`File must be under ${maxSizeMB}MB`);
    }

    setUploading(true);
    setFileName(file.name);
    setProgress(0);

    const progressInterval = simulateProgress();

    try {
      const cleanName = file.name.replace(/\s/g, "-");
      const filePath = `${type}/${userId}/${Date.now()}-${cleanName}`;

      const { error } = await supabase.storage
        .from("uploads")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      const { data } = supabase.storage
        .from("uploads")
        .getPublicUrl(filePath);

      clearInterval(progressInterval);
      setProgress(100);

      onUploadComplete(
        data.publicUrl,
        file.name,
        file.size
      );

      setTimeout(() => {
        setUploading(false);
        setProgress(0);
        setFileName("");
      }, 500);
    } catch (err: unknown) {
  clearInterval(progressInterval);
  console.error("Upload error:", err);

  setUploading(false);
  setProgress(0);
  setFileName("");

  const message =
    err instanceof Error
      ? err.message
      : "Upload failed";

  onError?.(message);
}
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      className="border border-border bg-card rounded-xl p-6 text-center cursor-pointer hover:border-primary/40 transition-all"
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {/* Uploading State */}
      {uploading ? (
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">
            Uploading: {fileName}
          </p>

          <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
            <div
              className="h-2 bg-primary transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="text-xs text-muted-foreground">
            {progress}%
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">
            Click to upload or drag & drop
          </p>
          <p className="text-xs text-muted-foreground">
            PDF, DOCX, PPT up to {maxSizeMB}MB
          </p>
        </div>
      )}
    </div>
  );
}