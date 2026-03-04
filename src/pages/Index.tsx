import { useEffect, useMemo, useState } from "react";
import { Users, TrendingUp, AlertTriangle, RefreshCw, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseQuery } from "@/hooks/useSupabaseQuery";
import type { DashboardEscola, DashboardAlerta, DashboardTurma } from "@/types/dashboard";
import { StatCard } from "@/components/StatCard";
import { QesBadge } from "@/components/QesBadge";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { getQesFaixa, getQesColor } from "@/lib/qes";
import { LiveHeader } from "@/components/dashboard/LiveHeader";
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { TodayCard } from "@/components/dashboard/TodayCard";
import { CohortRetention } from "@/components/dashboard/CohortRetention";
import { CriticalAlerts } from "@/components/dashboard/CriticalAlerts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DailyActivity {
  data: string;
  sessoes: number;
  loops: number;
}

function formatDayLabel(dateStr: string, isToday: boolean): string {
  if (isToday) return "Hoje";
  const [, m, d] = dateStr.split("-");
  return `${d}/${m}`;
}

export default function VisaoGeral() {
  const navigate = useNavigate();
  const [selectedSerie, setSelectedSerie] = useState<string>("todas");

  // Existing queries
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

  const {
    data: turmas,
    loading: loadingTurmas,
  } = useSupabaseQuery<DashboardTurma>("v_dashboard_turma");

  // Activity data (last 14 days)
  const [activityData, setActivityData] = useState<DailyActivity[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(true);

  // Cohort retention data
  const [cohortWeeks, setCohortWeeks] = useState<
    { label: string; active: number; total: number; pct: number }[]
  >([]);
  const [loadingCohort, setLoadingCohort] = useState(true);

  useEffect(() => {
    async function fetchActivity() {
      setLoadingActivity(true);
      try {
        const today = new Date();
        const start = new Date(today);
        start.setDate(start.getDate() - 13);
        const startStr = start.toISOString().slice(0, 10);

        const { data } = await (supabase as any)
          .from("sessoes")
          .select("data, loops_iniciados, loops_completos")
          .gte("data", startStr);

        // Group by day
        const map: Record<string, { sessoes: number; loops: number }> = {};
        for (let i = 0; i < 14; i++) {
          const d = new Date(today);
          d.setDate(d.getDate() - (13 - i));
          const key = d.toISOString().slice(0, 10);
          map[key] = { sessoes: 0, loops: 0 };
        }
        (data || []).forEach((row: any) => {
          const key = typeof row.data === "string" ? row.data : String(row.data);
          if (map[key]) {
            map[key].sessoes += (row.loops_iniciados || 0) + (row.loops_completos || 0);
            map[key].loops += row.loops_completos || 0;
          }
        });

        setActivityData(
          Object.entries(map).map(([date, v]) => ({ data: date, ...v }))
        );
      } catch {
        // fallback empty
      } finally {
        setLoadingActivity(false);
      }
    }

    async function fetchCohort() {
      setLoadingCohort(true);
      try {
        // Get all students
        const { data: alunos } = await (supabase as any)
          .from("alunos")
          .select("id, created_at");

        // Get all sessions
        const { data: sessoes } = await (supabase as any)
          .from("sessoes")
          .select("aluno_id, data");

        if (!alunos || alunos.length === 0) {
          setCohortWeeks([]);
          return;
        }

        // Find the earliest student created_at as the pilot start
        const dates = alunos.map((a: any) =>
          new Date(a.created_at).getTime()
        );
        const pilotStart = new Date(Math.min(...dates));
        // Align to Monday
        const dayOfWeek = pilotStart.getDay();
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const weekStart = new Date(pilotStart);
        weekStart.setDate(weekStart.getDate() + mondayOffset);
        weekStart.setHours(0, 0, 0, 0);

        // Get initial cohort (all students)
        const cohortIds = new Set(alunos.map((a: any) => a.id));
        const totalCohort = cohortIds.size;

        // Build session lookup: aluno_id -> set of dates
        const sessionMap: Record<string, Set<string>> = {};
        (sessoes || []).forEach((s: any) => {
          if (!sessionMap[s.aluno_id]) sessionMap[s.aluno_id] = new Set();
          sessionMap[s.aluno_id].add(
            typeof s.data === "string" ? s.data : String(s.data)
          );
        });

        // Calculate weeks
        const today = new Date();
        const weeks: { label: string; active: number; total: number; pct: number }[] =
          [];

        for (let w = 0; w < 12; w++) {
          const wStart = new Date(weekStart);
          wStart.setDate(wStart.getDate() + w * 7);
          const wEnd = new Date(wStart);
          wEnd.setDate(wEnd.getDate() + 6);

          if (wStart > today) break;

          // Count students with at least 1 session in this week
          let active = 0;
          cohortIds.forEach((id) => {
            const sessions = sessionMap[id as string];
            if (!sessions) return;
            for (const dateStr of sessions) {
              const d = new Date(dateStr);
              if (d >= wStart && d <= wEnd) {
                active++;
                break;
              }
            }
          });

          weeks.push({
            label: `Sem ${w + 1}`,
            active,
            total: totalCohort,
            pct: totalCohort > 0 ? (active / totalCohort) * 100 : 0,
          });
        }

        setCohortWeeks(weeks);
      } catch {
        // fallback
      } finally {
        setLoadingCohort(false);
      }
    }

    fetchActivity();
    fetchCohort();
  }, []);

  const loading = loadingEscolas || loadingAlertas || loadingTurmas;
  const error = errorEscolas || errorAlertas;

  // Derive available séries from turmas
  const availableSeries = useMemo(() => {
    if (!turmas) return [];
    const set = new Set(turmas.map((t) => t.serie));
    return Array.from(set).sort();
  }, [turmas]);

  // Filter turmas by selected série
  const filteredTurmas = useMemo(() => {
    if (!turmas) return [];
    if (selectedSerie === "todas") return turmas;
    return turmas.filter((t) => t.serie === selectedSerie);
  }, [turmas, selectedSerie]);

  // When filtering by série, aggregate from turmas instead of escolas
  const isFiltered = selectedSerie !== "todas";

  const totalAlunos = isFiltered
    ? filteredTurmas.reduce((s, t) => s + (t.total_alunos || 0), 0)
    : escolas?.reduce((s, e) => s + e.total_alunos, 0) || 0;

  const filteredEscolaNames = useMemo(() => {
    if (!isFiltered) return new Set(escolas?.map((e) => e.escola_nome) || []);
    return new Set(filteredTurmas.map((t) => t.escola_nome));
  }, [isFiltered, escolas, filteredTurmas]);

  const totalEscolas = filteredEscolaNames.size;

  const qesMedio = isFiltered
    ? filteredTurmas.length > 0 && totalAlunos > 0
      ? filteredTurmas.reduce((s, t) => s + (t.qes_medio || 0) * (t.total_alunos || 0), 0) / totalAlunos
      : 0
    : escolas && escolas.length > 0 && totalAlunos > 0
      ? escolas.reduce((s, e) => s + e.qes_medio * e.total_alunos, 0) / totalAlunos
      : 0;

  const taxaLoopMedia = isFiltered
    ? filteredTurmas.length > 0
      ? filteredTurmas.reduce((s, t) => s + (((t as any).taxa_loop_media) || 0), 0) / filteredTurmas.length
      : 0
    : escolas && escolas.length > 0
      ? escolas.reduce((s, e) => s + e.taxa_loop_media, 0) / escolas.length
      : 0;

  // Filter alertas by turma_nome when série is selected
  const filteredAlertas = useMemo(() => {
    if (!alertas) return [];
    if (!isFiltered) return alertas;
    const turmaNames = new Set(filteredTurmas.map((t) => t.turma_nome));
    return alertas.filter((a) => turmaNames.has(a.turma_nome));
  }, [alertas, isFiltered, filteredTurmas]);

  const alertCount = filteredAlertas.length;
  const alertAlto = filteredAlertas.filter((a) => a.severidade === "alto").length;

  // Schools: when filtered, build from turmas grouped by escola
  const sortedEscolas = useMemo(() => {
    if (!isFiltered) {
      return escolas ? [...escolas].sort((a, b) => a.qes_medio - b.qes_medio) : [];
    }
    const map: Record<string, DashboardEscola> = {};
    filteredTurmas.forEach((t) => {
      const key = t.escola_nome;
      if (!map[key]) {
        const orig = escolas?.find((e) => e.escola_nome === key);
        map[key] = {
          escola_id: orig?.escola_id || key,
          escola_nome: key,
          total_alunos: 0,
          qes_medio: 0,
          alunos_criticos: 0,
          alunos_superficiais: 0,
          alunos_recorrentes: 0,
          alunos_engajados: 0,
          alunos_profundos: 0,
          taxa_loop_media: 0,
        };
      }
      map[key].total_alunos += t.total_alunos || 0;
    });
    Object.values(map).forEach((e) => {
      const relevantTurmas = filteredTurmas.filter((t) => t.escola_nome === e.escola_nome);
      if (e.total_alunos > 0) {
        e.qes_medio = relevantTurmas.reduce((s, t) => s + (t.qes_medio || 0) * (t.total_alunos || 0), 0) / e.total_alunos;
      }
    });
    return Object.values(map).sort((a, b) => a.qes_medio - b.qes_medio);
  }, [isFiltered, escolas, filteredTurmas]);

  // Activity chart data
  const todayStr = new Date().toISOString().slice(0, 10);
  const chartData = activityData.map((d) => ({
    label: formatDayLabel(d.data, d.data === todayStr),
    sessoes: d.sessoes,
    loops: d.loops,
    isToday: d.data === todayStr,
  }));

  const todayData = activityData.find((d) => d.data === todayStr);
  const todaySessoes = todayData?.sessoes || 0;
  const todayLoops = todayData?.loops || 0;

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={() => {
          refetchEscolas();
          refetchAlertas();
        }}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <LiveHeader />

      {/* Filter bar */}
      <div className="flex items-center gap-3">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">Filtrar por série:</span>
        <Select value={selectedSerie} onValueChange={setSelectedSerie}>
          <SelectTrigger className="w-[180px] h-9 text-sm">
            <SelectValue placeholder="Todas as séries" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as séries</SelectItem>
            {availableSeries.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isFiltered && (
          <button
            onClick={() => setSelectedSerie("todas")}
            className="text-xs text-muted-foreground hover:text-foreground underline"
          >
            Limpar filtro
          </button>
        )}
      </div>

      {/* Linha 1 — KPI Cards */}
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
            iconColor="#DC2626"
            borderColor={alertCount > 0 ? "#DC2626" : undefined}
          />
          <StatCard
            title="Taxa Loop Completo"
            value={`${taxaLoopMedia.toFixed(1)}%`}
            subtitle="meta: >60%"
            icon={RefreshCw}
            valueColor={taxaLoopMedia < 60 ? "#DC2626" : undefined}
            borderColor={taxaLoopMedia < 60 ? "#DC2626" : undefined}
          />
        </div>
      )}

      {/* Linha 2 — Activity Chart + Today */}
      {loadingActivity ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <LoadingSkeleton variant="chart" />
          </div>
          <LoadingSkeleton variant="card" count={1} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ActivityChart data={chartData} />
          </div>
          <TodayCard sessoes={todaySessoes} loops={todayLoops} />
        </div>
      )}

      {/* Linha 3 — Schools Table + Cohort Retention */}
      {loading || loadingCohort ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <LoadingSkeleton variant="table" count={4} />
          <LoadingSkeleton variant="chart" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Schools Table */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-base font-semibold text-foreground mb-4">
              Escolas Piloto
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-2 font-medium text-muted-foreground">Escola</th>
                    <th className="pb-2 font-medium text-muted-foreground">QES</th>
                    <th className="pb-2 font-medium text-muted-foreground">Alunos</th>
                    <th className="pb-2 font-medium text-muted-foreground">Em Risco</th>
                    <th className="pb-2 font-medium text-muted-foreground">Loop %</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedEscolas.map((escola) => {
                    const emRisco =
                      escola.alunos_criticos + escola.alunos_superficiais;
                    const emRiscoPct =
                      escola.total_alunos > 0
                        ? (emRisco / escola.total_alunos) * 100
                        : 0;
                    return (
                      <tr
                        key={escola.escola_id}
                        className="border-b border-border last:border-0 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => navigate(`/escola/${escola.escola_id}`)}
                      >
                        <td className="py-2.5 font-medium text-foreground">
                          {escola.escola_nome}
                        </td>
                        <td className="py-2.5">
                          <QesBadge qes={escola.qes_medio} showValue />
                        </td>
                        <td className="py-2.5 text-muted-foreground">
                          {escola.total_alunos}
                        </td>
                        <td className="py-2.5">
                          <span
                            style={{
                              color: emRiscoPct >= 40 ? "#DC2626" : undefined,
                              fontWeight: emRiscoPct >= 40 ? 600 : 400,
                            }}
                          >
                            {emRisco} ({emRiscoPct.toFixed(0)}%)
                          </span>
                        </td>
                        <td className="py-2.5">
                          <span
                            style={{
                              color:
                                escola.taxa_loop_media >= 50
                                  ? "#16A34A"
                                  : "#DC2626",
                              fontWeight: 600,
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

          {/* Cohort Retention */}
          {cohortWeeks.length > 0 ? (
            <CohortRetention weeks={cohortWeeks} />
          ) : (
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex items-center justify-center">
              <EmptyState
                icon={Users}
                title="Sem dados de cohort"
                description="Dados de retenção aparecerão quando houver sessões registradas."
              />
            </div>
          )}
        </div>
      )}

      {/* Linha 4 — Critical Alerts */}
      {loading ? (
        <LoadingSkeleton variant="table" count={3} />
      ) : alertas && alertas.length > 0 ? (
        <CriticalAlerts alertas={alertas} />
      ) : (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <EmptyState
            icon={AlertTriangle}
            title="Nenhum alerta ativo"
            description="Tudo sob controle."
            iconColor="#16A34A"
          />
        </div>
      )}
    </div>
  );
}
