"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";
import discordSVG from "../../../public/discord.svg";

const BOOT_LINES = [
  "CRYPT@TRIX v25.0 — SECURE BOOT",
  "Initializing cryptographic modules...",
  "Loading steganography engine...",
  "Verifying puzzle integrity...",
  "Establishing secure channel...",
  "SYSTEM READY — AUTHENTICATION REQUIRED",
];

const handleLogin = async () => {
  try {
    await authClient.signIn.social({
      provider: "discord",
      callbackURL: "/dashboard",
      errorCallbackURL: "/error",
      newUserCallbackURL: "/dashboard",
      disableRedirect: false,
    });
  } catch (error) {
    console.error("Login failed", error);
  }
};

export default function LoginPage() {
  const [bootLines, setBootLines] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < BOOT_LINES.length) {
        setBootLines((prev) => [...prev, BOOT_LINES[i]]);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => setReady(true), 300);
      }
    }, 280);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        gap: "3rem",
        position: "relative",
      }}
    >
      {/* Back link */}
      <Link
        href="/"
        style={{
          position: "fixed",
          top: "1.5rem",
          left: "1.5rem",
          fontFamily: "var(--font-mono)",
          fontSize: "0.65rem",
          color: "var(--text-dim)",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
          background: "var(--bg2)",
          border: "1px solid var(--border)",
          padding: "0.4rem 0.75rem",
          transition: "all 200ms",
        }}
      >
        ← BACK
      </Link>

      {/* Terminal boot sequence */}
      <div
        style={{
          width: "100%",
          maxWidth: 560,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderTop: "1px solid var(--accent)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0.4rem 0.75rem",
            background: "var(--surface2)",
            borderBottom: "1px solid var(--border)",
            fontFamily: "var(--font-mono)",
            fontSize: "0.55rem",
            color: "var(--text-dim)",
            letterSpacing: "0.1em",
          }}
        >
          <span>TERMINAL // AUTH_MODULE</span>
          <div style={{ display: "flex", gap: "0.3rem" }}>
            <span style={{ color: "var(--red)", fontSize: "1rem", lineHeight: 1 }}>●</span>
            <span style={{ color: "var(--amber)", fontSize: "1rem", lineHeight: 1 }}>●</span>
            <span style={{ color: "var(--accent)", fontSize: "1rem", lineHeight: 1 }}>●</span>
          </div>
        </div>

        <div
          style={{
            padding: "1rem 1.25rem",
            minHeight: 200,
            display: "flex",
            flexDirection: "column",
            gap: "0.35rem",
          }}
        >
          {bootLines.map((line, i) => (
            <div
              key={i}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                color: i === bootLines.length - 1 ? "var(--text-bright)" : "var(--text-dim)",
                letterSpacing: "0.05em",
                display: "flex",
                gap: "0.5rem",
                animation: "fadeIn 0.2s ease",
              }}
            >
              <span style={{ color: "var(--accent-dim)" }}>$</span>
              {line}
              {i === bootLines.length - 1 && !ready && (
                <span
                  style={{
                    display: "inline-block",
                    width: 8,
                    height: "1em",
                    background: "var(--accent)",
                    animation: "blink 0.8s step-end infinite",
                    marginLeft: 2,
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Auth panel */}
      <div
        style={{
          width: "100%",
          maxWidth: 560,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          overflow: "hidden",
          opacity: ready ? 1 : 0,
          transform: ready ? "translateY(0)" : "translateY(10px)",
          transition: "all 400ms ease",
        }}
      >
        <div
          style={{
            borderTop: "2px solid var(--accent)",
            padding: "2rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
            alignItems: "center",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.6rem",
                color: "var(--text-dim)",
                letterSpacing: "0.3em",
                marginBottom: "0.5rem",
              }}
            >
              // IDENTITY_VERIFICATION
            </div>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.5rem",
                fontWeight: 900,
                color: "var(--text-bright)",
                letterSpacing: "0.1em",
                textShadow: "var(--glow)",
              }}
            >
              AUTHENTICATE
            </h1>
          </div>

          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.75rem",
              color: "var(--text-dim)",
              textAlign: "center",
              letterSpacing: "0.05em",
              lineHeight: 1.7,
              maxWidth: 380,
            }}
          >
            Authorization required to access the CRYPT@TRIX mission system.
            Authenticate your identity via Discord OAuth to proceed.
          </p>

          <button
            className="blurple"
            onClick={handleLogin}
            style={{
              padding: "0.8rem 2rem",
              fontSize: "0.85rem",
              letterSpacing: "0.1em",
              width: "100%",
              maxWidth: 280,
              gap: "0.75rem",
            }}
          >
            <Image src={discordSVG} alt="Discord" width={20} height={20} />
            LOGIN WITH DISCORD
          </button>

          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.6rem",
              color: "var(--text-dim)",
              opacity: 0.5,
              textAlign: "center",
              letterSpacing: "0.08em",
            }}
          >
            BY LOGGING IN YOU AGREE TO THE{" "}
            <Link href="/guidelines" style={{ color: "var(--text-dim)", textDecoration: "underline" }}>
              COMPETITION GUIDELINES
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes blink { 50% { opacity: 0; } }
      `}</style>
    </div>
  );
}
