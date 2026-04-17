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

// --- LEADERBOARD TYPES ---
type Entry = { rank: number; team: string; score: number };
const MEDALS = ["◆", "◇", "○"];

// Module-level variable to track if the sequence has run this session
let hasAudioPlayedThisSession = false;

// --- FNAF THEME OVERLAYS ---
function FnafUI({ level, timeStr }: { level: number | null; timeStr: string }) {
  return (
    <>
      {/* TOP LEFT: REC */}
      <div
        style={{
          position: "fixed",
          top: "2rem",
          left: "2rem",
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          fontFamily: "'Courier New', Courier, monospace",
        }}
      >
        <div
          style={{
            width: 25,
            height: 25,
            borderRadius: "50%",
            background: "#ff0000",
            animation: "blink 1s infinite",
          }}
        />
        <span style={{ color: "white", fontSize: "1.5rem", fontWeight: "bold", textShadow: "0 0 5px white" }}>
          REC
        </span>
      </div>

      {/* TOP RIGHT: TIME & NIGHT */}
      <div
        style={{
          position: "fixed",
          top: "2rem",
          right: "2rem",
          zIndex: 50,
          textAlign: "right",
          fontFamily: "'Courier New', Courier, monospace",
          color: "white",
        }}
      >
        <div style={{ fontSize: "3rem", fontWeight: "bold", textShadow: "0 0 5px white" }}>
          {timeStr}
        </div>
        <div style={{ fontSize: "1.5rem", marginTop: "-0.5rem" }}>
          Night {level || 1}
        </div>
      </div>

      {/* BOTTOM LEFT: BATTERY/USAGE */}
      <div
        style={{
          position: "fixed",
          bottom: "3rem",
          left: "2rem",
          zIndex: 50,
          fontFamily: "'Courier New', Courier, monospace",
          color: "white",
          fontSize: "1.2rem",
        }}
      >
        <div style={{ marginBottom: "0.5rem", fontWeight: "bold" }}>
          Power left: <span style={{ color: "var(--accent, rgb(255, 0, 0))" }}>SYS_OPTIMAL</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontWeight: "bold" }}>Usage:</span>
          <div style={{ display: "flex", gap: "4px" }}>
            <div style={{ width: 15, height: 25, background: "rgb(255, 0, 0)", boxShadow: "0 0 5px rgb(255, 0, 0)" }} />
            <div style={{ width: 15, height: 25, background: "rgb(255, 0, 0)", boxShadow: "0 0 5px rgb(255, 0, 0)" }} />
            <div style={{ width: 15, height: 25, background: "#ffcc00", boxShadow: "0 0 5px #ffcc00", opacity: 0.3 }} />
            <div style={{ width: 15, height: 25, background: "#ff0000", boxShadow: "0 0 5px #ff0000", opacity: 0.3 }} />
          </div>
        </div>
      </div>

      {/* BOTTOM CENTER: CAMERA FLIP BAR */}
      <div
        style={{
          position: "fixed",
          bottom: "1rem",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 50,
          width: "400px",
          height: "30px",
          border: "2px solid rgba(255,255,255,0.4)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          cursor: "not-allowed",
          background: "rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ color: "rgba(255,255,255,0.4)", letterSpacing: "5px" }}>
          &#x25BC; &#x25BC; &#x25BC; &#x25BC;
        </div>
      </div>
    </>
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
  const [teamMembers, setTeamMembers] = useState<{ name?: string; email?: string }[]>([]);
  const [loading, setLoading] = useState(false);

  // --- LEADERBOARD STATES ---
  const [leaderboard, setLeaderboard] = useState<Entry[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const [timeStr, setTimeStr] = useState("12 AM");
  const [isLocked, setIsLocked] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [activeCam, setActiveCam] = useState<"1A" | "1B" | "2A">("1A");

  // Time Loop
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      let hours = now.getHours();
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;
      setTimeStr(`${hours} ${ampm}`);
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, []);

  // Audio Auto-play Lock
  useEffect(() => {
    if (!session) return;
    if (hasAudioPlayedThisSession) return;

    const delayTimer = setTimeout(() => {
      if (audioRef.current) {
        setIsLocked(true);
        const playPromise = audioRef.current.play();

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              hasAudioPlayedThisSession = true;
            })
            .catch((err) => {
              console.warn("Autoplay blocked by browser.", err);
              setIsLocked(false);
              hasAudioPlayedThisSession = true;
            });
        }
      }
    }, 2000);

    return () => clearTimeout(delayTimer);
  }, [session]);

  const handleAudioEnded = () => {
    setIsLocked(false);
  };

  const logout = async () => {
    try {
      await fetch("/logout", { method: "POST" });
      await authClient.signOut();
      router.push("/login");
    } catch {
      router.push("/login");
    }
  };

  // --- FETCHING LOGIC ---
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

  const fetchTeamMembers = async (schoolCode: string, currentUserEmail?: string) => {
    try {
      const res = await fetch("/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: schoolCode }),
      });
      const data = await res.json();
      if (res.ok) {
        setTeamMembers((data.users || []).filter((u: any) => u.email !== currentUserEmail));
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

  const fetchSchoolName = async (schoolCode: string) => {
      try {
        const res = await fetch("/schoolCheck", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ schoolCode }),
        });
        const data = await res.json();
        if (res.ok) setSchoolName(data.schoolName);
      } catch {}
  };

  // --- LEADERBOARD LOGIC ---
  const fetchLeaderboard = async () => {
    try {
      const res = await fetch("/leaderboardrank");
      const data = await res.json();
      setLeaderboard(data);
      setLastUpdated(new Date().toISOString().slice(11, 19) + " UTC");
    } catch (error) {
      console.error("Fetching leaderboard failed", error);
    }
  };

  const refreshLeaderboard = async () => {
    setRefreshing(true);
    await fetchLeaderboard();
    setTimeout(() => setRefreshing(false), 2000);
  };

  // Init fetch on component mount
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

        const resLevel = await fetch("/getlevel", { cache: "no-store" });
        const levelData = await resLevel.json();
        if (resLevel.ok) setCurrentLevel(levelData.level);
      } catch (err) {
        setError(err as any);
      }
    };
    init();
    fetchLeaderboard(); // Pre-fetch leaderboard so it's ready when CAM 2A is clicked
  }, []);

  const getBackgroundImage = () => {
    switch (activeCam) {
      case "1A": return "/bg.png";
      case "1B": return "/bg2.webp";
      case "2A": return "/bg3.webp";
      default: return "/first.jpg";
    }
  };

  const maxScore = leaderboard[0]?.score || 1;

  return (
    <div style={{ position: "relative", minHeight: "100vh", backgroundColor: "#000", overflow: "hidden" }}>
      <style>{`
        @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0; } 100% { opacity: 1; } }
        .fnaf-cam-btn {
          border: 2px solid white;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 8px 12px;
          font-family: 'Courier New', monospace;
          font-weight: bold;
          cursor: pointer;
          transition: 0.2s;
        }
        .fnaf-cam-btn:hover { background: rgba(255, 255, 255, 0.2); }
        .fnaf-cam-active { background: #cc8888 !important; color: black; border-color: #cc8888; }

        /* Custom scrollbar for leaderboard terminal */
        .terminal-scroll::-webkit-scrollbar { width: 8px; }
        .terminal-scroll::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.5); border-left: 1px dashed #444; }
        .terminal-scroll::-webkit-scrollbar-thumb { background: #555; }
        .terminal-scroll::-webkit-scrollbar-thumb:hover { background: red; }
      `}</style>

      {/* === CRT STATIC & SCANLINE OVERLAY === */}
      <div
        style={{
          position: "fixed",
          top: 0, left: 0, width: "100%", height: "100%",
          background: "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))",
          backgroundSize: "100% 4px, 3px 100%",
          zIndex: 10,
          pointerEvents: "none",
        }}
      />

      {/* === BACKGROUND IMAGE === */}
      <img
        key={activeCam}
        src={getBackgroundImage()}
        alt={`Camera ${activeCam} view`}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
          filter: "grayscale(30%) contrast(120%) brightness(0.8)",
        }}
      />

      {/* === MAIN CONTENT WRAPPER === */}
      <div style={{ position: "relative", zIndex: 5 }}>
        <audio ref={audioRef} src="/crypt.mp3" onEnded={handleAudioEnded} preload="auto" />

        {/* === INTERACTION BLOCKER === */}
        {isLocked && (
          <div
            style={{
              position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
              zIndex: 999999, cursor: "wait",
            }}
          />
        )}

        <FnafUI level={currentLevel} timeStr={timeStr} />

        {/* === FNAF MAP NAVIGATION === */}
        <div style={{ position: "fixed", right: "3rem", top: "50%", transform: "translateY(-50%)", zIndex: 50, width: "320px" }}>
          <h2 style={{ fontFamily: "'Courier New', monospace", color: "white", textAlign: "right", borderBottom: "1px solid white", paddingBottom: "10px", marginBottom: "20px" }}>
            Crypt Cove
          </h2>
          <div style={{ position: "relative", height: "300px", border: "1px dashed rgba(255,255,255,0.3)" }}>
            <div style={{ position: "absolute", borderTop: "2px solid white", width: "100px", top: "70px", left: "110px" }} />
            <div style={{ position: "absolute", borderLeft: "2px solid white", height: "100px", top: "70px", left: "160px" }} />
            <div style={{ position: "absolute", borderBottom: "2px solid white", width: "80px", top: "170px", left: "80px" }} />

            <div
              onClick={() => setActiveCam("1A")}
              className={`fnaf-cam-btn ${activeCam === "1A" ? "fnaf-cam-active" : ""}`}
              style={{ position: "absolute", top: "50px", left: "20px" }}
            >
              CAM 1A<br/><span style={{fontSize:"0.6rem"}}>HOME</span>
            </div>

            <div
              onClick={() => setActiveCam("1B")}
              className={`fnaf-cam-btn ${activeCam === "1B" ? "fnaf-cam-active" : ""}`}
              style={{ position: "absolute", top: "50px", right: "20px" }}
            >
              CAM 1B<br/><span style={{fontSize:"0.6rem"}}>DOCS</span>
            </div>

            <div
              onClick={() => setActiveCam("2A")}
              className={`fnaf-cam-btn ${activeCam === "2A" ? "fnaf-cam-active" : ""}`}
              style={{ position: "absolute", top: "150px", right: "50px" }}
            >
              CAM 2A<br/><span style={{fontSize:"0.6rem"}}>RANKS</span>
            </div>

            <div
              onClick={logout}
              className="fnaf-cam-btn"
              style={{ position: "absolute", bottom: "30px", left: "30px", borderColor: "red", color: "red" }}
            >
              CAM 00<br/><span style={{fontSize:"0.6rem"}}>EXIT</span>
            </div>

            <div style={{ position: "absolute", bottom: "10px", right: "10px", fontFamily: "monospace", color: "white", fontSize: "0.8rem", border: "1px solid white", padding: "4px" }}>
              YOU
            </div>
          </div>
        </div>

        {/* === CENTRAL TERMINAL CONTENT === */}
        <div
          id="dash"
          style={{
            padding: "8rem 4rem",
            display: "flex",
            flexDirection: "column",
            gap: "2rem",
            maxWidth: "60%",
          }}
        >
          {/* TAB 1A: AGENT PROFILE */}
          {activeCam === "1A" && (
            <div style={{ background: "rgba(20, 0, 0, 0.8)", border: "2px solid #333", borderLeft: "4px solid rgb(255, 0, 0)", padding: "1.5rem", fontFamily: "'Courier New', monospace", animation: "blink 0.1s 2" }}>
              <div style={{ color: "rgb(255, 0, 0)", marginBottom: "1rem", letterSpacing: "0.2em", fontSize: "0.8rem" }}>
                &gt; SYSTEM.LOG_AGENT_DATA...
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  {error ? (
                    <p style={{ color: "red" }}>ERR: CRITICAL FAILURE</p>
                  ) : session ? (
                    <>
                      <p style={{ color: "gray", margin: 0, fontSize: "0.8rem" }}>SUBJECT:</p>
                      <h1 style={{ color: "white", fontSize: "2rem", margin: "0 0 1rem 0", textTransform: "uppercase" }}>
                        {session.user?.name || "UNKNOWN_ENTITY"}
                      </h1>

                      {code ? (
                        <p style={{ color: "white" }}>UNIT DEPLOYMENT: <span style={{ color: "rgb(255, 0, 0)" }}>[{schoolName || "FETCHING..."}]</span></p>
                      ) : (
                        <div style={{ display: "flex", gap: "10px" }}>
                          <input
                            type="text"
                            placeholder="ENTER SECURITY OVERRIDE (CODE)"
                            value={inputCode}
                            onChange={(e) => setInputCode(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && verifySchoolCode()}
                            style={{ background: "transparent", border: "1px solid rgb(255, 0, 0)", color: "rgb(255, 0, 0)", padding: "5px 10px", fontFamily: "monospace", outline: "none" }}
                          />
                          <button onClick={verifySchoolCode} style={{ background: "rgb(255, 0, 0)", color: "black", border: "none", padding: "5px 15px", cursor: "pointer", fontWeight: "bold", fontFamily: "monospace" }}>
                            AUTH
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <p style={{ color: "white" }}>AWAITING SIGNAL...</p>
                  )}
                </div>

                <div style={{ filter: "sepia(100%) hue-rotate(270deg) saturate(100%)", opacity: 0.8, border: "2px solid #333" }}>
                  <Image src={db} alt="Agent" width={100} height={100} />
                </div>
              </div>
            </div>
          )}

          {/* TAB 1B: MISSION CONTROL & TEAM */}
          {activeCam === "1B" && (
            <div style={{ display: "flex", gap: "2rem", animation: "blink 0.1s 2" }}>
              <div style={{ flex: 1, background: "rgba(0,0,0,0.7)", border: "1px solid #555", padding: "1.5rem", position: "relative" }}>
                <div style={{ color: "white", fontFamily: "monospace", fontSize: "1.5rem", marginBottom: "1rem" }}>
                  IT'S ME...
                </div>
                <p style={{ color: "gray", fontFamily: "monospace", marginBottom: "1.5rem" }}>Initiate sequence and survive the night.</p>

                <button
                  onClick={fetchAndShowQuestion}
                  disabled={loading || !code}
                  style={{
                    width: "100%",
                    padding: "1rem",
                    background: code ? "darkred" : "#222",
                    color: code ? "white" : "#555",
                    border: "2px solid",
                    borderColor: code ? "red" : "#555",
                    fontFamily: "'Courier New', monospace",
                    fontSize: "1.2rem",
                    fontWeight: "bold",
                    cursor: code ? "pointer" : "not-allowed",
                    boxShadow: code ? "0 0 15px red" : "none",
                    transition: "0.3s"
                  }}
                  title={!code ? "Require security override first." : undefined}
                >
                  {loading ? "INITIALIZING..." : "> CHECK CAMERAS <"}
                </button>
              </div>

              <div style={{ flex: 1, background: "rgba(0,0,0,0.7)", border: "1px dashed #555", padding: "1.5rem", fontFamily: "monospace", color: "white" }}>
                <h3 style={{ borderBottom: "1px solid #333", paddingBottom: "0.5rem", marginBottom: "1rem", color: "#888" }}>
                  ACTIVE ANIMATRONICS (TEAM)
                </h3>
                <ul className="terminal-scroll" style={{ listStyle: "none", padding: 0, margin: 0, maxHeight: "150px", overflowY: "auto" }}>
                  {teamMembers.length > 0 ? (
                    teamMembers.map((user, idx) => (
                      <li key={idx} style={{ padding: "0.5rem 0", color: "#ccc", borderBottom: "1px solid #222" }}>
                        &gt; {user.name || user.email || "UNKNOWN"}
                      </li>
                    ))
                  ) : (
                    <li style={{ color: "red", opacity: 0.6 }}>NO MOVEMENT DETECTED.</li>
                  )}
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2A: LEADERBOARD OVERRIDE */}
          {activeCam === "2A" && (
            <div style={{ background: "rgba(0,0,0,0.85)", border: "2px solid #444", padding: "2rem", color: "white", fontFamily: "'Courier New', monospace", animation: "blink 0.1s 2" }}>
              {/* Leaderboard Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed #555", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
                <div>
                  <h2 style={{ color: "red", margin: 0, textShadow: "0 0 5px red", letterSpacing: "2px" }}>CAM 2A: ACTIVITY LOG (RANKS)</h2>
                  <div style={{ fontSize: "0.75rem", color: "gray", marginTop: "5px" }}>
                    &gt; SIGNAL LAST RECEIVED: {lastUpdated || "AWAITING SYNC..."}
                  </div>
                </div>
                <button
                  onClick={refreshLeaderboard}
                  disabled={refreshing}
                  style={{
                    background: refreshing ? "#222" : "transparent",
                    color: refreshing ? "gray" : "white",
                    border: "1px solid",
                    borderColor: refreshing ? "gray" : "white",
                    padding: "8px 12px",
                    fontFamily: "monospace",
                    cursor: refreshing ? "not-allowed" : "pointer",
                  }}
                >
                  {refreshing ? "PINGING SERVER..." : "[ REFRESH FEED ]"}
                </button>
              </div>

              {/* Leaderboard Body */}
              <div className="terminal-scroll" style={{ maxHeight: "450px", overflowY: "auto", paddingRight: "10px" }}>
                {/* Table Header Row */}
                <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 100px 120px", color: "red", fontWeight: "bold", borderBottom: "1px solid #333", paddingBottom: "8px", marginBottom: "10px", fontSize: "0.85rem" }}>
                  <div>POS</div>
                  <div>ENTITY_ID (TEAM)</div>
                  <div style={{ textAlign: "right" }}>AGGR_LVL</div>
                  <div style={{ textAlign: "center" }}>PROGRESS</div>
                </div>

                {/* Rows */}
                {leaderboard.length > 0 ? (
                  leaderboard.map((entry, index) => {
                    const pct = (entry.score / maxScore) * 100;
                    const isTop = index < 3;

                    return (
                      <div
                        key={entry.team + index}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "60px 1fr 100px 120px",
                          padding: "12px 0",
                          borderBottom: "1px solid #222",
                          alignItems: "center",
                          background: isTop ? "rgba(255, 0, 0, 0.05)" : "transparent",
                        }}
                      >
                        {/* Rank */}
                        <div style={{ color: isTop ? "red" : "gray", fontWeight: "bold", textShadow: isTop ? "0 0 5px red" : "none" }}>
                          {isTop ? MEDALS[index] : `#${entry.rank}`}
                        </div>

                        {/* Team Name */}
                        <div style={{ color: isTop ? "white" : "#aaa", letterSpacing: "1px" }}>
                          {entry.team}
                        </div>

                        {/* Score */}
                        <div style={{ textAlign: "right", color: "white" }}>
                          {entry.score} pts
                        </div>

                        {/* Battery/Progress Bar Visual */}
                        <div style={{ paddingLeft: "20px" }}>
                          <div style={{ height: "10px", width: "100%", background: "#111", border: "1px solid #444", position: "relative" }}>
                            <div
                              style={{
                                height: "100%",
                                width: `${pct}%`,
                                background: index === 0 ? "red" : index === 1 ? "darkgray" : index === 2 ? "#cd7f32" : "#555",
                                boxShadow: index === 0 ? "0 0 8px red" : "none",
                                transition: "width 1s ease",
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ padding: "3rem", textAlign: "center", color: "gray", letterSpacing: "2px" }}>
                    NO DATA. CAM FEED EMPTY.
                  </div>
                )}
              </div>
            </div>
          )}

          {showPopup && questionData && (
            <QuestionPopup
              questionText={questionData.question}
              img={questionData.img}
              open={showPopup}
              onClose={() => setShowPopup(false)}
              onNextLevel={async (nextLevel: number) => {
                setCurrentLevel(nextLevel);
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
