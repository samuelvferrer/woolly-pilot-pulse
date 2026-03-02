import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/StatCard";
import { ArrowDown, Clock, CalendarDays, Sun, Moon, TrendingUp, AlertTriangle, Users } from "lucide-react";
import {
  cohortData,
  usageHeatmapData,
  activationFunnelData,
  conversationDistribution,
  timeToFirstValue,
} from "@/mocks/intelligenceData";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const PERIODOS = ["7 dias", "14 dias", "30 dias", "60 dias", "Todo o período"];

export default function Inteligencia() {
  const [periodo, setPeriodo] = useState("30 dias");

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Demo banner */}
      <div className="rounded-lg border px-4 py-2 text-sm" style={{ backgroundColor: "#FFFBEB", borderColor: "#FDE68A", color: "#92400E" }}>
        ⚠️ Dados de demonstração — Conecte o Supabase para ver dados reais
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <Select value={periodo} onValueChange={setPeriodo}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {PERIODOS.map((p) => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Section nav */}
      <div className="flex gap-2 flex-wrap sticky top-0 z-10 bg-background/95 backdrop-blur py-2 -mx-1 px-1">
        {[
          { id: "retencao", label: "Retenção" },
          { id: "horarios", label: "Horários" },
          { id: "ativacao", label: "Ativação" },
        ].map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="text-xs font-medium px-3 py-1.5 rounded-full border border-border bg-card hover:bg-accent transition-colors"
          >
            {s.label}
          </a>
        ))}
      </div>

      {/* Section 1: Cohort Retention */}
      <section id="retencao">
        <CohortRetention />
      </section>

      {/* Section 2: Usage Heatmap */}
      <section id="horarios">
        <UsageHeatmap />
      </section>

      {/* Section 3: Activation Funnel */}
      <section id="ativacao">
        <ActivationFunnel />
      </section>
    </div>
  );
}

// ─── SECTION 1: Cohort Retention Heatmap ───

