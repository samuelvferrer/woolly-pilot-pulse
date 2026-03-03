import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";

interface DayData {
  label: string;
  sessoes: number;
  loops: number;
  isToday: boolean;
}

interface ActivityChartProps {
  data: DayData[];
}

export function ActivityChart({ data }: ActivityChartProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Atividade — Últimos 14 dias
          </h2>
          <p className="text-xs text-muted-foreground">
            Sessões e loops completos por dia
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: "#E87C1E" }}
            />
            Sessões
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: "#16A34A" }}
            />
            Loops
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barGap={-20}>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />
          <Tooltip
            contentStyle={{
              borderRadius: 10,
              border: "1px solid hsl(var(--border))",
              fontSize: 12,
            }}
            formatter={(value: number, name: string) => [
              value,
              name === "sessoes" ? "Sessões" : "Loops completos",
            ]}
          />
          <Bar dataKey="sessoes" radius={[4, 4, 0, 0]} barSize={24}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.isToday ? "#E87C1E" : "rgba(232,124,30,0.35)"}
              />
            ))}
          </Bar>
          <Bar dataKey="loops" radius={[4, 4, 0, 0]} barSize={14}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.isToday ? "#16A34A" : "rgba(22,163,74,0.4)"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
