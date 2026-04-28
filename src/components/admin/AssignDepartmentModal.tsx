// ============================================================
// FILE LOCATION: components/admin/AssignDepartmentModal.tsx
// ACTION: CREATE NEW
// PURPOSE: Reusable modal component to assign or change a student department
// ============================================================

"use client";

// components/admin/AssignDepartmentModal.tsx
// Reusable modal to assign or change a student's department.
// Shows enrollment impact before confirming.

import { useState, useEffect } from "react";
import { Loader2, ArrowRight, AlertCircle, CheckCircle2, X, Building2 } from "lucide-react";

interface Department { id: string; name: string; _count: { courses: number } }
interface Props {
  open: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  currentDeptId?: string | null;
  onAssigned: (deptId: string, deptName: string) => void;
}

export function AssignDepartmentModal({ open, onClose, userId, userName, currentDeptId, onAssigned }: Props) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selected, setSelected] = useState(currentDeptId ?? "");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [result, setResult] = useState<{ dropped: number; enrolled: number; reactivated: number } | null>(null);

  useEffect(() => {
    if (open) {
      setFetching(true);
      setSelected(currentDeptId ?? "");
      setResult(null);
      fetch("/api/departments")
        .then((r) => r.json())
        .then((d) => setDepartments(d.departments ?? []))
        .finally(() => setFetching(false));
    }
  }, [open, currentDeptId]);

  const selectedDept = departments.find((d) => d.id === selected);
  const isSame = selected === currentDeptId;

  const handleAssign = async () => {
    if (!selected || isSame) return;
    setLoading(true);
    const res = await fetch(`/api/admin/users/${userId}/department`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ departmentId: selected }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setResult({
        dropped: data.dropped ?? 0,
        enrolled: data.enrollment?.enrolled ?? 0,
        reactivated: data.enrollment?.reactivated ?? 0,
      });
      onAssigned(selected, selectedDept?.name ?? "");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-card border border-border rounded-lg shadow-xl animate-slide-up">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="font-serif text-base font-semibold text-foreground">Assign Department</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{userName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {result ? (
            /* Success state */
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              <p className="font-semibold text-foreground text-sm">{userName} moved to {selectedDept?.name}</p>
              <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                {result.dropped > 0 && <p>{result.dropped} old enrollment{result.dropped !== 1 ? "s" : ""} dropped</p>}
                {result.enrolled > 0 && <p className="text-primary">{result.enrolled} new course{result.enrolled !== 1 ? "s" : ""} enrolled</p>}
                {result.reactivated > 0 && <p>{result.reactivated} enrollment{result.reactivated !== 1 ? "s" : ""} reactivated</p>}
              </div>
              <button
                onClick={onClose}
                className="mt-4 w-full h-9 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {/* Current dept */}
              {currentDeptId && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Current:</span>
                  <span className="px-2 py-0.5 bg-secondary rounded font-medium text-foreground">
                    {departments.find((d) => d.id === currentDeptId)?.name ?? "Loading…"}
                  </span>
                  {selected && selected !== currentDeptId && (
                    <>
                      <ArrowRight className="w-3 h-3" />
                      <span className="px-2 py-0.5 bg-primary/15 border border-primary/25 rounded font-medium text-primary">
                        {selectedDept?.name}
                      </span>
                    </>
                  )}
                </div>
              )}

              {/* Select */}
              {fetching ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading departments…
                </div>
              ) : (
                <div className="space-y-1.5">
                  {departments.map((dept) => (
                    <button
                      key={dept.id}
                      onClick={() => setSelected(dept.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md border text-left transition-all ${
                        selected === dept.id
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border bg-card text-muted-foreground hover:border-border/60 hover:text-foreground hover:bg-secondary/50"
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${selected === dept.id ? "bg-primary/20" : "bg-secondary"}`}>
                        <Building2 className={`w-3 h-3 ${selected === dept.id ? "text-primary" : ""}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{dept.name}</p>
                        <p className="text-xs opacity-70">{dept._count.courses} courses</p>
                      </div>
                      {selected === dept.id && (
                        <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-2.5 h-2.5 text-primary-foreground" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Warning */}
              {selected && !isSame && currentDeptId && (
                <div className="flex items-start gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-md px-3 py-2">
                  <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span>
                    This will drop their enrollments from <strong>{departments.find((d) => d.id === currentDeptId)?.name}</strong> courses
                    and enroll them in all <strong>{selectedDept?.name}</strong> courses. Past grades are preserved.
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={onClose}
                  className="flex-1 h-9 rounded-md border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssign}
                  disabled={!selected || isSame || loading}
                  className="flex-1 h-9 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  {isSame ? "No change" : "Assign"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}