import { useEffect, useRef } from "react";
import rough from "roughjs";

interface HandDrawnButtonProps {
  type?: "button" | "submit";
  label: string;
  width?: number; // New prop
  height?: number; // New prop
  color?: string;
  fillColor?: string;
  iconImg?: React.ReactNode;
  actionBtn?: () => void;
  seed?: number; // Good for keeping shapes stable
}

export function HandDrawnButton({
  type = "button",
  label,
  width = 220, // Default value
  height = 60, // Default value
  color = "#4a4a4a",
  fillColor,
  iconImg,
  actionBtn,
  seed = 42,
}: HandDrawnButtonProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const rc = rough.canvas(canvasRef.current);
      const ctx = canvasRef.current.getContext("2d");
      ctx?.clearRect(0, 0, width, height);

      rc.rectangle(5, 5, width - 10, height - 10, {
        roughness: 1.5,
        stroke: color,
        strokeWidth: 2,
        fill: fillColor,
        fillStyle: "solid",
        seed: seed,
      });
    }
  }, [width, height, color, fillColor, seed]);

  return (
    <button
      type={type}
      onClick={actionBtn}
      className="rough-button-container"
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="rough-button-canvas"
      />
      <div className="rough-button-content">
        <span className="rough-button-text">{label}</span>
        {iconImg && <span className="rough-button-icon">{iconImg}</span>}
      </div>
    </button>
  );
}
