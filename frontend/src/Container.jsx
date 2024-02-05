import React, {useContext, useEffect} from "react";
import { ScreenContext } from "./Screen";

export default function Container({ children, visible, color }) {
  const {transitionTime} = useContext(ScreenContext);

  return (
    <div
      style={{
        backdropFilter: "blur(5px)",
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
        width: "300vw",
        height: "100vh",
        right: visible ? "-100vw" : "300vw"
      }}
    >
      {children}
    </div>
  );
}
