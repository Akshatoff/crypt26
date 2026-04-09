"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import dynamic from "next/dynamic";
import Image from "next/image";
import db from "../../../public/danda.png";
import Link from "next/link";

const QuestionPopup = dynamic(() => import("@/app/components/QuestionPopup"), {
  ssr: false,
});

type UserSession = {
  user?: { name?: string; email?: string; image?: string };
};

type PublicQuestion = {
  level: number;
  question: string;
  img?: string;
};

// Module-level variable to track if the sequence has run this session
let hasAudioPlayedThisSession = false;

function SystemBar({ level }: { level: number | null }) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () =>
      setTime(new Date().toISOString().replace("T", " ").slice(0, 19));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "2rem",
        padding: "0.5rem 1.5rem",
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        fontFamily: "var(--font-mono)",
        fontSize: "0.6rem",
        color: "var(--text-dim)",
        letterSpacing: "0.1em",
        position: "fixed",
        top: 0,
        left: 90,
        right: 0,
        zIndex: 50,
      }}
    >
      <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "var(--accent)",
            boxShadow: "0 0 6px var(--accent)",
            display: "inline-block",
            animation: "blink 1.5s infinite",
          }}
        />
        SYS::ONLINE
      </span>
      <span>UTC {time}</span>
      {level && (
        <span style={{ color: "var(--text-bright)" }}>LEVEL {level} / 15</span>
      )}
      <span style={{ marginLeft: "auto" }}>CRYPT@TRIX v25.0</span>
    </div>
  );
}

