import { useEffect, useRef, useState } from "react";

interface ClampedTextProps {
  text: string;
  lines?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Facebook-style multi-line clamp with an inline "more"/"less" toggle.
 * Renders the full text but visually clamps it; only shows the toggle when
 * the content actually overflows.
 */
export function ClampedText({ text, lines = 4, className, style }: ClampedTextProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [overflows, setOverflows] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Detect overflow by measuring clamped vs unclamped scrollHeight
    setOverflows(el.scrollHeight > el.clientHeight + 1);
  }, [text, lines]);

  const clampStyle: React.CSSProperties = expanded
    ? {}
    : {
        display: "-webkit-box",
        WebkitLineClamp: lines,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
      };

  return (
    <div>
      <p
        ref={ref}
        className={className}
        style={{ ...style, ...clampStyle, whiteSpace: "pre-wrap", wordBreak: "break-word" }}
      >
        {text}
      </p>
      {overflows && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-0.5 text-[12px] font-semibold"
          style={{ color: "#6B7280" }}
        >
          {expanded ? "less" : "… more"}
        </button>
      )}
    </div>
  );
}
