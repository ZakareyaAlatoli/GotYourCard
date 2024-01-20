import React from "react";
import { screenTransitionTimeMs } from "./AppConstants";

export default function Container({ children, position, color }) {
  return (
    <div
      style={{
        padding: "20px",
        position: "fixed",
        transition: `right ${screenTransitionTimeMs}ms`,
        textAlign: "center",
        backgroundImage: `linear-gradient(
          to right,
          ${color.substring(0, 7)}00,
          ${color} 25%,
          ${color} 75%,
          ${color.substring(0, 7)}00 100%
        )`,
        width: "300vw",
        height: "100vh",
        right:
          position === "left"
            ? "200vw"
            : position === "center"
            ? "-100vw"
            : "-300vw",
      }}
    >
      {children}
    </div>
  );
}
