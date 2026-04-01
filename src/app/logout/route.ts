import { auth } from "@/server/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Revoke the session server-side
    const session = await auth.api.getSession({ headers: await headers() });

    if (session?.session?.token) {
      await auth.api.revokeSession({
        headers: await headers(),
        body: { token: session.session.token },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    // Return success anyway — client will redirect regardless
    return NextResponse.json({ success: true });
  }
}