function CohortRetention() {
  const maxWeeks = Math.max(...cohortData.map((c) => c.retentionByWeek.length));

  // Compute averages
  const avgWeek1 = useMemo(() => {
    const vals = cohortData.filter((c) => c.retentionByWeek.length > 1).map((c) => c.retentionByWeek[1]);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  }, []);

  const avgWeek4 = useMemo(() => {
    const vals = cohortData.filter((c) => c.retentionByWeek.length > 4).map((c) => c.retentionByWeek[4]);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  }, []);

  const bestCohortWeek4 = useMemo(() => {
    let best = { label: "", pct: 0 };
    cohortData.forEach((c) => {
      if (c.retentionByWeek.length > 4 && c.retentionByWeek[4] > best.pct) {
        best = { label: c.weekLabel, pct: c.retentionByWeek[4] };
      }
    });
    return best;
  }, []);

  const retentionColor = (pct: number) => {
    if (pct >= 80) return "hsl(130, 50%, 30%)";
    if (pct >= 60) return "hsl(130, 45%, 38%)";
    if (pct >= 40) return "hsl(130, 40%, 48%)";
    if (pct >= 20) return "hsl(130, 30%, 62%)";
    if (pct >= 10) return "hsl(130, 20%, 78%)";
    if (pct > 0) return "hsl(130, 10%, 88%)";
    return "hsl(0, 0%, 96%)";
  };

  const statusColor = (val: number, thresholds: [number, number]) =>
    val > thresholds[0] ? "hsl(var(--qes-engajado))" : val >= thresholds[1] ? "#F9A825" : "hsl(var(--destructive))";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Retenção por Cohort</CardTitle>
        <CardDescription>Dos alunos que começaram na semana X, quantos ainda usam na semana Y?</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                <th className="text-left p-2 font-medium text-muted-foreground sticky left-0 bg-card z-10 min-w-[120px]">Cohort</th>
                {Array.from({ length: maxWeeks }, (_, i) => (
                  <th key={i} className="p-2 font-medium text-muted-foreground text-center min-w-[64px]">
                    Sem {i}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cohortData.map((row) => (
                <tr key={row.weekLabel}>
                  <td className="p-2 font-medium sticky left-0 bg-card z-10 whitespace-nowrap">
                    {row.weekLabel} <span className="text-muted-foreground font-normal">({row.totalAlunos})</span>
                  </td>
                  {Array.from({ length: maxWeeks }, (_, i) => {
                    const val = row.retentionByWeek[i];
                    const hasVal = val !== undefined;
                    const count = hasVal ? Math.round((val / 100) * row.totalAlunos) : 0;
                    return (
                      <td key={i} className="p-0 text-center">
                        {hasVal ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className="m-0.5 p-2 rounded text-xs font-semibold cursor-default transition-colors"
                                style={{
                                  backgroundColor: retentionColor(val),
                                  color: val >= 40 ? "#fff" : val >= 10 ? "#333" : "#999",
                                }}
                              >
                                {val}%
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              {count} de {row.totalAlunos} alunos ({val}%)
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <div className="m-0.5 p-2 rounded bg-muted/30 text-muted-foreground">—</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <StatCard
            title="Retenção Semana 1"
            value={`${avgWeek1.toFixed(1)}%`}
            icon={Users}
            iconColor={statusColor(avgWeek1, [40, 20])}
            valueColor={statusColor(avgWeek1, [40, 20])}
          />
          <StatCard
            title="Retenção Semana 4"
            value={`${avgWeek4.toFixed(1)}%`}
            icon={TrendingUp}
            iconColor={statusColor(avgWeek4, [40, 20])}
            valueColor={statusColor(avgWeek4, [40, 20])}
          />
          <StatCard
            title="Melhor Cohort (Sem 4)"
            value={`${bestCohortWeek4.pct}%`}
            subtitle={bestCohortWeek4.label}
            icon={CalendarDays}
            iconColor="hsl(var(--primary))"
          />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── SECTION 2: Usage Heatmap ───

function UsageHeatmap() {
  const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  const hours = Array.from({ length: 18 }, (_, i) => i + 6);

  const maxCount = Math.max(...usageHeatmapData.map((c) => c.count));
  const totalConversas = usageHeatmapData.reduce((s, c) => s + c.count, 0);

  const cellColor = (count: number) => {
    const ratio = count / maxCount;
    if (ratio > 0.75) return "#E8820C";
    if (ratio > 0.5) return "#F4A940";
    if (ratio > 0.25) return "#FDD08A";
    if (ratio > 0.1) return "#FEE8C0";
    return "hsl(var(--muted))";
  };

  // Insights
  const peakHour = useMemo(() => {
    const byHour: Record<number, number> = {};
    usageHeatmapData.forEach((c) => { byHour[c.hour] = (byHour[c.hour] || 0) + c.count; });
    const sorted = Object.entries(byHour).sort(([, a], [, b]) => b - a);
    return Number(sorted[0][0]);
  }, []);

  const peakDay = useMemo(() => {
    const byDay: Record<string, number> = {};
    usageHeatmapData.forEach((c) => { byDay[c.day] = (byDay[c.day] || 0) + c.count; });
    return Object.entries(byDay).sort(([, a], [, b]) => b - a)[0][0];
  }, []);

  const pctNoturno = useMemo(() => {
    const noturno = usageHeatmapData.filter((c) => c.hour >= 19 && c.hour <= 23).reduce((s, c) => s + c.count, 0);
    return ((noturno / totalConversas) * 100).toFixed(1);
  }, [totalConversas]);

  const pctFimDeSemana = useMemo(() => {
    const fds = usageHeatmapData.filter((c) => c.day === "Sáb" || c.day === "Dom").reduce((s, c) => s + c.count, 0);
    return ((fds / totalConversas) * 100).toFixed(1);
  }, [totalConversas]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quando os alunos estudam</CardTitle>
        <CardDescription>Padrão de uso por dia da semana e hora do dia</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="border-collapse text-xs">
            <thead>
              <tr>
                <th className="p-1 text-muted-foreground font-medium text-right pr-2 min-w-[40px]">Hora</th>
                {days.map((d) => (
                  <th key={d} className="p-1 text-muted-foreground font-medium text-center min-w-[48px]">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {hours.map((h) => (
                <tr key={h}>
                  <td className="p-1 text-muted-foreground text-right pr-2 font-mono">{h}h</td>
                  {days.map((d) => {
                    const cell = usageHeatmapData.find((c) => c.day === d && c.hour === h);
                    const count = cell?.count || 0;
                    return (
                      <td key={d} className="p-0">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className="m-0.5 rounded h-7 flex items-center justify-center text-[10px] font-medium cursor-default transition-colors"
                              style={{
                                backgroundColor: cellColor(count),
                                color: count / maxCount > 0.5 ? "#fff" : "hsl(var(--muted-foreground))",
                              }}
                            >
                              {count}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>{d} {h}h: {count} conversas</TooltipContent>
                        </Tooltip>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <StatCard title="Horário de pico" value={`${peakHour}h - ${peakHour + 1}h`} icon={Clock} iconColor="#E8820C" />
          <StatCard title="Dia mais ativo" value={peakDay} icon={CalendarDays} iconColor="#E8820C" />
          <StatCard title="% Uso noturno (19-23h)" value={`${pctNoturno}%`} icon={Moon} iconColor="#5C6BC0" />
          <StatCard title="% Fim de semana" value={`${pctFimDeSemana}%`} icon={Sun} iconColor="#F9A825" />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── SECTION 3: Activation Funnel ───

function ActivationFunnel() {
  const totalAlunos = activationFunnelData[0].contagem;

  const biggestDrop = useMemo(() => {
    let max = { from: "", to: "", pct: 0 };
    for (let i = 0; i < activationFunnelData.length - 1; i++) {
      const dropPct = ((activationFunnelData[i].contagem - activationFunnelData[i + 1].contagem) / activationFunnelData[i].contagem) * 100;
      if (dropPct > max.pct) {
        max = { from: activationFunnelData[i].etapa, to: activationFunnelData[i + 1].etapa, pct: dropPct };
      }
    }
    return max;
  }, []);

  const ttfvColor = timeToFirstValue > 48 ? "hsl(var(--destructive))" : "hsl(var(--qes-engajado))";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Funil de Ativação</CardTitle>
        <CardDescription>Da criação de conta ao hábito</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Vertical funnel */}
        <div className="space-y-1 max-w-xl">
          {activationFunnelData.map((step, i) => {
            const pctTotal = ((step.contagem / totalAlunos) * 100).toFixed(1);
            const dropoff = i > 0
              ? (((activationFunnelData[i - 1].contagem - step.contagem) / activationFunnelData[i - 1].contagem) * 100).toFixed(1)
              : null;
            const barWidth = Math.max(20, (step.contagem / totalAlunos) * 100);

            return (
              <div key={step.etapa}>
                {dropoff && (
                  <div className="flex items-center gap-2 py-1 pl-2">
                    <ArrowDown size={12} className="text-destructive" />
                    <span className="text-xs font-semibold text-destructive">⬇ {dropoff}% perdidos</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 rounded-r-md flex items-center px-3 transition-all"
                    style={{ width: `${barWidth}%`, backgroundColor: step.cor }}
                  >
                    <span className="text-sm font-bold text-white">{step.contagem}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{step.etapa}</span>
                    <span className="text-[10px] text-muted-foreground">{pctTotal}% do total</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-sm p-3 rounded-lg bg-muted">
          O maior drop-off está entre <strong>{biggestDrop.from}</strong> e <strong>{biggestDrop.to}</strong>:{" "}
          <span className="text-destructive font-bold">{biggestDrop.pct.toFixed(1)}%</span> dos alunos são perdidos nesta transição.
        </p>

        {/* Conversation distribution histogram */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Distribuição de conversas por aluno</h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={conversationDistribution}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="faixa" tick={{ fontSize: 12 }} label={{ value: "Conversas", position: "bottom", offset: -2, fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} label={{ value: "Alunos", angle: -90, position: "insideLeft", fontSize: 11 }} />
              <RechartsTooltip formatter={(v: number) => [`${v} alunos`, "Quantidade"]} />
              <Bar dataKey="contagem" radius={[4, 4, 0, 0]}>
                {conversationDistribution.map((d, i) => (
                  <Cell key={i} fill={d.isHighlight ? "#C62828" : "hsl(33, 91%, 48%)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-muted-foreground mt-1">A barra vermelha representa alunos que nunca voltaram (1 conversa).</p>
        </div>

        {/* Time to first value */}
        <StatCard
          title="Time to First Value"
          value={`${timeToFirstValue}h`}
          subtitle={timeToFirstValue > 48 ? "Atrito alto no onboarding" : "Tempo saudável"}
          icon={Clock}
          iconColor={ttfvColor}
          valueColor={ttfvColor}
          className="max-w-sm"
        />
      </CardContent>
    </Card>
  );
}
