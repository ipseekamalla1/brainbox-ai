// src/app/(dashboard)/student/layout.tsx — Student Layout

"use client";

import AuthProvider from "@/components/layout/AuthProvider";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardLayout requiredRole="STUDENT">
        {children}
      </DashboardLayout>
    </AuthProvider>
  );
}