// src/app/(dashboard)/admin/users/page.tsx — Admin User Management

"use client";

import { useState, useEffect, useCallback } from "react";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "TEACHER" | "ADMIN";
  createdAt: string;
  _count: {
    quizAttempts: number;
    examAttempts: number;
    notes: number;
    quizzesCreated: number;
    examsCreated: number;
  };
}

const roleColors: Record<string, string> = {
  STUDENT: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  TEACHER: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  ADMIN: "bg-red-500/10 text-red-500 border-red-500/20",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  // ✅ MODAL STATE (REPLACED INLINE FORM ONLY)
  const [showCreate, setShowCreate] = useState(false);

  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "STUDENT",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: "15",
      });

      if (search) params.set("search", search);
      if (roleFilter) params.set("role", roleFilter);

      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();

      if (data.success) {
        setUsers(data.data.users);
        setTotal(data.data.total);
        setTotalPages(data.data.totalPages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
  try {
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role: newRole }),
    });

    if (res.ok) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, role: newRole as UserItem["role"] } // ✅ FIXED
            : u
        )
      );
    }
  } catch (err) {
    console.error(err);
  }
};

  const handleDelete = async (userId: string, name: string) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`))
      return;

    try {
      const res = await fetch(
        `/api/admin/users?userId=${userId}`,
        { method: "DELETE" }
      );

      if (res.ok)
        setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ CREATE USER (UNCHANGED LOGIC)
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });

      const data = await res.json();

      if (data.success) {
        setShowCreate(false);
        setCreateForm({
          name: "",
          email: "",
          password: "",
          role: "STUDENT",
        });
        fetchUsers();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Failed to create user");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl font-bold">
            User Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {total} total users
          </p>
        </div>

        {/* ✅ ONLY CHANGE: OPEN MODAL */}
        <button
          onClick={() => setShowCreate(true)}
          className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
        >
          + Create User
        </button>
      </div>

      {/* SEARCH + FILTER (UNCHANGED) */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={handleSearch} className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </form>

        <div className="flex gap-2">
          {["", "STUDENT", "TEACHER", "ADMIN"].map((r) => (
            <button
              key={r}
              onClick={() => {
                setRoleFilter(r);
                setPage(1);
              }}
              className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                roleFilter === r
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground"
              }`}
            >
              {r || "All"}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE (UNCHANGED) */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-16 rounded-xl bg-muted animate-shimmer"
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="hidden sm:grid grid-cols-12 gap-4 px-4 py-3 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <div className="col-span-4">User</div>
            <div className="col-span-2">Role</div>
            <div className="col-span-2">Activity</div>
            <div className="col-span-2">Joined</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {users.map((user) => (
            <div
              key={user.id}
              className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-4 py-3 border-b border-border last:border-0 items-center hover:bg-muted/20 transition-colors"
            >
              <div className="col-span-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="col-span-2">
                <select
                  value={user.role}
                  onChange={(e) =>
                    handleRoleChange(user.id, e.target.value)
                  }
                  className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md border cursor-pointer ${roleColors[user.role]}`}
                >
                  <option value="STUDENT">Student</option>
                  <option value="TEACHER">Teacher</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div className="col-span-2 text-xs text-muted-foreground">
                {user.role === "STUDENT"
                  ? `${user._count.quizAttempts}Q · ${user._count.examAttempts}E`
                  : `${user._count.quizzesCreated}Q · ${user._count.examsCreated}E · ${user._count.notes}N`}
              </div>

              <div className="col-span-2 text-xs text-muted-foreground">
                {new Date(user.createdAt).toLocaleDateString()}
              </div>

              <div className="col-span-2 text-right">
                <button
                  onClick={() => handleDelete(user.id, user.name)}
                  className="text-xs text-destructive hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PAGINATION (UNCHANGED) */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-muted-foreground">
            Page {page} of {totalPages} · {total} users
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium disabled:opacity-30"
            >
              ← Prev
            </button>

            <button
              onClick={() =>
                setPage(Math.min(totalPages, page + 1))
              }
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium disabled:opacity-30"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL ================= */}
      {/* ================= MODAL ================= */}
{showCreate && (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
    {/* overlay click close */}
    <div
      className="absolute inset-0"
      onClick={() => setShowCreate(false)}
    />

    <div className="relative w-full max-w-md rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h2 className="font-semibold text-sm">Create New User</h2>

        <button
          onClick={() => setShowCreate(false)}
          className="text-muted-foreground hover:text-foreground text-lg leading-none"
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <form onSubmit={handleCreate} className="p-5 space-y-4">
        {error && (
          <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 p-2 rounded-lg">
            {error}
          </p>
        )}

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Full Name
            </label>
            <input
              type="text"
              required
              placeholder="Enter full name"
              value={createForm.name}
              onChange={(e) =>
                setCreateForm({ ...createForm, name: e.target.value })
              }
              className="w-full mt-1 px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="Enter email"
              value={createForm.email}
              onChange={(e) =>
                setCreateForm({ ...createForm, email: e.target.value })
              }
              className="w-full mt-1 px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              placeholder="Minimum 8 characters"
              value={createForm.password}
              onChange={(e) =>
                setCreateForm({ ...createForm, password: e.target.value })
              }
              className="w-full mt-1 px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Role
            </label>
            <select
              value={createForm.role}
              onChange={(e) =>
                setCreateForm({ ...createForm, role: e.target.value })
              }
              className="w-full mt-1 px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="STUDENT">Student</option>
              <option value="TEACHER">Teacher</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <button
            type="button"
            onClick={() => setShowCreate(false)}
            className="px-4 py-2 rounded-lg border border-border text-xs font-medium hover:bg-muted/30"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create User"}
          </button>
        </div>
      </form>
    </div>
  </div>
)}
    </div>
  );
}