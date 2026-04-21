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

  const handleFile = async (file: File) => {
    if (!userId) return onError?.("User not authenticated");

    if (file.size > maxSizeMB * 1024 * 1024) {
      return onError?.(`File must be under ${maxSizeMB}MB`);
    }

    setUploading(true);
    setFileName(file.name);
    setProgress(0);

    try {
      const filePath = `${type}/${userId}/${Date.now()}-${file.name}`;

      const { error } = await supabase.storage
        .from("uploads") // ✅ BUCKET NAME
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      const { data } = supabase.storage
        .from("uploads")
        .getPublicUrl(filePath);

      setProgress(100);

      onUploadComplete(data.publicUrl, file.name, file.size);
    } catch (err) {
      console.error(err);
      onError?.("Upload failed");
    } finally {
      setUploading(false);
      setProgress(0);
      setFileName("");
    }
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      className="border p-6 rounded-xl text-center cursor-pointer"
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

      {uploading ? (
        <div>
          <p>Uploading {fileName}</p>
          <div className="w-full bg-gray-200 h-2 mt-2 rounded">
            <div
              className="bg-blue-500 h-2 rounded"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p>{progress}%</p>
        </div>
      ) : (
        <p>Click or drag file to upload</p>
      )}
    </div>
  );
}