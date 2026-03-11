import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import rough from "roughjs";

interface TextFieldProps {
  type?: string;
  typeOfElement?: "input" | "textarea";
  placeholder?: string;
  value: string | number;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  required?: boolean;
  className?: string;
  min?: string;
  width?: number;
  height?: number;
  color?: string;
  fillColor?: string;
  seed?: number;
}

export function TextField({
  typeOfElement = "input",
  type = "text",
  placeholder,
  value,
  onChange,
  required,
  min,
  className = "",
  width = 300,
  height = 45,
  color = "#bfa27c",
  fillColor = "#e4dec210",
  seed = 42,
}: TextFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (canvasRef.current) {
      const rc = rough.canvas(canvasRef.current);
      const ctx = canvasRef.current.getContext("2d");
      ctx?.clearRect(0, 0, width, height);

      if (isFocused) {
        // First line — outer wobble
        rc.rectangle(4, 4, width - 8, height - 8, {
          roughness: 2,
          stroke: "#c87840",
          strokeWidth: 2,
          fill: fillColor,
          fillStyle: "solid",
          seed: seed,
        });
        // Second line — inner wobble with a different seed so it wiggles differently
        rc.rectangle(7, 7, width - 14, height - 14, {
          roughness: 2,
          stroke: "#c87840",
          strokeWidth: 1.5,
          fill: "transparent",
          fillStyle: "solid",
          seed: seed + 11,
        });
      } else {
        rc.rectangle(5, 5, width - 10, height - 10, {
          roughness: 1.8,
          stroke: color,
          strokeWidth: 2,
          fill: fillColor,
          fillStyle: "solid",
          seed: seed,
        });
      }
    }
  }, [width, height, color, fillColor, seed, isFocused]);

  const sharedProps = {
    value,
    onChange,
    placeholder,
    required,
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
    className: `custom-textfield-inner ${className}`,
    style: {
      width: "100%",
      height: "100%",
      background: "transparent",
      border: "none",
      outline: "none",
      padding: "10px 15px",
      position: "absolute" as const,
      top: 0,
      left: 0,
      zIndex: 1,
    },
  };
  return (
    <div className="custom-textfield-wrapper" style={{ position: "relative", width, height, marginBottom: "10px" }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ position: "absolute", top: 0, left: 0 }}
      />
      {typeOfElement === "textarea" ? (
        <textarea
          {...sharedProps}
          style={{ ...sharedProps.style, resize: "none" }}
        />
      ) : (
        <input type={type} min={min} {...sharedProps} />
      )}
    </div>
  );
}

// ── RoughBox ───────────────────────────────────────────────────────────────────
// A general-purpose container that draws a rough.js rectangle border around
// whatever children you put inside it. The canvas is sized to match the
// container after layout, so it adapts to any content height automatically.
export function RoughBox({
  children,
  color = "#bfa27c",
  fillColor = "#e4dec210",
  seed = 42,
  padding = "1rem",
  className = "",
  style,
}: {
  children: React.ReactNode;
  color?: string;
  fillColor?: string;
  seed?: number;
  padding?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // useLayoutEffect runs synchronously after React updates the DOM but BEFORE
  // the browser paints. That means we can measure the container's final size
  // and draw on the canvas — all before the user sees anything.
  useLayoutEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const w = container.offsetWidth;
    const h = container.offsetHeight;
    canvas.width = w;
    canvas.height = h;

    const rc = rough.canvas(canvas);
    const ctx = canvas.getContext("2d");
    ctx?.clearRect(0, 0, w, h);

    rc.rectangle(5, 5, w - 10, h - 10, {
      roughness: 1.8,
      stroke: color,
      strokeWidth: 2,
      fill: fillColor,
      fillStyle: "solid",
      seed,
    });
  }, [color, fillColor, seed]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: "relative", ...style }}
    >
      <canvas
        ref={canvasRef}
        width={0}
        height={0}
        style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
      />
      <div style={{ position: "relative", zIndex: 1, padding }}>
        {children}
      </div>
    </div>
  );
}
