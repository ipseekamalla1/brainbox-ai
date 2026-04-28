"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Building2,
  Users,
  BookOpen,
  ChevronRight,
  Search,
  Loader2,
  Trash2,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

interface Department {
  id: string;
  name: string;
  slug: string;
  description?: string;
  _count?: {
    students: number;
    courses: number;
  };
}

function CreateModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (d: Department) => void;
}) {
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleName = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    setForm((f) => ({ ...f, name, slug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Something went wrong");

      onCreated(data.department);
      setForm({ name: "", slug: "", description: "" });
      onClose();
    } catch (err: unknown) {
      // ✅ FIX: no "any"
      const message =
        err instanceof Error ? err.message : "Something went wrong";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
        <div className="px-6 py-4 border-b">
          <h2 className="font-semibold text-lg">Create Department</h2>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <input
              value={form.name}
              onChange={(e) => handleName(e.target.value)}
              className="w-full border px-3 py-2 rounded mt-1"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Slug</label>
            <input
              value={form.slug}
              onChange={(e) =>
                setForm((f) => ({ ...f, slug: e.target.value }))
              }
              className="w-full border px-3 py-2 rounded mt-1"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              className="w-full border px-3 py-2 rounded mt-1"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm bg-red-50 p-2 rounded">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border py-2 rounded"
            >
              Cancel
            </button>

            <button
              disabled={loading}
              type="submit"
              className="flex-1 bg-black text-white py-2 rounded flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function DepartmentsPage() {
  const [depts, setDepts] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    fetch("/api/departments")
      .then((r) => r.json())
      .then((d) => setDepts(d.departments ?? []))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this department?")) return;

    const res = await fetch(`/api/departments/${id}`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (!res.ok) return alert(data.error);

    setDepts((prev) => prev.filter((d) => d.id !== id));
  };

  const handleSync = async (id: string) => {
    const res = await fetch(`/api/admin/departments/${id}/sync`, {
      method: "POST",
    });

    const data = await res.json();

    if (res.ok) {
      alert(
        `Sync done. ${data.totalEnrolled} enrolled, ${data.totalReactivated} reactivated.`
      );
    }
  };

  const filtered = depts.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Departments</h1>
          <p className="text-gray-500 text-sm">
            Manage departments, courses, and students
          </p>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="bg-black text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Department
        </button>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search..."
        className="w-full border px-3 py-2 rounded mb-4"
      />

      {loading ? (
        <p>Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500">No departments found</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {filtered.map((dept) => (
            <div key={dept.id} className="border rounded p-4 shadow-sm">
              <h2 className="font-semibold">{dept.name}</h2>
              <p className="text-sm text-gray-500">/{dept.slug}</p>

              <div className="mt-2 text-sm">
                <p>Students: {dept._count?.students ?? 0}</p>
                <p>Courses: {dept._count?.courses ?? 0}</p>
              </div>

              <div className="flex gap-2 mt-3">
                <button onClick={() => handleSync(dept.id)} className="text-blue-600 text-sm">
                  Sync
                </button>

                <button onClick={() => handleDelete(dept.id)} className="text-red-600 text-sm">
                  Delete
                </button>

                <Link href={`/admin/departments/${dept.id}`} className="text-green-600 text-sm">
                  Open
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={(d) => setDepts((prev) => [d, ...prev])}
      />
    </div>
  );
}