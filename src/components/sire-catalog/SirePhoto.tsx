import { getInitials } from "@/lib/genotype";

interface SirePhotoProps {
  photoUrl?: string | null;
  sireName: string;
  accentColor: string;
  className?: string;
}

export function SirePhoto({ photoUrl, sireName, accentColor, className }: SirePhotoProps) {
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={sireName}
        className={className ?? "w-full h-full object-cover"}
        loading="lazy"
      />
    );
  }

  // Placeholder gradient with breeder color + initials watermark
  return (
    <div
      className={className ?? "w-full h-full flex items-center justify-center"}
      style={{
        background: `linear-gradient(135deg, ${accentColor}, ${accentColor}aa 60%, hsl(var(--muted)))`,
      }}
    >
      <span className="font-serif text-5xl font-bold text-white/40 select-none tracking-wider">
        {getInitials(sireName)}
      </span>
    </div>
  );
}
