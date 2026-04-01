import Link from "next/link";
import "animate.css";
import LetterGlitch from "./components/LetterGlitch";
import DecryptedText from "./components/DecryptedText";

export default function Home() {
  return (
    <>
      <LetterGlitch
        glitchColors={["#001a00", "#003300", "#00ff41"]}
        glitchSpeed={50}
        centerVignette={true}
        outerVignette={true}
        smooth={true}
      >
        {/* Scanline overlay for CRT feel */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)",
            pointerEvents: "none",
            zIndex: 5,
          }}
        />

        {/* Top system bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            padding: "0.6rem 1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "rgba(0,10,0,0.6)",
            borderBottom: "1px solid #1a3a1a",
            zIndex: 12,
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: "0.6rem",
            color: "#5a8a5c",
            letterSpacing: "0.15em",
          }}
        >
          <span>CRYPT@TRIX // v25.0</span>
          <span style={{ color: "#00ff41" }}>● SYSTEM ONLINE</span>
          <span>SEC_LVL: CLASSIFIED</span>
        </div>

        <div className="text-con" style={{ flexDirection: "column", gap: "0.5rem" }}>
          <span
            style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: "0.7rem",
              color: "#5a8a5c",
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              marginBottom: "0.5rem",
            }}
          >
            ORDINA TRIX // ANNUAL EVENT
          </span>

          <DecryptedText
            text="CRYPT@TRIX"
            speed={80}
            maxIterations={25}
            characters="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%"
            className="revealed heading"
            parentClassName="all-letters"
            encryptedClassName="encrypted"
            animateOn="view"
            revealDirection="start"
            sequential={true}
          />

          <span
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: "0.75rem",
              color: "#5a8a5c",
              letterSpacing: "0.6em",
              marginTop: "0.25rem",
            }}
          >
            25.0
          </span>
        </div>

        <nav className="menu">
          <div
            style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: "0.55rem",
              color: "#003a0f",
              letterSpacing: "0.3em",
              marginBottom: "0.75rem",
              borderBottom: "1px solid #1a3a1a",
              paddingBottom: "0.5rem",
            }}
          >
            // SELECT_OPERATION
          </div>

          <Link href="/dashboard">
            <div className="menu-item">New Game</div>
          </Link>
          <Link href="/leaderboard">
            <div className="menu-item">Leaderboard</div>
          </Link>
          <Link href="/about">
            <div className="menu-item">Tutorial</div>
          </Link>
          <Link href="/login">
            <div className="menu-item">Auth / Login</div>
          </Link>
          <Link href="/logout">
            <div className="menu-item" style={{ color: "#ff2040", borderLeftColor: "transparent" }}>
              Exit Session
            </div>
          </Link>
        </nav>

        {/* Bottom bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "0.5rem 1.5rem",
            display: "flex",
            justifyContent: "space-between",
            background: "rgba(0,10,0,0.6)",
            borderTop: "1px solid #1a3a1a",
            zIndex: 12,
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: "0.55rem",
            color: "#003a0f",
            letterSpacing: "0.1em",
          }}
        >
          <span>ENCRYPTED_HUNT // CRYPTOGRAPHY + STEGANOGRAPHY</span>
          <span>⚠ DO NOT ATTEMPT BRUTE FORCE</span>
        </div>

        <div className="overlay" />
      </LetterGlitch>
    </>
  );
}
