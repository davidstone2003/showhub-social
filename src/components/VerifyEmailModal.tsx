import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail, Send } from "lucide-react";

interface VerifyEmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResend: () => void;
}

export function VerifyEmailModal({ open, onOpenChange, onResend }: VerifyEmailModalProps) {
  const openEmailApp = () => {
    window.open("https://mail.google.com", "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm text-center">
        <DialogHeader className="items-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <Mail className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-lg">Verify your email to continue</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Please confirm your email to post and interact on Backdrop.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 pt-2">
          <Button onClick={onResend} variant="outline" className="gap-2">
            <Send className="w-4 h-4" />
            Resend Email
          </Button>
          <Button onClick={openEmailApp} className="gap-2">
            <Mail className="w-4 h-4" />
            Open Email App
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
