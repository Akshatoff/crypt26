import { NextResponse } from "next/server";
import { authClient } from "@/lib/auth-client";

export async function POST() {
  try {
    await authClient.signOut(); // assumes BetterAuth exposes this
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error logging out:", error);
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
  }
}
