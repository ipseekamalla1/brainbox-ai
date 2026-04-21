"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import FileUpload from "@/components/ui/FileUpload";
import { supabase } from "@/lib/supabase";

interface Note {
  id: string;
  title: string;
  subject: string;
  topic?: string;
  fileUrl: string;
  fileType: string;
  fileSize?: number;
  createdAt: string;
}

export default function TeacherNotesPage() {
  const { data: session, status } = useSession();

  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    subject: "",
    topic: "",
  });

  const [pendingFile, setPendingFile] = useState<{
    url: string;
    name: string;
    size: number;
  } | null>(null);

  // ✅ FETCH NOTES
  const fetchNotes = useCallback(async () => {
    if (!session?.user?.id) return;

    setLoading(true);

    const res = await fetch(
      `/api/notes?uploadedBy=${session.user.id}`
    );

    const data = await res.json();

    if (data.success) {
      setNotes(data.data || []);
    }

    setLoading(false);
  }, [session?.user?.id]);

  useEffect(() => {
    if (status === "authenticated") fetchNotes();
  }, [status, fetchNotes]);

  // ✅ SAVE NOTE
  const handleSaveNote = async () => {
    if (!pendingFile) return;

    setSaving(true);

    const fileType =
      pendingFile.name.split(".").pop()?.toLowerCase() || "pdf";

    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        subject: form.subject,
        topic: form.topic,
        fileUrl: pendingFile.url,
        fileType,
        fileSize: pendingFile.size,
      }),
    });

    const data = await res.json();

    if (data.success) {
      setNotes((prev) => [data.data, ...prev]);
      setShowUpload(false);
      setForm({ title: "", subject: "", topic: "" });
      setPendingFile(null);
    }

    setSaving(false);
  };

  // ✅ DOWNLOAD FUNCTION (IMPORTANT)
  const handleDownload = async (fileUrl: string) => {
    const path = fileUrl.split("/storage/v1/object/public/uploads/")[1];

    const { data, error } = await supabase.storage
      .from("uploads")
      .download(path);

    if (error) {
      console.error(error);
      return;
    }

    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = path.split("/").pop() || "file";
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Teacher Notes</h1>

        <button
          onClick={() => setShowUpload(!showUpload)}
          className="bg-black text-white px-4 py-2 rounded"
        >
          {showUpload ? "Cancel" : "Upload"}
        </button>
      </div>

      {/* UPLOAD */}
      {showUpload && (
        <div className="border p-4 rounded mb-6">
          <FileUpload
            type="notes"
            userId={session?.user?.id || ""}
            onUploadComplete={(url, name, size) => {
              setPendingFile({ url, name, size });
            }}
          />

          {pendingFile && (
            <div className="mt-4 space-y-2">
              <input
                placeholder="Title"
                className="border p-2 w-full"
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
              />

              <input
                placeholder="Subject"
                className="border p-2 w-full"
                onChange={(e) =>
                  setForm({ ...form, subject: e.target.value })
                }
              />

              <button
                onClick={handleSaveNote}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* NOTES LIST */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div key={note.id} className="border p-4 rounded">
              <h3 className="font-bold">{note.title}</h3>
              <p className="text-sm text-gray-500">
                {note.subject}
              </p>

              <div className="flex gap-4 mt-3">
                {/* DOWNLOAD */}
                <button
                  onClick={() => handleDownload(note.fileUrl)}
                  className="text-blue-600"
                >
                  ⬇ Download
                </button>

                {/* COPY */}
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(note.fileUrl)
                  }
                  className="text-green-600"
                >
                  Copy Link
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}