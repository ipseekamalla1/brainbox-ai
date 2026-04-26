// ============================================================
// FILE LOCATION: app/api/admin/departments/[id]/students/route.ts
// ACTION: CREATE NEW
// PURPOSE: GET list all students belonging to a specific department
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";

  const students = await prisma.user.findMany({
    where: {
      departmentId: params.id,
      role: "STUDENT",
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      createdAt: true,
      _count: { select: { enrollments: { where: { status: "ACTIVE", role: "STUDENT" } } } },
    },
  });

  return NextResponse.json({ students });
}