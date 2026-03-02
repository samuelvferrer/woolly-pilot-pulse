import { getQesFaixa, getQesColor, type QesFaixa } from "@/lib/qes";

interface QesBadgeProps {
  qes?: number;
  faixa?: string;
  showValue?: boolean;
}

export function QesBadge({ qes, faixa, showValue = false }: QesBadgeProps) {
  const resolvedFaixa = (faixa as QesFaixa) || (qes !== undefined ? getQesFaixa(qes) : "Recorrente");
  const color = getQesColor(resolvedFaixa);

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={{ backgroundColor: `${color}18`, color }}
    >
      {showValue && qes !== undefined && (
        <span className="font-bold">{qes.toFixed(1)}</span>
      )}
      {resolvedFaixa}
    </span>
  );
}
