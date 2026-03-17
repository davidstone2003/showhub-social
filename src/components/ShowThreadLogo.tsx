interface ShowThreadLogoProps {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  onDark?: boolean;
}

export function ShowThreadLogo({ size = "md", showTagline = true, onDark = true }: ShowThreadLogoProps) {
  const sizeClasses = {
    sm: "text-[20px]",
    md: "text-[26px]",
    lg: "text-[48px]",
  };

  const taglineSizes = {
    sm: "text-[9px]",
    md: "text-[11px]",
    lg: "text-[14px]",
  };

  const lineSizes = {
    sm: { height: 2, offsetY: "55%" },
    md: { height: 2, offsetY: "55%" },
    lg: { height: 3, offsetY: "55%" },
  };

  const lineConfig = lineSizes[size];

  return (
    <div className="shrink-0">
      <h1
        className={`${sizeClasses[size]} font-bold tracking-tight leading-none`}
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <span className={onDark ? "text-primary-foreground" : "text-[#0F172A]"}>
          Show
        </span>
        <span className="relative inline-block">
          <span className={onDark ? "text-primary-foreground" : "text-[#0F172A]"}>
            Thread
          </span>
          {/* Warm sand line weaving through "Thread" */}
          <svg
            className="absolute left-0 w-full pointer-events-none"
            style={{ top: lineConfig.offsetY }}
            height={lineConfig.height * 4}
            viewBox="0 0 100 12"
            preserveAspectRatio="none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 8 C10 2, 20 12, 30 6 S50 0, 60 6 S80 12, 90 4 L100 7"
              stroke="#E7D3A8"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.85"
            />
          </svg>
        </span>
      </h1>
      {showTagline && (
        <p
          className={`${taglineSizes[size]} leading-tight mt-0.5`}
          style={{
            color: "#E7D3A8",
            letterSpacing: "0.04em",
          }}
        >
          Where showmen and breeders connect, champions shine.
        </p>
      )}
    </div>
  );
}