export default function Page() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [code, setCode] = useState<string | null>(null);
  const [schoolName, setSchoolName] = useState<string | null>(null);
  const [inputCode, setInputCode] = useState("");
  const [questionData, setQuestionData] = useState<PublicQuestion | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [currentLevel, setCurrentLevel] = useState<number | null>(null);
  const [teamMembers, setTeamMembers] = useState<
    { name?: string; email?: string }[]
  >([]);
  const [loading, setLoading] = useState(false);

  // --- AUDIO LOGIC STATES ---
  const [isLocked, setIsLocked] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // --- AUDIO DELAY AND LOCK EFFECT ---
  useEffect(() => {
    // 1. DO NOT RUN until we have confirmed the user is logged in
    if (!session) return;

    // 2. If it already played (or attempted to play) this session, skip
    if (hasAudioPlayedThisSession) return;

    const delayTimer = setTimeout(() => {
      if (audioRef.current) {
        setIsLocked(true); // Lock the screen while audio plays
        
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              hasAudioPlayedThisSession = true;
            })
            .catch((err) => {
              console.warn("Autoplay blocked by browser. User likely reloaded the page directly.", err);
              // Immediately unlock the screen if blocked so the user isn't trapped
              setIsLocked(false);
              hasAudioPlayedThisSession = true; // Mark as attempted so we don't keep trying
            });
        }
      }
    }, 2000); // 2-second delay after session is confirmed

    return () => clearTimeout(delayTimer);
  }, [session]); // <-- Added session to dependency array

  const handleAudioEnded = () => {
    setIsLocked(false);
  };
  // -------------------------

  const logout = async () => {
    try {
      await fetch("/logout", { method: "POST" });
      await authClient.signOut();
      router.push("/login");
    } catch {
      router.push("/login");
    }
  };

  const fetchAndShowQuestion = async () => {
    setLoading(true);
    try {
      const res = await fetch("/getquestion", { cache: "no-store" });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Error fetching question");
        return;
      }

      setCurrentLevel(data.level);
      setQuestionData(data.question);
      setShowPopup(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async (
    schoolCode: string,
    currentUserEmail?: string
  ) => {
    try {
      const res = await fetch("/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: schoolCode }),
      });
      const data = await res.json();
      if (res.ok) {
        setTeamMembers(
          (data.users || []).filter((u: any) => u.email !== currentUserEmail)
        );
      }
    } catch {}
  };

  const verifySchoolCode = async () => {
    if (!inputCode.trim()) return;
    try {
      const response = await fetch("/schoolCheck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schoolCode: inputCode }),
      });
      const data = await response.json();
      if (response.ok) {
        setSchoolName(data.schoolName);
        setCode(inputCode);
        await fetchTeamMembers(inputCode, session?.user?.email);
      } else {
        alert(data.error);
      }
    } catch {
      alert("Something went wrong, please try again");
    }
  };

  const fetchSchoolName = async (code: string) => {
    try {
      const res = await fetch("/schoolCheck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schoolCode: code }),
      });
      const data = await res.json();
      if (res.ok) setSchoolName(data.schoolName);
      else {
        setCode(null);
        setSchoolName(null);
      }
    } catch {}
  };

  const fetchCurrentLevel = async () => {
    try {
      const res = await fetch("/getlevel", { cache: "no-store" });
      const data = await res.json();
      if (res.ok) setCurrentLevel(data.level);
    } catch {}
  };

  useEffect(() => {
    const init = async () => {
      try {
        const { data } = await authClient.getSession();
        if (!data?.user) {
          router.push("/login");
          return;
        }
        setSession(data as UserSession);
        const userEmail = data.user?.email;

        const response = await fetch("/getSchool");
        const schoolData = await response.json();
        if (response.ok && schoolData.schoolCode) {
          setCode(schoolData.schoolCode);
          await fetchSchoolName(schoolData.schoolCode);
          await fetchTeamMembers(schoolData.schoolCode, userEmail);
        }

        await fetchCurrentLevel();
      } catch (err) {
        setError(err as any);
      }
    };
    init();
  }, []);

  return (
    <div style={{ position: "relative", minHeight: "100vh", backgroundColor: "#050a05" }}>
      {/* === CRT SCANLINE OVERLAY === */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 0.4) 50%)",
          backgroundSize: "100% 4px",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      {/* === BACKGROUND VIDEO === */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
        }}
      >
        <source src="/first.mp4" type="video/mp4" />
      </video>

      {/* === MAIN CONTENT WRAPPER === */}
      <div style={{ position: "relative", zIndex: 2 }}>
        {/* === BACKGROUND AUDIO SETUP === */}
        <audio 
          ref={audioRef} 
          src="/crypt.mp3" 
          onEnded={handleAudioEnded} 
          preload="auto"
        />

        {/* === INTERACTION BLOCKER (DURING AUDIO) === */}
        {isLocked && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              zIndex: 999999, 
              cursor: "wait",
            }}
          />
        )}

        {/* Sidebar */}
        <nav className="sidenav">
          <ul className="sidelist">
            <Link href="/dashboard">
              <li className="navitem">Home</li>
            </Link>
            <Link href="/about">
              <li className="navitem">Docs</li>
            </Link>
            <Link href="/leaderboard">
              <li className="navitem">Ranks</li>
            </Link>
            <li
              className="navitem"
              onClick={logout}
              style={{ color: "var(--red)", cursor: "pointer" }}
            >
              Exit
            </li>
          </ul>
        </nav>

        <SystemBar level={currentLevel} />

        <div
          id="dash"
          style={{
            paddingTop: "calc(2rem + 40px)",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
            minHeight: "100vh",
          }}
        >
          {/* User Card */}
          <div className="upper">
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 0,
                width: "100%",
                maxWidth: 700,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.4rem 1rem",
                  background: "var(--surface2)",
                  border: "1px solid var(--border)",
                  borderBottom: "none",
                  borderTop: "1px solid var(--accent)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.6rem",
                  color: "var(--text-dim)",
                  letterSpacing: "0.2em",
                }}
              >
                <span style={{ color: "var(--accent)" }}>//</span> AGENT_PROFILE
              </div>

              <div className="user-dash">
                <div className="user-info">
                  {error ? (
                    <p style={{ color: "var(--red)", fontSize: "0.8rem" }}>
                      ERR: Failed to load agent data
                    </p>
                  ) : session ? (
                    <>
                      <span id="name">AGENT_ID</span>
                      <h1 id="username">{session.user?.name || "UNKNOWN"}</h1>
                      <div className="school-con">
                        {code ? (
                          <p>
                            UNIT: <span>{schoolName || "FETCHING..."}</span>
                          </p>
                        ) : (
                          <>
                            <input
                              type="text"
                              placeholder="ENTER UNIT CODE"
                              value={inputCode}
                              onChange={(e) => setInputCode(e.target.value)}
                              onKeyDown={(e) =>
                                e.key === "Enter" && verifySchoolCode()
                              }
                              style={{ marginTop: 0, fontSize: "0.75rem" }}
                            />
                            <button className="submit" onClick={verifySchoolCode}>
                              VERIFY
                            </button>
                          </>
                        )}
                      </div>
                    </>
                  ) : (
                    <p
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.8rem",
                        color: "var(--text-dim)",
                      }}
                    >
                      LOADING AGENT DATA...
                    </p>
                  )}
                </div>
                <div className="user-img">
                  <Image src={db} alt="Agent" id="db" />
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "1.5rem",
                  padding: "0.4rem 1rem",
                  background: "var(--bg2)",
                  border: "1px solid var(--border)",
                  borderTop: "none",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.6rem",
                  color: "var(--text-dim)",
                  letterSpacing: "0.1em",
                }}
              >
                <span>
                  <span style={{ color: "var(--accent)" }}>LEVEL</span>{" "}
                  {currentLevel ? `${currentLevel}/15` : "--"}
                </span>
                <span>
                  <span style={{ color: "var(--accent)" }}>UNIT</span>{" "}
                  {code || "UNASSIGNED"}
                </span>
                <span>
                  <span style={{ color: "var(--accent)" }}>STATUS</span>{" "}
                  {session ? "ACTIVE" : "OFFLINE"}
                </span>
              </div>
            </div>
          </div>

          {/* Lower cards */}
          <div className="lower">
            {/* Play card */}
            <div className="play-con">
              <div>
                <div className="play-label">// MISSION_CONTROL</div>
                <p id="play">Ready to lose your sleep?</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.6rem",
                    color: "var(--text-dim)",
                    padding: "0.4rem",
                    background: "var(--bg2)",
                    border: "1px solid var(--border)",
                  }}
                >
                  OBJECTIVE: Solve cryptic puzzles &amp; advance levels
                </div>
                <button
                  className="play-btn"
                  onClick={fetchAndShowQuestion}
                  disabled={loading || !code}
                  style={{ opacity: loading || !code ? 0.6 : 1 }}
                  title={!code ? "Enter your school code first" : undefined}
                >
                  {loading ? "LOADING..." : "▶ EXECUTE"}
                </button>
                {!code && (
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.6rem",
                      color: "var(--amber)",
                      letterSpacing: "0.1em",
                    }}
                  >
                    ⚠ Enter school code first
                  </div>
                )}
              </div>
            </div>

            {/* Team card */}
            <div className="team">
              <h2 id="team-mem">Team Roster</h2>
              <ol className="user-list">
                {teamMembers.length > 0 ? (
                  teamMembers.map((user, idx) => (
                    <li key={idx} className="user">
                      {user.name || user.email || "UNKNOWN_AGENT"}
                    </li>
                  ))
                ) : (
                  <li
                    className="user"
                    style={{
                      borderLeftColor: "var(--border)",
                      color: "var(--text-dim)",
                      opacity: 0.5,
                    }}
                  >
                    NO AGENTS FOUND
                  </li>
                )}
              </ol>
            </div>

            {/* Quick links */}
            <div
              style={{
                width: 180,
                minHeight: 260,
                border: "1px solid var(--border)",
                background: "var(--surface)",
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "0.5rem",
                  right: "0.75rem",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.55rem",
                  color: "var(--text-dim)",
                  letterSpacing: "0.1em",
                  opacity: 0.5,
                }}
              >
                SYS::LINKS
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  color: "var(--text)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  borderBottom: "1px solid var(--border)",
                  paddingBottom: "0.75rem",
                  marginBottom: "0.25rem",
                }}
              >
                Quick Access
              </div>
              {[
                { href: "/leaderboard", label: "Leaderboard" },
                { href: "/about", label: "Tutorial" },
                { href: "/guidelines", label: "Guidelines" },
              ].map((item) => (
                <Link key={item.href} href={item.href}>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.75rem",
                      color: "var(--text-dim)",
                      padding: "0.5rem 0.5rem",
                      borderLeft: "2px solid var(--border)",
                      transition: "all 150ms",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderLeftColor =
                        "var(--accent)";
                      (e.currentTarget as HTMLElement).style.color =
                        "var(--text-bright)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderLeftColor =
                        "var(--border)";
                      (e.currentTarget as HTMLElement).style.color =
                        "var(--text-dim)";
                    }}
                  >
                    <span style={{ color: "var(--accent-dim)" }}>&gt;</span>
                    {item.label}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {showPopup && questionData && (
            <QuestionPopup
              questionText={questionData.question}
              img={questionData.img}
              open={showPopup}
              onClose={() => setShowPopup(false)}
              onNextLevel={async (nextLevel: number) => {
                setCurrentLevel(nextLevel);
                // Re-fetch the new question from server
                setShowPopup(false);
                setTimeout(() => fetchAndShowQuestion(), 300);
              }}
              level={currentLevel || 1}
            />
          )}
        </div>
      </div>
    </div>
  );
}