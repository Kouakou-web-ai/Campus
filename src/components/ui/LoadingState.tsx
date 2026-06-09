interface LoadingStateProps {
  rows?: number;
  cols?: number;
  type?: 'table' | 'cards' | 'list' | 'page';
  message?: string;
}

function SkeletonCard() {
  return (
    <div className="card-premium p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="skeleton-pulse h-3 w-20 mb-2" />
          <div className="skeleton-pulse h-8 w-32" />
        </div>
        <div className="skeleton-pulse w-12 h-12 rounded-2xl" />
      </div>
      <div className="skeleton-pulse h-3 w-24" />
    </div>
  );
}

function SkeletonListItem() {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-border-subtle last:border-0">
      <div className="skeleton-pulse w-9 h-9 rounded-full flex-shrink-0" />
      <div className="flex-1">
        <div className="skeleton-pulse h-3.5 w-36 mb-1.5" />
        <div className="skeleton-pulse h-3 w-24" />
      </div>
      <div className="skeleton-pulse h-5 w-16 rounded-full" />
    </div>
  );
}

export default function LoadingState({ rows = 3, type = 'cards' }: LoadingStateProps) {
  if (type === 'cards') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="card-premium p-4">
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonListItem key={i} />
        ))}
      </div>
    );
  }

  if (type === 'page') {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="skeleton-pulse h-8 w-48 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="skeleton-pulse h-64 rounded-xl" />
          <div className="skeleton-pulse h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  // table
  return (
    <div className="card-premium overflow-hidden">
      <div className="skeleton-pulse h-12 w-full rounded-none" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 px-4 py-3 border-t border-border-subtle">
          <div className="skeleton-pulse h-4 w-32" />
          <div className="skeleton-pulse h-4 flex-1" />
          <div className="skeleton-pulse h-4 w-20" />
          <div className="skeleton-pulse h-4 w-16" />
        </div>
      ))}
    </div>
  );
}
