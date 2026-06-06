import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  sireName: string;
  price?: number | null;
  breederName?: string;
}

export function SemenBookingSection({ sireName, price, breederName }: Props) {
  const [date, setDate] = useState<Date | undefined>(undefined);

  const handleOrder = () => {
    if (!date) {
      toast.error("Pick a collection date first.");
      return;
    }
    toast.success(`Order request sent for ${sireName} (${date.toLocaleDateString()})`);
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 mt-4">
      <h3 className="text-base font-bold text-[#1A1A2E] mb-1">Book Semen</h3>
      <p className="text-xs text-gray-500 mb-3">
        Pick an available collection date. {breederName ? `${breederName} ` : "The breeder "}
        will confirm by email.
      </p>

      <div className="flex justify-center mb-3">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
          initialFocus
          className={cn("p-2 pointer-events-auto rounded-md border border-gray-200")}
        />
      </div>

      {price != null && (
        <p className="text-sm text-gray-700 mb-3">
          <span className="font-semibold text-[#1A7A3A]">${Number(price).toFixed(0)}</span>{" "}
          <span className="text-gray-500">per unit</span>
        </p>
      )}

      <div className="flex gap-2">
        <Button
          onClick={handleOrder}
          className="flex-1 bg-[#1A7A3A] hover:bg-[#15662f] text-white font-semibold"
        >
          Order Semen
        </Button>
        <Button
          variant="outline"
          className="flex-1 border-gray-300"
          onClick={() => toast.message(`Contacting ${breederName || "breeder"}…`)}
        >
          Contact Breeder
        </Button>
      </div>
    </div>
  );
}
