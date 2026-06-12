import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { MessageCircle } from "lucide-react";

interface CommentSheetProps {
  postId: string;
  open: boolean;
  onClose: () => void;
  commentCount: number;
}

export function CommentSheet({ open, onClose, commentCount }: CommentSheetProps) {
  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="bottom" className="h-[70vh] rounded-t-2xl p-0 flex flex-col">
        <SheetHeader className="px-4 py-3 border-b border-[#E5E7EB]">
          <SheetTitle className="text-[16px] font-bold text-[#0A1628]">
            {commentCount} {commentCount === 1 ? "Comment" : "Comments"}
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <MessageCircle className="w-10 h-10 text-[#C9A84C] mb-3" />
          <p className="text-[15px] font-semibold text-[#0A1628]">Comments coming soon</p>
          <p className="text-[13px] text-[#6B7280] mt-1">
            Join the conversation when this rolls out.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
