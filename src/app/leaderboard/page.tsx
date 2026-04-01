"use client";

import React, { useEffect, useState, useRef } from "react";
import Back from "../components/Back";

type Entry = { rank: number; team: string; score: number };

const MEDALS = ["◆", "◇", "○"];

export default function Page() {
  const [leaderboard, setLeaderboard] = useState<Entry[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [highlight, setHighlight] = useState<number | null>(null);

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

  useEffect(() => { fetchLeaderboard(); }, []);

  const maxScore = leaderboard[0]?.score || 1;

  return (
    <>
      <Back />
      <div
        style={{
          minHeight: "100vh",
          padding: "6rem 4rem 4rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "2rem",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", width: "100%", maxWidth: 900 }}>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.65rem",
              color: "var(--text-dim)",
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              marginBottom: "0.5rem",
            }}
          >
            CRYPT@TRIX // REAL-TIME
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2.5rem, 7vw, 5rem)",
              fontWeight: 900,
              color: "var(--text-bright)",
              textShadow: "var(--glow-strong)",
              letterSpacing: "0.1em",
              lineHeight: 1,
            }}
          >
            LEADERBOARD
          </h1>
        </div>

        {/* Controls */}
        <div
          style={{
            display: "flex",
            gap: "1.5rem",
            alignItems: "center",
            width: "100%",
            maxWidth: 900,
            fontFamily: "var(--font-mono)",
            fontSize: "0.65rem",
            color: "var(--text-dim)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
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
            LIVE_FEED
          </div>
          {lastUpdated && <span>LAST SYNC: {lastUpdated}</span>}
          <button
            onClick={refreshLeaderboard}
            disabled={refreshing}
            style={{
              marginLeft: "auto",
              fontFamily: "var(--font-mono)",
              fontSize: "0.65rem",
              letterSpacing: "0.15em",
              padding: "0.3rem 0.8rem",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              color: refreshing ? "var(--accent)" : "var(--text-dim)",
              cursor: refreshing ? "not-allowed" : "pointer",
              transition: "all 200ms",
            }}
          >
            {refreshing ? "SYNCING..." : "↻ REFRESH"}
          </button>
        </div>

        {/* Podium (top 3) */}
        {leaderboard.length >= 3 && (
          <div
            style={{
              display: "flex",
              gap: "1rem",
              alignItems: "flex-end",
              justifyContent: "center",
              width: "100%",
              maxWidth: 900,
              padding: "0 1rem",
            }}
          >
            {[leaderboard[1], leaderboard[0], leaderboard[2]].map((entry, i) => {
              const podiumRank = [2, 1, 3][i];
              const heights = ["140px", "180px", "120px"];
              const borderColors = ["#c0c0c0", "var(--accent)", "#cd7f32"];
              const glows = [
                "0 0 20px rgba(192,192,192,0.2)",
                "var(--glow-strong)",
                "0 0 20px rgba(205,127,50,0.2)",
              ];

              return (
                <div
                  key={entry.team}
                  style={{
                    flex: i === 1 ? "0 0 240px" : "0 0 180px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.65rem",
                      color: borderColors[i],
                      letterSpacing: "0.1em",
                    }}
                  >
                    {entry.score} pts
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: i === 1 ? "0.85rem" : "0.75rem",
                      fontWeight: 700,
                      color: "var(--text)",
                      textAlign: "center",
                      letterSpacing: "0.05em",
                      maxWidth: "90%",
                    }}
                  >
                    {entry.team}
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: heights[i],
                      background: "var(--surface)",
                      border: `1px solid ${borderColors[i]}`,
                      boxShadow: glows[i],
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.25rem",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: `linear-gradient(180deg, ${borderColors[i]}08, transparent)`,
                      }}
                    />
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: i === 1 ? "2.5rem" : "2rem",
                        fontWeight: 900,
                        color: borderColors[i],
                        textShadow: glows[i],
                        zIndex: 1,
                      }}
                    >
                      {MEDALS[podiumRank - 1]}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.65rem",
                        color: "var(--text-dim)",
                        letterSpacing: "0.15em",
                        zIndex: 1,
                      }}
                    >
                      #{podiumRank}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Full table */}
        <div
          style={{
            width: "100%",
            maxWidth: 900,
            border: "1px solid var(--border)",
            overflow: "hidden",
          }}
        >
          {/* Table header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "80px 1fr 120px 160px",
              padding: "0.6rem 1rem",
              background: "var(--surface2)",
              borderBottom: "1px solid var(--border-bright)",
              fontFamily: "var(--font-display)",
              fontSize: "0.65rem",
              fontWeight: 700,
              color: "var(--text-bright)",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            <span>RANK</span>
            <span>UNIT / TEAM</span>
            <span style={{ textAlign: "right" }}>SCORE</span>
            <span style={{ textAlign: "right" }}>PROGRESS</span>
          </div>

          {/* Rows */}
          {leaderboard.map((entry, index) => {
            const pct = (entry.score / maxScore) * 100;
            const isTop = index < 3;

            return (
              <div
                key={entry.team + index}
                style={{
                  display: "grid",
                  gridTemplateColumns: "80px 1fr 120px 160px",
                  padding: "0.7rem 1rem",
                  borderBottom: "1px solid var(--border)",
                  background: isTop ? "var(--surface)" : "transparent",
                  alignItems: "center",
                  transition: "background 150ms",
                  cursor: "default",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "var(--surface)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = isTop
                    ? "var(--surface)"
                    : "transparent";
                }}
              >
                {/* Rank */}
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    color:
                      index === 0
                        ? "var(--accent)"
                        : index === 1
                        ? "#c0c0c0"
                        : index === 2
                        ? "#cd7f32"
                        : "var(--text-dim)",
                    textShadow: index === 0 ? "var(--glow)" : "none",
                  }}
                >
                  {index < 3 ? MEDALS[index] : `#${entry.rank}`}
                </span>

                {/* Team */}
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.85rem",
                    color: isTop ? "var(--text)" : "var(--text-dim)",
                    letterSpacing: "0.02em",
                  }}
                >
                  {entry.team}
                </span>

                {/* Score */}
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.85rem",
                    color: isTop ? "var(--text-bright)" : "var(--text-dim)",
                    textAlign: "right",
                    fontWeight: index === 0 ? 700 : 400,
                    textShadow: index === 0 ? "var(--glow)" : "none",
                  }}
                >
                  {entry.score}
                </span>

                {/* Progress bar */}
                <div
                  style={{
                    paddingLeft: "1rem",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      height: 4,
                      background: "var(--surface2)",
                      border: "1px solid var(--border)",
                      borderRadius: 0,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${pct}%`,
                        height: "100%",
                        background:
                          index === 0
                            ? "var(--accent)"
                            : index === 1
                            ? "#c0c0c0"
                            : index === 2
                            ? "#cd7f32"
                            : "var(--border)",
                        boxShadow: index === 0 ? "var(--glow)" : "none",
                        transition: "width 600ms ease",
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}

          {leaderboard.length === 0 && (
            <div
              style={{
                padding: "3rem",
                textAlign: "center",
                fontFamily: "var(--font-mono)",
                fontSize: "0.8rem",
                color: "var(--text-dim)",
                letterSpacing: "0.15em",
              }}
            >
              NO ENTRIES FOUND — HUNT IN PROGRESS
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.2; } }
      `}</style>
    </>
  );
}
