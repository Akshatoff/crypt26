// /app/team/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/server/db";

export async function POST(req: Request) {
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json(
        { error: "Missing school code" },
        { status: 400 }
      );
    }

    const school = await prisma.school.findUnique({
      where: { code },
      include: { users: true },
    });

    if (!school) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    return NextResponse.json({ users: school.users });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
