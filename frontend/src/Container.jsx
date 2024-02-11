import React, {useContext, useEffect} from "react";
import { ScreenContext } from "./Screen";

export default function Container({ children, visible, color }) {
  const {transitionTime} = useContext(ScreenContext);

  return (
    <div
      style={{
        backdropFilter: "blur(7px)",
        padding: "20px",
        position: "fixed",
        transition: `right ${transitionTime}ms`,
        textAlign: "center",
        backgroundImage: `linear-gradient(
          to right,
          ${color.substring(0, 7)}00,
          ${color} 25%,
          ${color} 75%,
          ${color.substring(0, 7)}00 100%
        )`,
        width: "295vw",
        height: "100vh",
        right: visible ? "-100vw" : "295vw"
      }}
    >
      <div style={{width: '100vw', left: '100vw', position: 'relative'}}>
        {children}
      </div>

    </div>
  );
}
