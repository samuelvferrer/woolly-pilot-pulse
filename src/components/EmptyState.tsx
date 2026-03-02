import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  iconColor?: string;
}

export function EmptyState({ icon: Icon, title, description, iconColor = "hsl(var(--muted-foreground))" }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
      <div
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-full"
        style={{ backgroundColor: `${iconColor}14` }}
      >
        <Icon size={28} style={{ color: iconColor }} />
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description && <p className="mt-1 text-sm text-muted-foreground max-w-sm">{description}</p>}
    </div>
  );
}
