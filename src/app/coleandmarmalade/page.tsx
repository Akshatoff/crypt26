"use client";

import { useEffect, useState } from "react";

const POEM_LINES = [
  "just as the wind scatters the old across the earth,",
  "   presently the living timber bursts with fresh buds,",
  "   0nly for time to cast them aside once more.",
  "the gods above watch, weaving fate's quiet thread,",
  "Questioning nothing, knowing all that is to come.",
  "kings rise and fall;",
  "yet honor alone endures,",
  "Eternally sung by those who remain.",
];

export default function BacklinkPage() {
  const [revealed, setRevealed] = useState<boolean[]>(Array(POEM_LINES.length).fill(false));
  const [glitchActive, setGlitchActive] = useState(false);
  const [cursor, setCursor] = useState(true);

  // Reveal lines one by one
  useEffect(() => {
    POEM_LINES.forEach((_, i) => {
      setTimeout(() => {
        setRevealed((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, 600 + i * 480);
    });

    // Cursor blink
    const cursorInterval = setInterval(() => setCursor((c) => !c), 530);

    // Random glitch bursts
    const glitchInterval = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 120);
    }, 7000);

    return () => {
      clearInterval(cursorInterval);
      clearInterval(glitchInterval);
    };
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050a05",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "4rem 2rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* CRT scanline overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)",
          pointerEvents: "none",
          zIndex: 10,
        }}
      />

      {/* Vignette */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.85) 100%)",
          pointerEvents: "none",
          zIndex: 9,
        }}
      />

      {/* Top bar */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          padding: "0.5rem 1.5rem",
          borderBottom: "1px solid #3a0000",
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: "0.55rem",
          color: "#ff000060",
          letterSpacing: "0.2em",
          zIndex: 20,
        }}
      >
        <span>CRYPT@TRIX // BACKLINK_NODE</span>
        <span style={{ color: "#ff000040" }}>ACCESS: UNRESTRICTED</span>
        <span>SYS_ID: 0xCM_77</span>
      </div>

      {/* Main terminal */}
      <div
        style={{
          width: "100%",
          maxWidth: 680,
          border: "1px solid #3a0000",
          borderTop: "2px solid #ff002b",
          background: "rgba(12, 2, 2, 0.95)",
          position: "relative",
          zIndex: 15,
          boxShadow: "0 0 60px rgba(255, 0, 17, 0.15)",
        }}
      >
        {/* Terminal header */}
        <div
          style={{
            padding: "0.4rem 1rem",
            background: "#1a0505",
            borderBottom: "1px solid #3a0000",
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: "0.55rem",
            color: "#ff000060",
            letterSpacing: "0.15em",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>// RECOVERED_TRANSMISSION</span>
          <div style={{ display: "flex", gap: "0.3rem" }}>
            <span style={{ color: "#ff2040", fontSize: "0.8rem" }}>●</span>
            <span style={{ color: "#ffb020", fontSize: "0.8rem" }}>●</span>
            <span style={{ color: "#ff002b", fontSize: "0.8rem" }}>●</span>
          </div>
        </div>

        {/* Poem content */}
        <div
          style={{
            padding: "2.5rem 2rem 2rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.15rem",
          }}
        >
          {/* Label */}
          <div
            style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: "0.55rem",
              color: "#ff000040",
              letterSpacing: "0.3em",
              marginBottom: "1.5rem",
              textTransform: "uppercase",
            }}
          >
            $ cat recovered_text.dat
          </div>

          {POEM_LINES.map((line, i) => (
            <div
              key={i}
              style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: "clamp(0.8rem, 2vw, 0.95rem)",
                color: revealed[i] ? "#cc2222" : "transparent",
                letterSpacing: "0.05em",
                lineHeight: 2,
                transition: "color 400ms ease, opacity 400ms ease",
                opacity: revealed[i] ? 1 : 0,
                filter: glitchActive && revealed[i] ? "blur(1px)" : "none",
                transform: glitchActive && revealed[i] && i % 3 === 0
                  ? "translateX(2px)"
                  : "none",
                whiteSpace: "pre",
                position: "relative",
              }}
            >
              {line}
            </div>
          ))}

          {/* Blinking cursor after last line */}
          <div
            style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: "0.9rem",
              color: "#ff002b",
              marginTop: "0.5rem",
              opacity: revealed[POEM_LINES.length - 1] ? 1 : 0,
              transition: "opacity 400ms",
            }}
          >
            {cursor ? "█" : " "}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            padding: "0.4rem 1rem",
            background: "#1a0505",
            borderTop: "1px solid #3a0000",
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: "0.5rem",
            color: "#ff000040",
            letterSpacing: "0.15em",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>ORIGIN: UNKNOWN</span>
          <span>ENCODING: UTF-8_MODIFIED</span>
          <span>CHECKSUM: ERR</span>
        </div>
      </div>

      {/* Subtle hint below */}
      <div
        style={{
          marginTop: "2rem",
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: "0.55rem",
          color: "#ff000025",
          letterSpacing: "0.25em",
          textAlign: "center",
          zIndex: 15,
          position: "relative",
        }}
      >
        THE FIRST LETTERS REMEMBER WHAT TIME FORGETS
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');
      `}</style>
    </div>
  );
}