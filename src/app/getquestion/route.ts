import { auth } from "@/server/auth";
import { prisma } from "@/server/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // We can fetch the user and their school in one go
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { School: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (!user.schoolCode || !user.School) {
    return NextResponse.json(
      { error: "No school assigned. Please enter your school code first." },
      { status: 400 },
    );
  }

  if (user.banned) {
    return NextResponse.json(
      { error: "Your account has been banned." },
      { status: 403 },
    );
  }

  const level = user.School.level;

  // FETCH SECURELY FROM DATABASE
  // By using `select`, Prisma ensures the `answer` is never even loaded into memory here
  const question = await prisma.question.findUnique({
    where: { level: level },
    select: {
      level: true,
      content: true,
      img: true,
      // Notice we DO NOT select `answer` here!
    },
  });

  if (!question) {
    return NextResponse.json(
      { error: "No question found for this level. The hunt may be complete!" },
      { status: 404 },
    );
  }

  return NextResponse.json({ level, question });
}
