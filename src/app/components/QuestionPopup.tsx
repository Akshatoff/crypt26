"use client";

import React, { useState, useEffect } from "react";
import Modal from "@mui/material/Modal";

export default function QuestionPopup({
  questionText,
  img,
  open,
  onClose,
  onNextLevel,
  level,
}: {
  questionText: string;
  img?: string;
  open: boolean;
  onClose: () => void;
  onNextLevel: (nextLevel: number) => void;
  level: number;
}) {
  const [solved, setSolved] = useState(false);
  const [inputAnswer, setInputAnswer] = useState("");
  const [nextLevel, setNextLevel] = useState<number | null>(null);
  const [status, setStatus] = useState<"idle" | "checking" | "correct" | "wrong">("idle");
  const [attempts, setAttempts] = useState(0);
  const [shake, setShake] = useState(false);

  // Reset when level changes
  useEffect(() => {
    setSolved(false);
    setInputAnswer("");
    setNextLevel(null);
    setStatus("idle");
    setAttempts(0);
  }, [level]);

  const checkAnswer = async () => {
    if (!inputAnswer.trim() || status === "checking") return;
    setStatus("checking");

    const res = await fetch("/checkAnswer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answer: inputAnswer }),
    });

    const data = await res.json();

    if (data.success) {
      setStatus("correct");
      setSolved(true);
      setNextLevel(data.nextLevel);
    } else {
      setStatus("wrong");
      setAttempts((a) => a + 1);
      setShake(true);
      setTimeout(() => { setShake(false); setStatus("idle"); }, 700);
    }
  };

  const goToNextLevel = () => {
    setSolved(false);
    setInputAnswer("");
    setStatus("idle");
    onClose();
    if (nextLevel !== null) onNextLevel(nextLevel);
  };

  const statusColor = {
    idle: "var(--text-dim)",
    checking: "var(--amber)",
    correct: "var(--accent)",
    wrong: "var(--red)",
  }[status];

  const statusMsg = {
    idle: `LEVEL_${String(level).padStart(2, "0")} // AWAITING INPUT`,
    checking: "VERIFYING ANSWER...",
    correct: "✓ ACCESS GRANTED — PROCEEDING TO NEXT LEVEL",
    wrong: `✗ INCORRECT — ATTEMPT #${attempts} LOGGED`,
  }[status];

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="question-title"
      sx={{ backdropFilter: "blur(4px)" }}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(860px, 95vw)",
          maxHeight: "90vh",
          background: "var(--bg)",
          border: "1px solid var(--border)",
          outline: "none",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 0 60px rgba(0,0,0,0.9), 0 0 30px rgba(0,255,65,0.1)",
          animation: shake ? "shake 0.5s ease" : "none",
        }}
      >
        {/* Modal top bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0.5rem 1rem",
            background: "var(--surface2)",
            borderBottom: "1px solid var(--border)",
            fontFamily: "var(--font-mono)",
            fontSize: "0.6rem",
            letterSpacing: "0.15em",
            flexShrink: 0,
          }}
        >
          <span style={{ color: statusColor, transition: "color 300ms" }}>{statusMsg}</span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "1px solid var(--border)",
              color: "var(--text-dim)",
              padding: "0.2rem 0.6rem",
              fontSize: "0.7rem",
              fontFamily: "var(--font-mono)",
              cursor: "pointer",
              letterSpacing: "0.1em",
            }}
          >
            [X] CLOSE
          </button>
        </div>

        {/* Top accent line */}
        <div
          style={{
            height: "2px",
            background: solved
              ? "linear-gradient(90deg, transparent, var(--accent), transparent)"
              : status === "wrong"
              ? "linear-gradient(90deg, transparent, var(--red), transparent)"
              : "linear-gradient(90deg, transparent, var(--border-bright), transparent)",
            opacity: 0.6,
            flexShrink: 0,
          }}
        />

        {/* Content area */}
        <div
          style={{
            display: "flex",
            gap: "2rem",
            padding: "1.5rem 2rem",
            overflowY: "auto",
            flex: 1,
          }}
        >
          {/* Image panel */}
          {img && (
            <div
              style={{
                flexShrink: 0,
                width: "280px",
                border: "1px solid var(--border)",
                overflow: "hidden",
                alignSelf: "flex-start",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.55rem",
                  color: "var(--text-dim)",
                  letterSpacing: "0.15em",
                  padding: "0.3rem 0.6rem",
                  background: "var(--surface2)",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                // ATTACHMENT
              </div>
              <img src={img} alt="Clue" style={{ width: "100%", display: "block", borderRadius: 0 }} />
            </div>
          )}

          {/* Input panel */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "1.25rem",
              minWidth: 0,
            }}
          >
            {/* Level badge */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  color: "var(--text-bright)",
                  background: "var(--accent-dim)",
                  border: "1px solid var(--accent)",
                  padding: "0.2rem 0.6rem",
                  letterSpacing: "0.15em",
                }}
              >
                LVL {String(level).padStart(2, "0")}
              </div>
              <div
                style={{
                  height: "1px",
                  flex: 1,
                  background: "linear-gradient(90deg, var(--border), transparent)",
                }}
              />
            </div>

            {/* Question text */}
            <div
              id="question-title"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.85rem",
                color: "var(--text-dim)",
                lineHeight: 1.8,
                background: "var(--surface)",
                border: "1px solid var(--border)",
                padding: "1rem",
                whiteSpace: "pre-wrap",
                position: "relative",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.55rem",
                  color: "var(--text-dim)",
                  letterSpacing: "0.2em",
                  marginBottom: "0.75rem",
                  opacity: 0.6,
                }}
              >
                // ENCRYPTED_MESSAGE
              </div>
              {questionText}
            </div>

            {/* Answer input */}
            {!solved ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.65rem",
                    color: "var(--text-dim)",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                  }}
                >
                  SUBMIT_FLAG
                </div>
                <div style={{ display: "flex", gap: "0.75rem", alignItems: "stretch" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      flex: 1,
                      border: "1px solid",
                      borderColor: status === "wrong" ? "var(--red)" : "var(--border)",
                      background: "var(--surface)",
                      transition: "border-color 300ms",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.9rem",
                        color: "var(--accent-dim)",
                        padding: "0 0.75rem",
                        flexShrink: 0,
                      }}
                    >
                      &gt;
                    </span>
                    <input
                      value={inputAnswer}
                      onChange={(e) => setInputAnswer(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && checkAnswer()}
                      placeholder="TYPE YOUR ANSWER..."
                      style={{
                        flex: 1,
                        border: "none",
                        background: "transparent",
                        padding: "0.75rem 0.5rem 0.75rem 0",
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.9rem",
                        color: "var(--text-bright)",
                        caretColor: "var(--accent)",
                      }}
                    />
                  </div>
                  <button
                    onClick={checkAnswer}
                    disabled={status === "checking"}
                    style={{
                      background: "var(--accent-dim)",
                      border: "1px solid var(--accent)",
                      color: "var(--text-bright)",
                      fontFamily: "var(--font-display)",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      letterSpacing: "0.15em",
                      padding: "0 1.5rem",
                      cursor: status === "checking" ? "not-allowed" : "pointer",
                      opacity: status === "checking" ? 0.6 : 1,
                      whiteSpace: "nowrap",
                      boxShadow: "var(--glow)",
                      transition: "all 200ms",
                    }}
                  >
                    {status === "checking" ? "..." : "SUBMIT"}
                  </button>
                </div>

                {attempts > 0 && status !== "checking" && (
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.65rem",
                      color: "var(--red)",
                      letterSpacing: "0.1em",
                      opacity: 0.7,
                    }}
                  >
                    {attempts} failed attempt{attempts !== 1 ? "s" : ""} recorded
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div
                  style={{
                    background: "rgba(0,255,65,0.05)",
                    border: "1px solid var(--accent)",
                    padding: "1rem",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.8rem",
                    color: "var(--text-bright)",
                    letterSpacing: "0.1em",
                    boxShadow: "var(--glow)",
                  }}
                >
                  ✓ CORRECT — LEVEL {level} CLEARED
                </div>
                <button
                  onClick={goToNextLevel}
                  style={{
                    background: "var(--accent-dim)",
                    border: "1px solid var(--accent)",
                    color: "var(--text-bright)",
                    fontFamily: "var(--font-display)",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    letterSpacing: "0.15em",
                    padding: "0.8rem 2rem",
                    cursor: "pointer",
                    boxShadow: "var(--glow-strong)",
                    alignSelf: "flex-start",
                  }}
                >
                  ▶ ADVANCE TO LEVEL {(nextLevel || level + 1).toString().padStart(2, "0")}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            padding: "0.4rem 1rem",
            background: "var(--surface2)",
            borderTop: "1px solid var(--border)",
            fontFamily: "var(--font-mono)",
            fontSize: "0.55rem",
            color: "var(--text-dim)",
            letterSpacing: "0.1em",
            display: "flex",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <span>PRESS [ENTER] TO SUBMIT</span>
          <span>BRUTE FORCE ATTEMPTS WILL RESULT IN DISQUALIFICATION</span>
        </div>

        <style>{`
          @keyframes shake {
            0%, 100% { transform: translate(-50%, -50%) translateX(0); }
            20% { transform: translate(-50%, -50%) translateX(-8px); }
            40% { transform: translate(-50%, -50%) translateX(8px); }
            60% { transform: translate(-50%, -50%) translateX(-5px); }
            80% { transform: translate(-50%, -50%) translateX(5px); }
          }
        `}</style>
      </div>
    </Modal>
  );
}
  