import { useParams, useNavigate } from "react-router-dom";
import { useSupabaseQuery } from "@/hooks/useSupabaseQuery";
import type { DashboardTurma, DashboardAluno } from "@/types/dashboard";
import { StatCard } from "@/components/StatCard";
import { QesBadge } from "@/components/QesBadge";
import { TrendIndicator } from "@/components/TrendIndicator";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import { Users, TrendingUp, Clock, Calendar } from "lucide-react";
import { getQesColor, getQesFaixa } from "@/lib/qes";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function Turma() {
  const { turmaId } = useParams<{ turmaId: string }>();
  const navigate = useNavigate();

  const { data: turmas, loading: l1, error: e1, refetch: r1 } = useSupabaseQuery<DashboardTurma>(
    "v_dashboard_turma",
    { turma_id: turmaId }
  );
  const { data: alunos, loading: l2, error: e2, refetch: r2 } = useSupabaseQuery<DashboardAluno>(
    "v_dashboard_aluno"
  );

  const loading = l1 || l2;
  const error = e1 || e2;

  if (error) return <ErrorState message={error} onRetry={() => { r1(); r2(); }} />;

  const turma = turmas?.[0];
  const alunosTurma = alunos?.filter((a) => a.turma_nome === turma?.turma_nome) || [];
  const sortedAlunos = [...alunosTurma].sort((a, b) => a.qes_total - b.qes_total);

  // Pillar data for bar chart
  const pillarData = turma
    ? [
        { name: "TAM", value: turma.tam_medio, weight: "30%" },
        { name: "FR", value: turma.fr_medio, weight: "25%" },
        { name: "PI", value: turma.pi_medio, weight: "25%" },
        { name: "PD", value: turma.pd_medio, weight: "20%" },
      ]
    : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {loading ? "Carregando..." : turma?.turma_nome || "Turma"}
        </h1>
        {turma && (
          <p className="text-sm text-muted-foreground mt-1">
            {turma.serie} — {turma.escola_nome}
          </p>
        )}
      </div>

      {loading ? (
        <LoadingSkeleton variant="card" count={4} />
      ) : turma ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="QES Médio" value={turma.qes_medio.toFixed(1)} icon={TrendingUp} iconColor={getQesColor(turma.qes_medio)} valueColor={getQesColor(turma.qes_medio)} subtitle={getQesFaixa(turma.qes_medio)} />
            <StatCard title="Alunos" value={turma.total_alunos} icon={Users} subtitle="nesta turma" />
            <StatCard title="Sessões Totais" value={turma.total_sessoes_turma} icon={Clock} subtitle="sessões registradas" />
            <StatCard title="Dias Ativos (média)" value={turma.dias_ativos_medio.toFixed(1)} icon={Calendar} subtitle="por aluno" />
          </div>

          {/* Pillars Chart */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-base font-semibold mb-4">Pilares do QES</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={pillarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", fontSize: 12 }}
                  formatter={(value: number) => [value.toFixed(1), "Score"]}
                />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Students Table */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-base font-semibold mb-4">Alunos</h2>
            {sortedAlunos.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-2 font-medium text-muted-foreground">Aluno</th>
                      <th className="pb-2 font-medium text-muted-foreground">QES</th>
                      <th className="pb-2 font-medium text-muted-foreground">Tendência</th>
                      <th className="pb-2 font-medium text-muted-foreground">Sessões</th>
                      <th className="pb-2 font-medium text-muted-foreground">Loop %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedAlunos.map((aluno) => (
                      <tr key={aluno.aluno_id} className="border-b border-border last:border-0 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate(`/aluno/${aluno.aluno_id}`)}>
                        <td className="py-2.5 font-medium">{aluno.aluno_nome}</td>
                        <td className="py-2.5"><QesBadge qes={aluno.qes_total} faixa={aluno.qes_faixa} showValue /></td>
                        <td className="py-2.5"><TrendIndicator tendencia={aluno.tendencia} /></td>
                        <td className="py-2.5 text-muted-foreground">{aluno.total_sessoes}</td>
                        <td className="py-2.5" style={{ color: aluno.taxa_loop_completo < 40 ? "#C62828" : aluno.taxa_loop_completo >= 60 ? "#2E7D32" : undefined }}>{aluno.taxa_loop_completo.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState icon={Users} title="Nenhum aluno encontrado" />
            )}
          </div>
        </>
      ) : (
        <EmptyState icon={Users} title="Turma não encontrada" />
      )}
    </div>
  );
}
