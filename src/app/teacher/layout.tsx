// src/app/(dashboard)/teacher/layout.tsx — Teacher Layout

"use client";

import AuthProvider from "@/components/layout/AuthProvider";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardLayout requiredRole="TEACHER">
        {children}
      </DashboardLayout>
    </AuthProvider>
  );
}