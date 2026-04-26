// ============================================================
// FILE LOCATION: app/api/admin/departments/[id]/sync/route.ts
// ACTION: CREATE NEW
// PURPOSE: POST re-sync all enrollments for every student in a department
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { syncDepartmentEnrollments } from "@/services/enrollement.service";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const result = await syncDepartmentEnrollments(params.id);
  return NextResponse.json({ message: "Sync complete", ...result });
}