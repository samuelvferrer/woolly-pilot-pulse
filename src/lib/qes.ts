export type QesFaixa = "Crítico" | "Superficial" | "Recorrente" | "Engajado" | "Profundo";

export const QES_CONFIG: Record<QesFaixa, { color: string; hex: string; min: number; max: number }> = {
  "Crítico":      { color: "bg-qes-critico",      hex: "#C62828", min: 0,  max: 25 },
  "Superficial":  { color: "bg-qes-superficial",   hex: "#E65100", min: 25, max: 45 },
  "Recorrente":   { color: "bg-qes-recorrente",    hex: "#F9A825", min: 45, max: 65 },
  "Engajado":     { color: "bg-qes-engajado",      hex: "#2E7D32", min: 65, max: 85 },
  "Profundo":     { color: "bg-qes-profundo",      hex: "#1B5E20", min: 85, max: 100 },
};

export function getQesFaixa(qes: number): QesFaixa {
  if (qes < 25) return "Crítico";
  if (qes < 45) return "Superficial";
  if (qes < 65) return "Recorrente";
  if (qes < 85) return "Engajado";
  return "Profundo";
}

export function getQesColor(qesOrFaixa: number | string): string {
  const faixa = typeof qesOrFaixa === "number" ? getQesFaixa(qesOrFaixa) : (qesOrFaixa as QesFaixa);
  return QES_CONFIG[faixa]?.hex || "#666666";
}
