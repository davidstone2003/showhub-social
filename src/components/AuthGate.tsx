import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AuthGateProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthGate({ open, onOpenChange }: AuthGateProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm text-center">
        <DialogHeader className="items-center">
          <DialogTitle className="text-lg">Join to interact</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Create a free account to like, comment, and contact breeders.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 pt-2">
          <Button asChild>
            <Link to="/pricing">Join Free</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/auth">Already have an account? Log in</Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
