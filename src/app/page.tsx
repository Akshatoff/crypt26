"use client"

import Link from "next/link";
import { useState, useEffect } from "react";
import "animate.css";
import DecryptedText from "./components/DecryptedText";

export default function Home() {

  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(timer);
  }, []);
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        backgroundColor: "#050a05",
        overflow: "hidden",
        display: "flex",
      }}
    >
      {/* === CRT SCANLINE OVERLAY === 
        Sits on top of everything (zIndex: 999) to give the screen texture.
        pointerEvents: "none" is critical so it doesn't block clicks!
      */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 0.4) 50%)",
          backgroundSize: "100% 4px", /* Controls the thickness of the lines */
          zIndex: 999,
          pointerEvents: "none",
        }}
      />

      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover", // Ensures the video covers the screen without stretching
          zIndex: 0,
        }}
      >
        {/* Make sure to place your video file in the 'public' folder of your Next.js app */}
        <source src="/first.mp4" type="video/mp4" />
      </video>

      {/* Vignette Overlay (Kept from your original setup for depth) */}

      {/* Main Content Wrapper */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          zIndex: 2,
        }}
      >
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
            borderBottom: "1px solid #b41515",
            zIndex: 12,
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: "0.6rem",
            color: "#dd0d0d",
            letterSpacing: "0.15em",
          }}
        >
          <span>CRYPT@TRIX // v26.0</span>
          <span style={{ color: "#ff0011" }}>● SYSTEM ONLINE</span>
          <span style={{fontSize: "1rem"}}>{time}</span>
        </div>

        <div className="text-con" style={{ flexDirection: "column", gap: "0.5rem" }}>
          {/* Glitch Heading */}
          <div className="glitch-wrapper">
            <h1
              className="text heading glitch-text"
              data-text="CRYPT@TRIX"
            >
              CRYPT<span className="spe">@</span>TRIX
            </h1>
          </div>
        </div>

        <nav className="menu">
          <div
            style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: "0.55rem",
              color: "#8d0404",
              letterSpacing: "0.3em",
              marginBottom: "0.75rem",
              borderBottom: "1px solid #3a1a21",
              paddingBottom: "0.5rem",
            }}
          >
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
            <div className="menu-item" style={{ borderLeftColor: "transparent" }}>
              Exit Session
            </div>
          </Link>
        </nav>

        {/* Bottom system bar */}
        
      </div>
    </div>
  );
}