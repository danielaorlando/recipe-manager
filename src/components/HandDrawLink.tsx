import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import rough from "roughjs";

interface HandDrawnLinkProps {
  to: string;
  label: string;
  color?: string;
  iconImg?: React.ReactNode;
  fillColor?: string;
}

export function HandDrawnLink({
  to,
  label,
  color = "#4a4a4a",
  fillColor,
  iconImg,
}: HandDrawnLinkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const rc = rough.canvas(canvasRef.current);
      const { width, height } = canvasRef.current;

      // Clear canvas before redrawing
      const ctx = canvasRef.current.getContext("2d");
      ctx?.clearRect(0, 0, width, height);

      // Draw a sketchy rectangle as the button border
      rc.rectangle(5, 5, width - 10, height - 10, {
        roughness: 1.5,
        stroke: color,
        strokeWidth: 2,
        bowing: 2,
        fill: fillColor,
        fillStyle: "solid",
        fillWeight: 1.5,
        hachureGap: 4,
      });
    }
  }, [color, label, iconImg, fillColor]);

  return (
    <Link to={to} className="rough-button-container" style={{ width: "220px", height: "60px" }}>
      <canvas
        ref={canvasRef}
        width={220}
        height={60}
        className="rough-button-canvas"
      />
      <div className="rough-button-content">
        <span className="rough-button-text">{label}</span>
        {iconImg && <span className="rough-button-icon">{iconImg}</span>}
      </div>
    </Link>
  );
}
