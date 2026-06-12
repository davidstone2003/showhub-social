import { ChevronLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface BackButtonProps {
  /** If true, prompt to discard unsaved changes before navigating away. */
  hasUnsavedChanges?: boolean;
  /** Fallback route if there is no history. Defaults to "/". */
  fallback?: string;
  /** Optional override click handler. */
  onClick?: () => void;
  className?: string;
  label?: string;
}

export function BackButton({
  hasUnsavedChanges = false,
  fallback = "/",
  onClick,
  className = "",
  label = "Back",
}: BackButtonProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const doNavigate = () => {
    if (onClick) return onClick();
    // history length > 1 means we have somewhere to go back to in this tab
    if (window.history.length > 1 && location.key !== "default") {
      navigate(-1);
    } else {
      navigate(fallback);
    }
  };

  const handleClick = () => {
    if (hasUnsavedChanges) {
      setConfirmOpen(true);
    } else {
      doNavigate();
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        aria-label="Back"
        className={`flex items-center gap-1 -ml-1 px-2 py-1.5 rounded-lg text-foreground hover:bg-muted transition-colors ${className}`}
      >
        <ChevronLeft className="w-5 h-5" strokeWidth={2.25} />
        <span className="text-sm font-semibold">{label}</span>
      </button>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Discard your changes?</DialogTitle>
            <DialogDescription>
              You have unsaved changes that will be lost if you leave this screen.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 pt-2">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Continue Editing
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setConfirmOpen(false);
                doNavigate();
              }}
            >
              Discard Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
