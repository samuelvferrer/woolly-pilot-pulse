import { useParams } from "react-router-dom";
import { useSupabaseQuery } from "@/hooks/useSupabaseQuery";
import type { DashboardAluno, DashboardHistorico } from "@/types/dashboard";
import { StatCard } from "@/components/StatCard";
import { QesBadge } from "@/components/QesBadge";
import { TrendIndicator } from "@/components/TrendIndicator";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import { User, Clock, Calendar, RefreshCw } from "lucide-react";
import { getQesColor } from "@/lib/qes";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { format, parseISO } from "date-fns";

export default function Aluno() {
  const { alunoId } = useParams<{ alunoId: string }>();

  const { data: alunos, loading: l1, error: e1, refetch: r1 } = useSupabaseQuery<DashboardAluno>(
    "v_dashboard_aluno",
    { aluno_id: alunoId }
  );
  const { data: historico, loading: l2, error: e2, refetch: r2 } = useSupabaseQuery<DashboardHistorico>(
    "v_dashboard_historico",
    { aluno_id: alunoId }
  );

  const loading = l1 || l2;
  const error = e1 || e2;

  if (error) return <ErrorState message={error} onRetry={() => { r1(); r2(); }} />;

  const aluno = alunos?.[0];
  const historicoSorted = historico ? [...historico].sort((a, b) => a.data.localeCompare(b.data)) : [];

  const chartData = historicoSorted.map((h) => ({
    data: format(parseISO(h.data), "dd/MM"),
    QES: h.qes_total,
    TAM: h.tam_score,
    FR: h.fr_score,
    PI: h.pi_score,
    PD: h.pd_score,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {loading ? "Carregando..." : aluno?.aluno_nome || "Aluno"}
        </h1>
        {aluno && (
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm text-muted-foreground">
              {aluno.turma_nome} — {aluno.serie} — {aluno.escola_nome}
            </span>
            <TrendIndicator tendencia={aluno.tendencia} />
          </div>
        )}
      </div>

      {loading ? (
        <LoadingSkeleton variant="card" count={4} />
      ) : aluno ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="QES Total" value={aluno.qes_total.toFixed(1)} icon={User} iconColor={getQesColor(aluno.qes_total)} valueColor={getQesColor(aluno.qes_total)} subtitle={aluno.qes_faixa} />
            <StatCard title="Sessões" value={aluno.total_sessoes} icon={Clock} subtitle={`${aluno.total_minutos_ativos} min ativos`} />
            <StatCard title="Dias Ativos" value={aluno.dias_ativos} icon={Calendar} />
            <StatCard title="Taxa Loop" value={`${aluno.taxa_loop_completo.toFixed(1)}%`} icon={RefreshCw} valueColor={aluno.taxa_loop_completo < 60 ? "#C62828" : "#2E7D32"} subtitle="meta: >60%" />
          </div>

          {/* Pillar scores */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { label: "TAM (Tempo Ativo)", value: aluno.tam_score, weight: "30%" },
              { label: "FR (Frequência)", value: aluno.fr_score, weight: "25%" },
              { label: "PI (Profundidade)", value: aluno.pi_score, weight: "25%" },
              { label: "PD (Persistência)", value: aluno.pd_score, weight: "20%" },
            ].map((p) => (
              <div key={p.label} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <p className="text-xs text-muted-foreground">{p.label}</p>
                <p className="text-xl font-bold mt-1">{p.value.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">peso: {p.weight}</p>
              </div>
            ))}
          </div>

          {/* History Chart */}
          {chartData.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h2 className="text-base font-semibold mb-4">Evolução do QES</h2>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="data" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", fontSize: 12 }} />
                  <Line type="monotone" dataKey="QES" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="TAM" stroke="#666" strokeWidth={1} strokeDasharray="4 2" dot={false} />
                  <Line type="monotone" dataKey="FR" stroke="#888" strokeWidth={1} strokeDasharray="4 2" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      ) : (
        <EmptyState icon={User} title="Aluno não encontrado" />
      )}
    </div>
  );
}
