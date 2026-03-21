import { Phone, MessageSquare, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BreederContactProps {
  tier: string;
  phone?: string | null;
  email?: string;
}

export function BreederContact({ tier, phone, email }: BreederContactProps) {
  const hasPaidContact = tier === "contacted" || tier === "featured" || tier === "breeder_page";

  if (!hasPaidContact) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 text-center">
        <p className="text-sm text-muted-foreground">Contact not available</p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {phone && (
        <>
          <Button variant="default" size="sm" asChild>
            <a href={`tel:${phone}`}><Phone className="w-3.5 h-3.5 mr-1" /> Call</a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href={`sms:${phone}`}><MessageSquare className="w-3.5 h-3.5 mr-1" /> Text</a>
          </Button>
        </>
      )}
      {email && (
        <Button variant="outline" size="sm" asChild>
          <a href={`mailto:${email}`}><Mail className="w-3.5 h-3.5 mr-1" /> Email</a>
        </Button>
      )}
    </div>
  );
}
