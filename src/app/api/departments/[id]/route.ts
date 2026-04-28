import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
});

// ======================================================
// GET SINGLE DEPARTMENT
// ======================================================
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // ✅ FIX: unwrap params (IMPORTANT for Next 15/16)
    const { id } = await context.params;

    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        courses: {
          include: {
            enrollments: {
              where: {
                role: "TEACHER",
                status: "ACTIVE",
              },
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
              take: 1,
            },
            _count: {
              select: {
                enrollments: {
                  where: {
                    role: "STUDENT",
                    status: "ACTIVE",
                  },
                },
                subjects: true,
              },
            },
          },
          orderBy: {
            title: "asc",
          },
        },
        _count: {
          select: {
            students: {
              where: {
                role: "STUDENT",
              },
            },
          },
        },
      },
    });

    if (!department) {
      return NextResponse.json(
        { error: "Department not found" },
        { status: 404 }
      );
    }

    const formatted = {
      ...department,
      courses: department.courses.map((course) => ({
        ...course,
        teacher: course.enrollments[0]?.user ?? null,
        studentCount: course._count.enrollments,
        subjectCount: course._count.subjects,
        enrollments: undefined,
        _count: undefined,
      })),
    };

    return NextResponse.json({ department: formatted });
  } catch (error) {
    console.error("GET department error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ======================================================
// PATCH UPDATE
// ======================================================
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed" },
        { status: 422 }
      );
    }

    const department = await prisma.department.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ department });
  } catch (error) {
    console.error("PATCH error:", error);

    return NextResponse.json(
      { error: "Update failed" },
      { status: 500 }
    );
  }
}

// ======================================================
// DELETE
// ======================================================
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    const studentCount = await prisma.user.count({
      where: { departmentId: id },
    });

    if (studentCount > 0) {
      return NextResponse.json(
        { error: `${studentCount} students still assigned.` },
        { status: 409 }
      );
    }

    const courseCount = await prisma.course.count({
      where: { departmentId: id },
    });

    if (courseCount > 0) {
      return NextResponse.json(
        { error: `${courseCount} courses still exist.` },
        { status: 409 }
      );
    }

    await prisma.department.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE error:", error);

    return NextResponse.json(
      { error: "Delete failed" },
      { status: 500 }
    );
  }
}