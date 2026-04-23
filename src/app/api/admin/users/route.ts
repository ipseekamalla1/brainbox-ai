// src/app/api/admin/users/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getAllUsers,
  updateUserRole,
  deleteUser,
  createUserByAdmin,
} from "@/services/admin.service";
import { Role, Prisma } from "@prisma/client";

// ─── Helper: Validate Role ──────────────────────────

function parseRole(role: unknown): Role | undefined {
  if (typeof role !== "string") return undefined;

  if (Object.values(Role).includes(role as Role)) {
    return role as Role;
  }

  return undefined;
}

// ─── Auth Guard ─────────────────────────────────────

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return null;
  return session;
}

// ─── GET Users ──────────────────────────────────────

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Admin only" },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);

    const data = await getAllUsers({
      role: parseRole(searchParams.get("role")),
      search: searchParams.get("search") || undefined,
      page: parseInt(searchParams.get("page") || "1"),
      pageSize: parseInt(searchParams.get("pageSize") || "20"),
    });

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// ─── CREATE User ────────────────────────────────────

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Admin only" },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { name, email, password, role } = body;

    const parsedRole = parseRole(role);

    if (!name || !email || !password || !parsedRole) {
      return NextResponse.json(
        { success: false, error: "All fields (valid role) required" },
        { status: 400 }
      );
    }

    const user = await createUserByAdmin({
      name,
      email,
      password,
      role: parsedRole,
    });

    return NextResponse.json(
      { success: true, data: user },
      { status: 201 }
    );
  } catch (error: unknown) {
    let msg = "Failed to create user";

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        msg = "Email already exists";
      }
    }

    return NextResponse.json(
      { success: false, error: msg },
      { status: 400 }
    );
  }
}

// ─── UPDATE Role ────────────────────────────────────

export async function PATCH(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Admin only" },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { userId, role } = body;

    const parsedRole = parseRole(role);

    if (!userId || !parsedRole) {
      return NextResponse.json(
        { success: false, error: "userId and valid role required" },
        { status: 400 }
      );
    }

    const user = await updateUserRole(userId, parsedRole);

    return NextResponse.json({ success: true, data: user });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to update role" },
      { status: 500 }
    );
  }
}

// ─── DELETE User ────────────────────────────────────

export async function DELETE(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Admin only" },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId required" },
        { status: 400 }
      );
    }

    if (userId === session.user.id) {
      return NextResponse.json(
        { success: false, error: "Cannot delete yourself" },
        { status: 400 }
      );
    }

    await deleteUser(userId);

    return NextResponse.json({
      success: true,
      message: "User deleted",
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to delete user" },
      { status: 500 }
    );
  }
}