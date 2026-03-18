import React from "react";

interface BreederSectionProps {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}

export function BreederSection({ icon: Icon, title, children }: BreederSectionProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">{title}</h2>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
