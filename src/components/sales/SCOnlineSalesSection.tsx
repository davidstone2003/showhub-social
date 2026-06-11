import { useState } from "react";
import { Plus, X, Upload } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface TopSeller {
  photo?: string;
  lot: string;
  price: string;
  sire: string;
  breeder: string;
}

interface SCSale {
  id: string;
  saleName: string;
  date: string;
  totalHead: number;
  averagePrice: string;
  topSellers: TopSeller[];
}

const seedSales: SCSale[] = [
  {
    id: "sco-1",
    saleName: "SC Online Spring Classic",
    date: "April 12, 2026",
    totalHead: 64,
    averagePrice: "$3,275",
    topSellers: [
      {
        photo: "",
        lot: "Lot 7",
        price: "$11,500",
        sire: "Thank Me Later",
        breeder: "Stone Show Stock",
      },
      {
        photo: "",
        lot: "Lot 22",
        price: "$8,800",
        sire: "Spectacle",
        breeder: "Pine Creek",
      },
      {
        photo: "",
        lot: "Lot 41",
        price: "$7,400",
        sire: "Monopoly",
        breeder: "H&T Showstock",
      },
    ],
  },
];

export function SCOnlineSalesSection() {
  const [sales, setSales] = useState<SCSale[]>(seedSales);
  const [addOpen, setAddOpen] = useState(false);
  const [detail, setDetail] = useState<{ sale: SCSale; seller: TopSeller } | null>(null);

  return (
    <div className="px-4 pt-6">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-[15px] font-bold text-foreground">SC Online Sales</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">Completed sale results</p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-1.5 rounded-full bg-foreground text-background px-3 py-1.5 text-[12px] font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Results
        </button>
      </div>

      <div className="space-y-3">
        {sales.map((sale) => (
          <SCSaleCard key={sale.id} sale={sale} onSellerClick={(s) => setDetail({ sale, seller: s })} />
        ))}
      </div>

      <AddResultsDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSave={(s) => {
          setSales((prev) => [s, ...prev]);
          setAddOpen(false);
        }}
      />

      <Sheet open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          {detail && (
            <>
              <SheetTitle>{detail.seller.lot}</SheetTitle>
              <SheetDescription>{detail.sale.saleName} · {detail.sale.date}</SheetDescription>
              <div className="mt-4 space-y-3">
                {detail.seller.photo ? (
                  <img
                    src={detail.seller.photo}
                    alt={detail.seller.lot}
                    className="w-full aspect-[4/3] object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full aspect-[4/3] rounded-xl bg-muted flex items-center justify-center text-muted-foreground text-sm">
                    No photo
                  </div>
                )}
                <DetailRow label="Price" value={detail.seller.price} accent />
                <DetailRow label="Sire" value={detail.seller.sire} />
                <DetailRow label="Breeder" value={detail.seller.breeder} />
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function DetailRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[hsl(var(--divider-soft))]">
      <span className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className={`text-[14px] font-bold tabular-nums ${accent ? "text-[hsl(var(--gold))]" : "text-foreground"}`}>
        {value}
      </span>
    </div>
  );
}

function SCSaleCard({ sale, onSellerClick }: { sale: SCSale; onSellerClick: (s: TopSeller) => void }) {
  return (
    <div className="rounded-xl bg-card border border-border shadow-[var(--shadow-card)] p-4">
      <h3 className="text-[16px] font-bold text-foreground leading-snug">{sale.saleName}</h3>
      <p className="text-[12px] text-muted-foreground mt-0.5">{sale.date}</p>

      {/* Two key stats */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Stat label="Total Head Sold" value={String(sale.totalHead)} />
        <Stat label="Average Price" value={sale.averagePrice} />
      </div>

      {/* Top 3 sellers */}
      <div className="mt-4">
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Top Sellers</p>
        <div className="flex gap-3 overflow-x-auto -mx-1 px-1 pb-1 snap-x snap-mandatory">
          {sale.topSellers.map((s, i) => (
            <button
              key={i}
              onClick={() => onSellerClick(s)}
              className="snap-start shrink-0 w-[140px] text-left rounded-lg border border-border bg-background overflow-hidden active:scale-[0.98] transition-transform"
            >
              {s.photo ? (
                <img src={s.photo} alt={s.lot} className="w-full aspect-square object-cover" />
              ) : (
                <div className="w-full aspect-square bg-muted flex items-center justify-center text-[11px] text-muted-foreground">
                  No photo
                </div>
              )}
              <div className="p-2">
                <div className="flex items-baseline justify-between gap-1">
                  <span className="text-[11px] font-bold text-muted-foreground">{s.lot}</span>
                  <span className="text-[13px] font-bold text-[hsl(var(--gold))] tabular-nums">{s.price}</span>
                </div>
                <p className="text-[11px] text-foreground mt-1 truncate">{s.sire}</p>
                <p className="text-[10px] text-muted-foreground truncate">{s.breeder}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/40 p-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-[22px] font-bold text-[hsl(var(--gold))] mt-0.5 tabular-nums leading-none">{value}</p>
    </div>
  );
}

function AddResultsDialog({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (s: SCSale) => void;
}) {
  const [saleName, setSaleName] = useState("");
  const [date, setDate] = useState("");
  const [totalHead, setTotalHead] = useState("");
  const [averagePrice, setAveragePrice] = useState("");
  const [sellers, setSellers] = useState<TopSeller[]>([
    { lot: "", price: "", sire: "", breeder: "", photo: "" },
    { lot: "", price: "", sire: "", breeder: "", photo: "" },
    { lot: "", price: "", sire: "", breeder: "", photo: "" },
  ]);

  const update = (i: number, patch: Partial<TopSeller>) => {
    setSellers((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  };

  const handlePhoto = (i: number, file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => update(i, { photo: String(reader.result) });
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!saleName || !date) return;
    onSave({
      id: `sco-${Date.now()}`,
      saleName,
      date,
      totalHead: Number(totalHead) || 0,
      averagePrice: averagePrice.startsWith("$") ? averagePrice : `$${averagePrice}`,
      topSellers: sellers.map((s) => ({
        ...s,
        price: s.price.startsWith("$") || !s.price ? s.price : `$${s.price}`,
      })),
    });
    // reset
    setSaleName(""); setDate(""); setTotalHead(""); setAveragePrice("");
    setSellers([
      { lot: "", price: "", sire: "", breeder: "", photo: "" },
      { lot: "", price: "", sire: "", breeder: "", photo: "" },
      { lot: "", price: "", sire: "", breeder: "", photo: "" },
    ]);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogTitle>Add Sale Results</DialogTitle>
        <DialogDescription>Enter completed sale stats and top 3 sellers.</DialogDescription>

        <div className="mt-2 space-y-3">
          <Field label="Sale Name">
            <Input value={saleName} onChange={(e) => setSaleName(e.target.value)} placeholder="SC Online Summer Sale" />
          </Field>
          <Field label="Date">
            <Input value={date} onChange={(e) => setDate(e.target.value)} placeholder="June 5, 2026" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Total Head Sold">
              <Input value={totalHead} onChange={(e) => setTotalHead(e.target.value)} placeholder="48" inputMode="numeric" />
            </Field>
            <Field label="Average Price">
              <Input value={averagePrice} onChange={(e) => setAveragePrice(e.target.value)} placeholder="$3,200" />
            </Field>
          </div>

          <div className="pt-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Top 3 Sellers</p>
            <div className="space-y-3">
              {sellers.map((s, i) => (
                <div key={i} className="rounded-lg border border-border p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-bold text-foreground">#{i + 1}</span>
                    {s.photo && (
                      <button onClick={() => update(i, { photo: "" })} className="text-muted-foreground">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <label className="block">
                    {s.photo ? (
                      <img src={s.photo} alt="" className="w-full aspect-[4/3] object-cover rounded-md" />
                    ) : (
                      <div className="w-full aspect-[4/3] rounded-md bg-muted flex flex-col items-center justify-center gap-1 text-muted-foreground text-[11px] cursor-pointer hover:bg-muted/70 transition-colors">
                        <Upload className="w-4 h-4" />
                        Upload photo
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handlePhoto(i, e.target.files?.[0])}
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Lot #" value={s.lot} onChange={(e) => update(i, { lot: e.target.value })} />
                    <Input placeholder="Price" value={s.price} onChange={(e) => update(i, { price: e.target.value })} />
                  </div>
                  <Input placeholder="Sire name" value={s.sire} onChange={(e) => update(i, { sire: e.target.value })} />
                  <Input placeholder="Breeder name" value={s.breeder} onChange={(e) => update(i, { breeder: e.target.value })} />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button className="flex-1" onClick={handleSave}>Save Results</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
