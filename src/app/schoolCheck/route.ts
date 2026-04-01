import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import schoolData from "@/app/schoolData.json";
import { auth } from "@/server/auth";
import { headers } from "next/headers";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { schoolCode } = body;

    if (!schoolCode || typeof schoolCode !== "string") {
      return NextResponse.json(
        { error: "Missing school code" },
        { status: 400 },
      );
    }

    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.email || !session?.user?.name) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isValidSchool = schoolData.schools.find(
      (school) => school.schoolCode === schoolCode,
    );

    if (!isValidSchool) {
      return NextResponse.json(
        { error: "Invalid school code" },
        { status: 400 },
      );
    }

    const existingSchool = await prisma.school.findUnique({
      where: { code: schoolCode },
    });

    if (!existingSchool) {
      return NextResponse.json(
        { error: "School not found in database" },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, schoolCode: true },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent switching school codes once set
    if (existingUser.schoolCode && existingUser.schoolCode !== schoolCode) {
      return NextResponse.json(
        { error: "You are already assigned to a school and cannot switch." },
        { status: 403 },
      );
    }

    await prisma.user.update({
      where: { id: existingUser.id },
      data: { schoolCode },
    });

    return NextResponse.json({
      message: "School code verified",
      schoolName: isValidSchool.schoolName,
    });
  } catch (error) {
    console.error("schoolCheck error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
