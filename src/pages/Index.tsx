import { Users, TrendingUp, AlertTriangle, RefreshCw, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useSupabaseQuery } from "@/hooks/useSupabaseQuery";
import type { DashboardEscola, DashboardAlerta } from "@/types/dashboard";
import { StatCard } from "@/components/StatCard";
import { QesBadge } from "@/components/QesBadge";
import { AlertCard } from "@/components/AlertCard";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { getQesFaixa, getQesColor, QES_CONFIG } from "@/lib/qes";

const QES_KEYS = ["Crítico", "Superficial", "Recorrente", "Engajado", "Profundo"] as const;

export default function VisaoGeral() {
  const navigate = useNavigate();
  const {
    data: escolas,
    loading: loadingEscolas,
    error: errorEscolas,
    refetch: refetchEscolas,
  } = useSupabaseQuery<DashboardEscola>("v_dashboard_escola");

  const {
    data: alertas,
    loading: loadingAlertas,
    error: errorAlertas,
    refetch: refetchAlertas,
  } = useSupabaseQuery<DashboardAlerta>("v_dashboard_alertas");

  const loading = loadingEscolas || loadingAlertas;
  const error = errorEscolas || errorAlertas;

  if (error) {
    return <ErrorState message={error} onRetry={() => { refetchEscolas(); refetchAlertas(); }} />;
  }

  // Compute aggregates
  const totalAlunos = escolas?.reduce((s, e) => s + e.total_alunos, 0) || 0;
  const totalEscolas = escolas?.length || 0;

  const qesMedio = escolas && escolas.length > 0
    ? escolas.reduce((s, e) => s + e.qes_medio * e.total_alunos, 0) / totalAlunos
    : 0;

  const taxaLoopMedia = escolas && escolas.length > 0
    ? escolas.reduce((s, e) => s + e.taxa_loop_media, 0) / escolas.length
    : 0;

  const alertCount = alertas?.length || 0;
  const alertAlto = alertas?.filter((a) => a.severidade === "alto").length || 0;

  // QES distribution for donut
  const distribution = QES_KEYS.map((faixa) => {
    const fieldMap: Record<string, keyof DashboardEscola> = {
      "Crítico": "alunos_criticos",
      "Superficial": "alunos_superficiais",
      "Recorrente": "alunos_recorrentes",
      "Engajado": "alunos_engajados",
      "Profundo": "alunos_profundos",
    };
    const count = escolas?.reduce((s, e) => s + (e[fieldMap[faixa]] as number || 0), 0) || 0;
    return { name: faixa, value: count, color: QES_CONFIG[faixa].hex };
  });

  // Schools sorted by QES ascending
  const sortedEscolas = escolas ? [...escolas].sort((a, b) => a.qes_medio - b.qes_medio) : [];

  const alertasRecentes = alertas
    ? [...alertas].sort((a, b) => (a.severidade === "alto" ? -1 : 1) - (b.severidade === "alto" ? -1 : 1)).slice(0, 10)
    : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground">Visão Geral</h1>

      {/* Section 1: Summary Cards */}
      {loading ? (
        <LoadingSkeleton variant="card" count={4} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Alunos Ativos"
            value={totalAlunos}
            subtitle={`em ${totalEscolas} escola${totalEscolas !== 1 ? "s" : ""} piloto`}
            icon={Users}
          />
          <StatCard
            title="QES Médio"
            value={qesMedio.toFixed(1)}
            subtitle={getQesFaixa(qesMedio)}
            icon={TrendingUp}
            iconColor={getQesColor(qesMedio)}
            valueColor={getQesColor(qesMedio)}
          />
          <StatCard
            title="Alertas Ativos"
            value={alertCount}
            subtitle={`${alertAlto} alta severidade`}
            icon={AlertTriangle}
            iconColor="#C62828"
            borderColor={alertCount > 0 ? "#C62828" : undefined}
          />
          <StatCard
            title="Taxa Loop Completo"
            value={`${taxaLoopMedia.toFixed(1)}%`}
            subtitle={`meta: >60%`}
            icon={RefreshCw}
            valueColor={taxaLoopMedia < 60 ? "#C62828" : undefined}
          />
        </div>
      )}

      {/* Section 2: Charts + Table */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <LoadingSkeleton variant="chart" />
          <LoadingSkeleton variant="table" count={5} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Donut Chart */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-base font-semibold text-foreground mb-4">Distribuição QES</h2>
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={distribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={2}
                    strokeWidth={0}
                  >
                    {distribution.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => {
                      const pct = totalAlunos > 0 ? ((value / totalAlunos) * 100).toFixed(1) : "0";
                      return [`${value} alunos (${pct}%)`, name];
                    }}
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid hsl(var(--border))",
                      fontSize: 12,
                    }}
                  />
                  {/* Center text */}
                  <text x="50%" y="48%" textAnchor="middle" className="fill-foreground text-2xl font-bold">
                    {totalAlunos}
                  </text>
                  <text x="50%" y="58%" textAnchor="middle" className="fill-muted-foreground text-xs">
                    alunos
                  </text>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {distribution.map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: d.color }}
                    />
                    <span className="text-muted-foreground">
                      {d.name}: {d.value} ({totalAlunos > 0 ? ((d.value / totalAlunos) * 100).toFixed(0) : 0}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Schools Table */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-base font-semibold text-foreground mb-4">Escolas Piloto</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-2 font-medium text-muted-foreground">Escola</th>
                    <th className="pb-2 font-medium text-muted-foreground">QES Médio</th>
                    <th className="pb-2 font-medium text-muted-foreground">Alunos</th>
                    <th className="pb-2 font-medium text-muted-foreground">Em Risco</th>
                    <th className="pb-2 font-medium text-muted-foreground">Loop Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedEscolas.map((escola) => {
                    const emRisco = escola.alunos_criticos + escola.alunos_superficiais;
                    const emRiscoPct = escola.total_alunos > 0 ? (emRisco / escola.total_alunos) * 100 : 0;
                    return (
                      <tr
                        key={escola.escola_id}
                        className="border-b border-border last:border-0 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => navigate(`/escola/${escola.escola_id}`)}
                      >
                        <td className="py-2.5 font-medium text-foreground">{escola.escola_nome}</td>
                        <td className="py-2.5">
                          <QesBadge qes={escola.qes_medio} showValue />
                        </td>
                        <td className="py-2.5 text-muted-foreground">{escola.total_alunos}</td>
                        <td className="py-2.5">
                          <span style={{ color: emRiscoPct > 20 ? "#C62828" : undefined }}>
                            {emRisco} ({emRiscoPct.toFixed(0)}%)
                          </span>
                        </td>
                        <td className="py-2.5">
                          <span
                            style={{
                              color: escola.taxa_loop_media >= 60 ? "#2E7D32" : escola.taxa_loop_media < 40 ? "#C62828" : undefined,
                            }}
                          >
                            {escola.taxa_loop_media.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {sortedEscolas.length === 0 && (
                <EmptyState
                  icon={Users}
                  title="Nenhuma escola cadastrada"
                  description="As escolas piloto aparecerão aqui quando forem configuradas."
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Section 3: Alerts */}
      {loading ? (
        <LoadingSkeleton variant="table" count={3} />
      ) : (
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-base font-semibold text-foreground">Alertas Ativos</h2>
            {alertCount > 0 && (
              <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-bold text-destructive-foreground">
                {alertCount}
              </span>
            )}
          </div>

          {alertasRecentes.length > 0 ? (
            <div className="space-y-3">
              {alertasRecentes.map((alerta, i) => (
                <AlertCard
                  key={i}
                  alunoNome={alerta.aluno_nome}
                  turmaNome={alerta.turma_nome}
                  qesTotal={alerta.qes_total}
                  qesFaixa={alerta.qes_faixa}
                  tipoAlerta={alerta.tipo_alerta}
                  severidade={alerta.severidade}
                  acaoSugerida={alerta.acao_sugerida}
                />
              ))}
              {alertCount > 10 && (
                <button
                  onClick={() => navigate("/alertas")}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Ver todos ({alertCount})
                </button>
              )}
            </div>
          ) : (
            <EmptyState
              icon={CheckCircle}
              title="Nenhum alerta ativo"
              description="Tudo sob controle."
              iconColor="#2E7D32"
            />
          )}
        </div>
      )}
    </div>
  );
}
