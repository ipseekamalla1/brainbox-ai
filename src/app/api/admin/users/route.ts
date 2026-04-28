// app/api/admin/users/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";

// 🔹 GET USERS
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { success: false, error: "Forbidden" },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);

  const role = searchParams.get("role") as Role | null;
  const search = searchParams.get("search") ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(
    100,
    parseInt(searchParams.get("pageSize") ?? "15")
  );

  const where = {
    ...(role ? { role } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            quizAttempts: true,
            examAttempts: true,
            notes: true,
            quizzesCreated: true,
            examsCreated: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      users,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
}

// 🔹 CREATE USER
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { success: false, error: "Forbidden" },
      { status: 403 }
    );
  }

  const body = await req.json();
  const { name, email, password, role } = body;

  if (!name || !email || !password) {
    return NextResponse.json({
      success: false,
      error: "Missing fields",
    });
  }

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    return NextResponse.json({
      success: false,
      error: "Email already exists",
    });
  }

const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
  data: {
    name,
    email,
    passwordHash, // ✅ correct
    role,
  },
});

  return NextResponse.json({ success: true });
}

// 🔹 UPDATE ROLE
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { success: false, error: "Forbidden" },
      { status: 403 }
    );
  }

  const { userId, role } = await req.json();

  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  return NextResponse.json({ success: true });
}

// 🔹 DELETE USER
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { success: false, error: "Forbidden" },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({
      success: false,
      error: "User ID required",
    });
  }

  await prisma.user.delete({
    where: { id: userId },
  });

  return NextResponse.json({ success: true });
}