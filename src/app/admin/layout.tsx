// src/app/(dashboard)/admin/layout.tsx — Admin Layout

"use client";

import AuthProvider from "@/components/layout/AuthProvider";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardLayout requiredRole="ADMIN">
        {children}
      </DashboardLayout>
    </AuthProvider>
  );
}