import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  variant?: "card" | "table" | "chart" | "text" | "inline";
  count?: number;
  className?: string;
}

function SkeletonBox({ className }: { className?: string }) {
  return <div className={cn("skeleton-shimmer rounded-lg", className)} />;
}

export function LoadingSkeleton({ variant = "card", count = 1, className }: LoadingSkeletonProps) {
  const items = Array.from({ length: count });

  if (variant === "card") {
    return (
      <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
        {items.map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-3">
            <SkeletonBox className="h-4 w-24" />
            <SkeletonBox className="h-8 w-16" />
            <SkeletonBox className="h-3 w-32" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "table") {
    return (
      <div className={cn("rounded-xl border border-border bg-card p-4 space-y-3", className)}>
        <SkeletonBox className="h-5 w-40 mb-4" />
        {items.map((_, i) => (
          <SkeletonBox key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (variant === "chart") {
    return (
      <div className={cn("rounded-xl border border-border bg-card p-4 space-y-3", className)}>
        <SkeletonBox className="h-5 w-40" />
        <SkeletonBox className="h-52 w-full" />
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {items.map((_, i) => (
        <SkeletonBox key={i} className="h-4 w-full" />
      ))}
    </div>
  );
}
