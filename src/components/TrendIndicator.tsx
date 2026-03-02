import { TrendingUp, TrendingDown, Minus, Sparkles } from "lucide-react";

type Tendencia = "subindo" | "caindo" | "estavel" | "novo";

interface TrendIndicatorProps {
  tendencia: Tendencia;
  size?: number;
}

const config: Record<Tendencia, { icon: typeof TrendingUp; color: string; label: string }> = {
  subindo: { icon: TrendingUp, color: "text-qes-engajado", label: "Subindo" },
  caindo:  { icon: TrendingDown, color: "text-destructive", label: "Caindo" },
  estavel: { icon: Minus, color: "text-muted-foreground", label: "Estável" },
  novo:    { icon: Sparkles, color: "text-primary", label: "Novo" },
};

export function TrendIndicator({ tendencia, size = 16 }: TrendIndicatorProps) {
  const { icon: Icon, color, label } = config[tendencia] || config.estavel;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${color}`}>
      <Icon size={size} />
      {label}
    </span>
  );
}
