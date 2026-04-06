import Link from "next/link";

import "animate.css";

import DecryptedText from "./components/DecryptedText";



export default function Home() {

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

        {/* Scanline overlay for CRT feel */}





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

          <span>SEC_LVL: CLASSIFIED</span>

        </div>



        <div className="text-con" style={{ flexDirection: "column", gap: "0.5rem" }}>





          <DecryptedText

            text="CRYPT@tRIX"

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





        </div>



        {/* <nav className="menu">

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

        </nav> */}



        {/* Bottom bar */}

        {/* <div

          style={{

            position: "absolute",

            bottom: 0,

            left: 0,

            right: 0,

            padding: "0.5rem 1.5rem",

            display: "flex",

            justifyContent: "space-between",

            background: "rgba(0,10,0,1)",

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

        </div> */}



      </div>

    </div>

  );

}