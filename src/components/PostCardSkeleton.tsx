export function PostCardSkeleton() {
  return (
    <div
      className="bg-card overflow-hidden mx-3 lg:mx-0 animate-pulse"
      style={{ borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
    >
      {/* Image shimmer */}
      <div className="w-full aspect-[4/5] bg-muted" style={{ borderRadius: '12px 12px 0 0' }} />

      {/* Content shimmer */}
      <div style={{ padding: '10px 12px' }}>
        <div className="h-4 bg-muted rounded w-3/4 mb-2" />
        <div className="h-3 bg-muted rounded w-1/2 mb-2" />
        <div className="h-3 bg-muted rounded w-2/3" />
      </div>

      {/* Action bar shimmer */}
      <div className="border-t border-border" style={{ margin: '0 12px' }} />
      <div className="flex items-center" style={{ height: '44px', padding: '0 8px', gap: '6px' }}>
        <div className="flex-1 h-8 bg-muted rounded-lg" />
        <div className="w-9 h-8 bg-muted rounded-lg" />
        <div className="w-9 h-8 bg-muted rounded-lg" />
        <div className="flex-1 h-8 bg-muted rounded-lg" />
      </div>
    </div>
  );
}
