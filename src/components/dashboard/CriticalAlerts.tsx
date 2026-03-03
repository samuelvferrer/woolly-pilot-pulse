import type { DashboardAlerta } from "@/types/dashboard";

interface CriticalAlertsProps {
  alertas: DashboardAlerta[];
}

export function CriticalAlerts({ alertas }: CriticalAlertsProps) {
  const criticos = alertas
    .filter((a) => a.severidade === "alto")
    .slice(0, 6);

  if (criticos.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-base font-semibold text-foreground">
          Alertas Críticos
        </h2>
        <span
          className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold text-white"
          style={{ backgroundColor: "#DC2626" }}
        >
          {criticos.length}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {criticos.map((a, i) => (
          <div
            key={i}
            className="rounded-2xl p-4 shadow-sm"
            style={{
              backgroundColor: "#FEF2F2",
              borderLeft: "3px solid #DC2626",
            }}
          >
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-foreground">
                {a.aluno_nome}
              </span>
              <span className="text-xs text-muted-foreground">
                {a.turma_nome}
              </span>
              <span
                className="ml-auto inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold text-white"
                style={{ backgroundColor: "#DC2626" }}
              >
                QES {a.qes_total?.toFixed(1)}
              </span>
            </div>
            <p className="mt-1.5 text-xs italic text-muted-foreground">
              {a.acao_sugerida}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
