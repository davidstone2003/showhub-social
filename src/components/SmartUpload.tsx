import React, { useState, useRef } from "react";
import { Camera, FileText, Link2, Sparkles, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ExtractedFields {
  showName: string;
  winPlacing: string;
  shownBy: string;
  placedBy: string;
  siredBy: string;
  dam: string;
  caption: string;
  imageFile?: File;
  imagePreview?: string;
}

interface SmartUploadProps {
  onExtracted: (fields: ExtractedFields) => void;
  onSkip: () => void;
}

type InputMode = null | "photo" | "caption" | "link";

export default function SmartUpload({ onExtracted, onSkip }: SmartUploadProps) {
  const [mode, setMode] = useState<InputMode>(null);
  const [processing, setProcessing] = useState(false);
  const [captionText, setCaptionText] = useState("");
  const [linkText, setLinkText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const callExtract = async (body: Record<string, string>) => {
    const { data, error } = await supabase.functions.invoke("extract-winner", { body });
    if (error) throw new Error(error.message || "Extraction failed");
    if (data?.error) throw new Error(data.error);
    return data.extracted as Record<string, string>;
  };

  const applyExtracted = (raw: Record<string, string>, extras?: Partial<ExtractedFields>) => {
    const fields: ExtractedFields = {
      showName: raw.show_name || "",
      winPlacing: raw.win_placing || "",
      shownBy: raw.shown_by || "",
      placedBy: raw.placed_by || "",
      siredBy: raw.sired_by || "",
      dam: raw.dam || "",
      caption: raw.caption || "",
      ...extras,
    };
    const filled = Object.values(fields).filter((v) => typeof v === "string" && v.trim()).length;
    if (filled > 0) {
      toast.success(`Extracted ${filled} field${filled > 1 ? "s" : ""}`, {
        description: "Review and edit before posting.",
      });
    } else {
      toast("Couldn't extract structured fields", {
        description: "Fill in the form manually.",
      });
    }
    onExtracted(fields);
  };

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProcessing(true);
    try {
      const base64 = await fileToBase64(file);
      const raw = await callExtract({ imageBase64: base64, mimeType: file.type });
      applyExtracted(raw, { imageFile: file, imagePreview: URL.createObjectURL(file) });
    } catch (err: any) {
      toast.error("Extraction failed", { description: err.message });
      // Still pass image through so user can fill manually
      onExtracted({
        showName: "", winPlacing: "", shownBy: "", placedBy: "",
        siredBy: "", dam: "", caption: "",
        imageFile: file, imagePreview: URL.createObjectURL(file),
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleCaption = async () => {
    if (!captionText.trim()) return;
    setProcessing(true);
    try {
      const raw = await callExtract({ text: captionText });
      applyExtracted(raw);
    } catch (err: any) {
      toast.error("Extraction failed", { description: err.message });
      onExtracted({
        showName: "", winPlacing: "", shownBy: "", placedBy: "",
        siredBy: "", dam: "", caption: captionText,
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleLink = async () => {
    if (!linkText.trim()) return;
    setProcessing(true);
    try {
      const raw = await callExtract({ text: `Extract winner details from this post URL: ${linkText}` });
      applyExtracted(raw);
    } catch (err: any) {
      toast.error("Extraction failed", { description: err.message });
      onExtracted({
        showName: "", winPlacing: "", shownBy: "", placedBy: "",
        siredBy: "", dam: "", caption: "",
      });
    } finally {
      setProcessing(false);
    }
  };

  /* Loading overlay */
  if (processing) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
          <Sparkles className="w-7 h-7 text-primary" />
        </div>
        <p className="text-sm font-medium text-foreground">Reading your post…</p>
        <p className="text-xs text-muted-foreground">This usually takes a few seconds</p>
      </div>
    );
  }

  /* Sub-screens */
  if (mode === "caption") {
    return (
      <div className="space-y-3">
        <button onClick={() => setMode(null)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
        <Textarea
          placeholder="Paste your Facebook or Instagram caption here…"
          value={captionText}
          onChange={(e) => setCaptionText(e.target.value)}
          className="rounded-xl bg-card border-border text-sm min-h-[120px] resize-none"
          autoFocus
        />
        <Button onClick={handleCaption} disabled={!captionText.trim()} className="w-full h-11 rounded-xl font-semibold gap-2">
          <Sparkles className="w-4 h-4" /> Extract Details
        </Button>
      </div>
    );
  }

  if (mode === "link") {
    return (
      <div className="space-y-3">
        <button onClick={() => setMode(null)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
        <Input
          placeholder="Paste a link to the post…"
          value={linkText}
          onChange={(e) => setLinkText(e.target.value)}
          className="rounded-xl bg-card border-border h-12 text-sm"
          autoFocus
        />
        <Button onClick={handleLink} disabled={!linkText.trim()} className="w-full h-11 rounded-xl font-semibold gap-2">
          <Sparkles className="w-4 h-4" /> Extract Details
        </Button>
      </div>
    );
  }

  /* Main picker */
  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-lg font-bold text-foreground">Smart Upload</h2>
        <p className="text-xs text-muted-foreground mt-1">AI reads your post and fills in the details</p>
      </div>

      <div className="grid gap-2.5">
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
        <OptionButton icon={Camera} label="Upload Photo" desc="Snap or choose a result photo" onClick={() => fileRef.current?.click()} />
        <OptionButton icon={FileText} label="Paste Caption" desc="From Facebook, Instagram, etc." onClick={() => setMode("caption")} />
        <OptionButton icon={Link2} label="Paste Link" desc="Link to a social media post" onClick={() => setMode("link")} />
      </div>

      <button onClick={onSkip} className="w-full text-center text-xs text-muted-foreground hover:text-foreground py-2">
        or fill in manually
      </button>
    </div>
  );
}

function OptionButton({ icon: Icon, label, desc, onClick }: { icon: any; label: string; desc: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full p-3.5 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-colors text-left"
    >
      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-muted-foreground" />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </button>
  );
}
