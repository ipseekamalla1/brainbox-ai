"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Loader2,
  RefreshCw,
  Trash2,
  ChevronRight,
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

/* ================= MODAL (unchanged logic, theme-improved) ================= */
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
      if (!res.ok) throw new Error(data.error);

      onCreated(data.department);
      setForm({ name: "", slug: "", description: "" });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl overflow-hidden">

        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-sm">Create Department</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 p-2 rounded-lg">
              {error}
            </p>
          )}

          <input
            value={form.name}
            onChange={(e) => handleName(e.target.value)}
            placeholder="Department name"
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            required
          />

          <input
            value={form.slug}
            onChange={(e) =>
              setForm((f) => ({ ...f, slug: e.target.value }))
            }
            placeholder="slug"
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm"
            required
          />

          <textarea
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            placeholder="Description"
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm"
          />

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-border text-xs font-medium hover:bg-muted/30"
            >
              Cancel
            </button>

            <button
              disabled={loading}
              className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 flex items-center justify-center gap-2"
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

/* ================= PAGE ================= */
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

    if (res.ok) {
      setDepts((p) => p.filter((d) => d.id !== id));
    }
  };

  const handleSync = async (id: string) => {
    const res = await fetch(`/api/admin/departments/${id}/sync`, {
      method: "POST",
    });

    const data = await res.json();

    if (res.ok) {
      alert(
        `Synced: ${data.totalEnrolled} enrolled, ${data.totalReactivated} reactivated`
      );
    }
  };

  const filtered = depts.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Departments</h1>
          <p className="text-sm text-muted-foreground">
            Manage departments, courses, and students
          </p>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Department
        </button>
      </div>

      {/* SEARCH */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search departments..."
        className="w-full px-3 py-2.5 mb-5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
      />

      {/* LIST */}
      {loading ? (
        <p className="text-muted-foreground text-sm">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground text-sm">No departments found</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {filtered.map((dept) => (
            <div
              key={dept.id}
              className="border border-border bg-card rounded-2xl p-4 hover:shadow-sm transition"
            >
              <h2 className="font-semibold text-sm">{dept.name}</h2>
              <p className="text-xs text-muted-foreground">/{dept.slug}</p>

              <div className="mt-3 text-xs text-muted-foreground space-y-1">
                <p>Students: {dept._count?.students ?? 0}</p>
                <p>Courses: {dept._count?.courses ?? 0}</p>
              </div>

              {/* ACTIONS */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                <div className="flex gap-3 text-xs">
                  <button
                    onClick={() => handleSync(dept.id)}
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Sync
                  </button>

                  <button
                    onClick={() => handleDelete(dept.id)}
                    className="text-destructive hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>

                <Link
                  href={`/admin/departments/${dept.id}`}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  Open
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      <CreateModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={(d) => setDepts((p) => [d, ...p])}
      />
    </div>
  );
}