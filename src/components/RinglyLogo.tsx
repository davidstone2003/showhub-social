interface RinglyLogoProps {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  onDark?: boolean;
}

export function RinglyLogo({ size = "md", showTagline = true, onDark = true }: RinglyLogoProps) {
  const sizeClasses = {
    sm: "text-[24px]",
    md: "text-[26px]",
    lg: "text-[48px]",
  };

  const taglineSizes = {
    sm: "text-[9px]",
    md: "text-[11px]",
    lg: "text-[14px]",
  };

  return (
    <div className="shrink-0">
      <h1
        className={`${sizeClasses[size]} font-bold tracking-tight leading-none`}
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <span className={onDark ? "text-primary-foreground" : "text-primary"}>
          Ringly
        </span>
      </h1>
      {showTagline && (
        <p
          className={`${taglineSizes[size]} leading-tight mt-0.5 text-sand`}
          style={{ letterSpacing: "0.04em" }}
        >
          Where showmen and breeders connect, champions shine.
        </p>
      )}
    </div>
  );
}
