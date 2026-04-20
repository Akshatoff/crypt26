import { auth } from "@/server/auth";
import { prisma } from "@/server/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

// Simple in-memory rate limiter: max 10 attempts per user per minute
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + 60_000 });
    return false;
  }

  if (entry.count >= 10) {
    return true;
  }

  entry.count++;
  return false;
}

const normalize = (str: string) => str.replace(/\s+/g, "").toLowerCase();

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse body safely
  let answer: string;
  try {
    const body = await req.json();
    answer = body?.answer;
    if (typeof answer !== "string" || !answer.trim()) {
      return NextResponse.json({ error: "Invalid answer" }, { status: 400 });
    }
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  // Fetch user with school
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { School: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (user.banned) {
    return NextResponse.json({ error: "Account banned" }, { status: 403 });
  }

  if (!user.schoolCode || !user.School) {
    return NextResponse.json({ error: "No school assigned" }, { status: 400 });
  }

  // Rate limit check
  if (isRateLimited(user.id)) {
    return NextResponse.json(
      { error: "Too many attempts. Wait a minute before trying again." },
      { status: 429 },
    );
  }

  const currentLevel = user.School.level;

  // FETCH TOTAL LEVELS DYNAMICALLY FROM DATABASE
  const totalLevels = await prisma.question.count();

  // Hunt finished
  if (currentLevel > totalLevels) {
    return NextResponse.json(
      { error: "You have completed all levels!" },
      { status: 400 },
    );
  }

  // GET CORRECT ANSWER FROM DATABASE
  const questionData = await prisma.question.findUnique({
    where: { level: currentLevel },
    select: { answer: true }, // We only need the answer to check against
  });

  if (!questionData) {
    return NextResponse.json(
      { error: "Question not found for this level" },
      { status: 500 },
    );
  }

  const isCorrect = normalize(questionData.answer) === normalize(answer);

  // Always log the attempt
  await prisma.attempt.create({
    data: {
      user_id: user.id,
      school_id: user.schoolCode,
      userAttempt: answer.slice(0, 500), // cap length to prevent abuse
      level: currentLevel,
      schoolCode: user.schoolCode,
      userId: user.id,
    },
  });

  if (!isCorrect) {
    return NextResponse.json({ success: false, message: "Wrong answer" });
  }

  // ── Correct answer path ──────────────────────────────────────────────────

  const priorCorrectCount = await prisma.attempt.count({
    where: {
      level: currentLevel,
      schoolCode: user.schoolCode,
      userAttempt: { equals: questionData.answer, mode: "insensitive" },
    },
  });

  const isFirstSolveForThisSchool = priorCorrectCount === 1; // only the one we just inserted

  if (isFirstSolveForThisSchool) {
    // Position among ALL schools (0-indexed): how many distinct schools solved before us
    const priorSolvers = await prisma.attempt.groupBy({
      by: ["schoolCode"],
      where: {
        level: currentLevel,
        userAttempt: { equals: questionData.answer, mode: "insensitive" },
        schoolCode: { not: user.schoolCode }, // exclude ourselves
      },
    });

    const position = priorSolvers.length; // 0 = first school, 1 = second, etc.
    const scoreToAward = Math.max(100 - position * 10, 10);

    await prisma.school.update({
      where: { code: user.schoolCode },
      data: {
        score: { increment: scoreToAward },
        level: { increment: 1 },
      },
    });
  }

  const nextLevel = currentLevel + 1;

  return NextResponse.json({
    success: true,
    nextLevel,
    isComplete: nextLevel > totalLevels,
  });
}