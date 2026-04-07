"use client";

import { useState, useEffect } from "react";

export default function FullscreenOverlay() {
  const [showOverlay, setShowOverlay] = useState(true);

  useEffect(() => {
    // This function runs every time the fullscreen status changes
    const handleFullscreenChange = () => {
      // If there is no fullscreen element, it means we exited fullscreen
      if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
        setShowOverlay(true);
      } else {
        setShowOverlay(false);
      }
    };

    // Listen for the fullscreen change event (with vendor prefixes for Safari/Older browsers)
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);

    // Initial check just in case they reload the page while already in fullscreen
    if (document.fullscreenElement) {
      setShowOverlay(false);
    }

    // Cleanup the event listeners when the component unmounts
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("msfullscreenchange", handleFullscreenChange);
    };
  }, []);

  const enterFullscreen = () => {
    const elem = document.documentElement;

    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch((err) => console.log(err));
    } else if ((elem as any).webkitRequestFullscreen) {
      (elem as any).webkitRequestFullscreen();
    } else if ((elem as any).msRequestFullscreen) {
      (elem as any).msRequestFullscreen();
    }

    // Immediately hide the overlay on click for a snappy response
    setShowOverlay(false);
  };

  if (!showOverlay) return null;

  return (
    <button
      onClick={enterFullscreen}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 9999,
        opacity: 0,
        cursor: "pointer",
        border: "none",
        background: "transparent",
      }}
      aria-label="Click to enter fullscreen"
    />
  );
}