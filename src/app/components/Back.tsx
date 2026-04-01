import React from "react";
import Link from "next/link";

export default function Back() {
  return (
    <Link
      href="/"
      style={{
        position: "fixed",
        top: "1.5rem",
        left: "1.5rem",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        gap: "0.4rem",
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: "0.65rem",
        color: "var(--text-dim)",
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        background: "var(--bg2)",
        border: "1px solid var(--border)",
        padding: "0.5rem 0.75rem",
        textDecoration: "none",
        transition: "all 200ms ease",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.color = "var(--text-bright)";
        el.style.borderColor = "var(--accent)";
        el.style.boxShadow = "var(--glow)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.color = "var(--text-dim)";
        el.style.borderColor = "var(--border)";
        el.style.boxShadow = "none";
      }}
    >
      ← BACK
    </Link>
  );
}
