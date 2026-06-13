import { motion } from "framer-motion";

interface ResultRibbonProps {
  placing: string;
}

function tierLabel(placing: string): string {
  const p = placing.trim();
  // Cap length gracefully
  if (p.length <= 28) return p;
  return p.slice(0, 26).trim() + "…";
}

export function ResultRibbon({ placing }: ResultRibbonProps) {
  if (!placing) return null;
  // Suppress ribbon for Reserve Grand Champion (overlay was too heavy on these photos)
  if (/reserve\s*grand\s*champ/i.test(placing)) return null;
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="absolute top-3 left-0 z-10 pointer-events-none select-none"
      style={{
        maxWidth: "75%",
        backgroundColor: "#C9A84C",
        color: "#0A1628",
        paddingLeft: 12,
        paddingRight: 18,
        paddingTop: 5,
        paddingBottom: 5,
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        boxShadow: "0 2px 6px rgba(10,22,40,0.18)",
        // Notched ribbon shape on the right edge
        clipPath: "polygon(0 0, 100% 0, calc(100% - 8px) 50%, 100% 100%, 0 100%)",
      }}
    >
      {tierLabel(placing)}
    </motion.div>
  );
}
