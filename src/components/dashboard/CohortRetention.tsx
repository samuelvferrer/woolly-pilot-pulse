import { CheckCircle, AlertTriangle } from "lucide-react";

interface WeekData {
  label: string;
  active: number;
  total: number;
  pct: number;
}

interface CohortRetentionProps {
  weeks: WeekData[];
}

function barColor(pct: number) {
  if (pct >= 80) return "#16A34A";
  if (pct >= 60) return "#CA8A04";
  if (pct >= 40) return "#E87C1E";
  return "#DC2626";
}

export function CohortRetention({ weeks }: CohortRetentionProps) {
  const current = weeks[weeks.length - 1];
  const previous = weeks.length >= 2 ? weeks[weeks.length - 2] : null;
  const diff = previous ? current.pct - previous.pct : 0;
  const aboveBenchmark = current.pct >= 60;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm h-full flex flex-col">
      <div className="flex items-start justify-between mb-1">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Retenção por Cohort
          </h2>
          <p className="text-xs text-muted-foreground">
            Alunos ativos desde o início do piloto
          </p>
        </div>
        <div className="text-right">
          <p
            className="text-3xl font-bold leading-none"
            style={{ color: barColor(current.pct) }}
          >
            {current.pct.toFixed(0)}%
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {current.label} · {diff >= 0 ? "+" : ""}
            {diff.toFixed(0)}pp vs anterior
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center space-y-2 my-3">
        {weeks.map((w, i) => {
          const isCurrent = i === weeks.length - 1;
          const color = barColor(w.pct);
          return (
            <div key={w.label} className="flex items-center gap-3">
              <span
                className="text-sm font-medium w-12 shrink-0"
                style={{ fontWeight: isCurrent ? 700 : 400 }}
              >
                {w.label}
              </span>
              <div className="flex-1 h-7 rounded-md bg-muted relative overflow-hidden">
                <div
                  className="h-full rounded-md flex items-center px-2 transition-all duration-500"
                  style={{
                    width: `${Math.max(w.pct, 8)}%`,
                    backgroundColor: isCurrent ? color : `${color}50`,
                  }}
                >
                  <span
                    className="text-xs font-semibold"
                    style={{ color: isCurrent ? "#fff" : color }}
                  >
                    {w.active}/{w.total}
                  </span>
                </div>
              </div>
              <span
                className="text-sm font-semibold w-12 text-right"
                style={{ color }}
              >
                {w.pct.toFixed(0)}%
              </span>
            </div>
          );
        })}
      </div>

      <div
        className="rounded-lg px-3 py-2 text-sm font-medium flex items-center gap-2"
        style={{
          backgroundColor: aboveBenchmark
            ? "rgba(22,163,74,0.1)"
            : "rgba(202,138,4,0.1)",
          color: aboveBenchmark ? "#16A34A" : "#CA8A04",
        }}
      >
        {aboveBenchmark ? (
          <CheckCircle size={16} />
        ) : (
          <AlertTriangle size={16} />
        )}
        {aboveBenchmark
          ? "Retenção acima do benchmark de 60% para pilotos educacionais"
          : "Retenção abaixo do benchmark de 60% — atenção necessária"}
      </div>
    </div>
  );
}
