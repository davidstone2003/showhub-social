interface SalesTabProps {
  showId?: string;
}

export function SalesTab({ showId }: SalesTabProps) {
  return (
    <div className="text-center py-16 px-4">
      <p className="text-muted-foreground text-sm font-medium">No active sales right now</p>
      <p className="text-xs text-muted-foreground mt-1">Sale results will appear here during live events</p>
    </div>
  );
}
