import { auth } from "@/server/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

// Changed to GET so browser navigation works
export async function GET(req: Request) { 
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (session?.session?.token) {
      await auth.api.revokeSession({
        headers: await headers(),
        body: { token: session.session.token },
      });
    }

    // Redirect the user back to the login page after clearing the session
    return NextResponse.redirect(new URL("/login", req.url));
  } catch (error) {
    console.error("Logout error:", error);
    // Redirect even if it fails
    return NextResponse.redirect(new URL("/login", req.url));
  }
}