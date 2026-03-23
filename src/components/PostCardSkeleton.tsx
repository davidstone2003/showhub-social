export function PostCardSkeleton() {
  return (
    <div
      className="bg-card overflow-hidden mx-3 lg:mx-0 animate-pulse"
      style={{ borderRadius: '10px', boxShadow: '0 1px 2px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)' }}
    >
      <div className="w-full aspect-[4/5] bg-muted" />
      <div style={{ padding: '8px 12px 12px' }}>
        <div className="h-4 bg-muted rounded w-3/4 mb-1.5" />
        <div className="h-3 bg-muted rounded w-1/2" />
      </div>
    </div>
  );
}
