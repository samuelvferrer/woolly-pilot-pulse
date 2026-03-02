import { useState, useMemo } from "react";
import { AlertTriangle, Clock, TrendingUp, ArrowDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/StatCard";
import {
  funnelData,
  durationDistribution,
  weeklyConversionRates,
  loopByEscolaridade,
  loopByObjetivo,
  etapaMetrics,
  alunoComparison,
  alunosDetalhados,
} from "@/mocks/loopData";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, ReferenceLine, Cell,
} from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const ESCOLARIDADES = ["6° ano", "7° ano", "8° ano", "9° ano", "1° EM", "2° EM", "3° EM", "Graduado"];
const OBJETIVOS = ["Revisar um assunto", "Aprender algo novo"];

export default function AnaliseLoop() {
  const [periodo, setPeriodo] = useState("30 dias");
  const [escolaridade, setEscolaridade] = useState<string[]>([]);
  const [objetivo, setObjetivo] = useState<string[]>([]);

  // Filter alunos based on selections
  const alunosFiltrados = useMemo(() => {
    return alunosDetalhados.filter((a) => {
      if (escolaridade.length > 0 && !escolaridade.includes(a.escolaridade)) return false;
      if (objetivo.length > 0 && !objetivo.includes(a.objetivo)) return false;
      return true;
    });
  }, [escolaridade, objetivo]);

  // Find biggest drop-off
  const biggestDrop = useMemo(() => {
    let maxDrop = 0;
    let from = "";
    let to = "";
    let pct = 0;
    for (let i = 0; i < funnelData.length - 1; i++) {
      const drop = funnelData[i].contagem - funnelData[i + 1].contagem;
      const dropPct = (drop / funnelData[i].contagem) * 100;
      if (dropPct > maxDrop) {
        maxDrop = dropPct;
        from = funnelData[i].etapa;
        to = funnelData[i + 1].etapa;
        pct = dropPct;
      }
    }
    return { from, to, pct };
  }, []);

  const totalConversas = funnelData[0].contagem;
  const durationTotal = durationDistribution.reduce((s, d) => s + d.contagem, 0);
  const pctMenor3 = (((durationDistribution[0].contagem + durationDistribution[1].contagem) / durationTotal) * 100).toFixed(1);
  const pctMaior8 = (((durationDistribution[4].contagem + durationDistribution[5].contagem) / durationTotal) * 100).toFixed(1);
  const duracaoMedia = "4.2 min";

  const toggleFilter = (arr: string[], val: string, set: (v: string[]) => void) => {
    set(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Demo banner */}
      <div className="rounded-lg border px-4 py-2 text-sm" style={{ backgroundColor: "#FFFBEB", borderColor: "#FDE68A", color: "#92400E" }}>
        ⚠️ Dados de demonstração — Conecte o Supabase para ver dados reais
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <Select value={periodo} onValueChange={setPeriodo}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {["7 dias", "14 dias", "30 dias", "Todo o período"].map((p) => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex flex-wrap gap-1">
          {ESCOLARIDADES.map((e) => (
            <Badge
              key={e}
              variant={escolaridade.includes(e) ? "default" : "outline"}
              className="cursor-pointer text-xs"
              onClick={() => toggleFilter(escolaridade, e, setEscolaridade)}
            >
              {e}
            </Badge>
          ))}
        </div>

        <div className="flex flex-wrap gap-1">
          {OBJETIVOS.map((o) => (
            <Badge
              key={o}
              variant={objetivo.includes(o) ? "default" : "outline"}
              className="cursor-pointer text-xs"
              onClick={() => toggleFilter(objetivo, o, setObjetivo)}
            >
              {o}
            </Badge>
          ))}
        </div>
      </div>

      {/* Seção 1: Funil */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Funil do Active Learning Loop</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 overflow-x-auto pb-4">
            {funnelData.map((step, i) => {
              const pctAnterior = i > 0 ? ((step.contagem / funnelData[i - 1].contagem) * 100).toFixed(1) : "100";
              const pctTotal = ((step.contagem / totalConversas) * 100).toFixed(1);
              const dropoff = i > 0 ? (100 - parseFloat(pctAnterior)).toFixed(1) : null;
              const barH = Math.max(40, (step.contagem / totalConversas) * 200);

              return (
                <div key={step.etapa} className="flex items-end gap-1 flex-1 min-w-[120px]">
                  {i > 0 && (
                    <div className="flex flex-col items-center mb-2 text-xs shrink-0">
                      <ArrowDown size={14} className="text-destructive" />
                      <span className="font-semibold text-destructive whitespace-nowrap">⬇ {dropoff}%</span>
                    </div>
                  )}
                  <div className="flex flex-col items-center flex-1">
                    <span className="text-2xl font-bold" style={{ color: step.cor }}>{step.contagem.toLocaleString()}</span>
                    <div className="rounded-t-md w-full" style={{ backgroundColor: step.cor, height: barH, opacity: 0.85 }} />
                    <span className="text-xs font-medium mt-1 text-center">{step.etapa}</span>
                    <span className="text-[10px] text-muted-foreground">{pctAnterior}% da anterior</span>
                    <span className="text-[10px] text-muted-foreground">{pctTotal}% do total</span>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-sm mt-4 p-3 rounded-lg bg-muted">
            O maior drop-off está entre <strong>{biggestDrop.from}</strong> e <strong>{biggestDrop.to}</strong>:{" "}
            <span className="text-destructive font-bold">{biggestDrop.pct.toFixed(1)}%</span> dos alunos são perdidos nesta transição.
          </p>
        </CardContent>
      </Card>

      {/* Seção 2: Distribuição de Duração */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardHeader><CardTitle className="text-lg">Distribuição de Duração</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={durationDistribution}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="faixa" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => [`${v} (${((v / durationTotal) * 100).toFixed(1)}%)`, "Conversas"]} />
                <ReferenceLine x="3-5 min" stroke="#C62828" strokeDasharray="6 4" label={{ value: "Mín. proficiência", position: "top", fill: "#C62828", fontSize: 11 }} />
                <Bar dataKey="contagem" radius={[4, 4, 0, 0]}>
                  {durationDistribution.map((d, i) => (
                    <Cell key={i} fill={d.cor} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <StatCard title="Duração Média" value={duracaoMedia} icon={Clock} iconColor="#1976D2" />
          <StatCard
            title="% Conversas < 3 min"
            value={`${pctMenor3}%`}
            icon={AlertTriangle}
            iconColor="#C62828"
            valueColor={parseFloat(pctMenor3) > 50 ? "#C62828" : undefined}
          />
          <StatCard
            title="% Conversas > 8 min"
            value={`${pctMaior8}%`}
            icon={TrendingUp}
            iconColor="#2E7D32"
            valueColor={parseFloat(pctMaior8) > 20 ? "#2E7D32" : undefined}
          />
        </div>
      </div>

      {/* Seção 3: Conversão ao longo do tempo */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Taxas de Conversão ao Longo do Tempo</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyConversionRates}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="semana" tick={{ fontSize: 12 }} />
              <YAxis unit="%" tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: number) => `${v}%`} />
              <Legend />
              <Line type="monotone" dataKey="conversas3min" name="Conversas > 3 min" stroke="#F4A940" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="comProficiencia" name="Com proficiência" stroke="#2E7D32" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="comResumo" name="Com resumo" stroke="#1976D2" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="comQuiz" name="Com quiz" stroke="#7B1FA2" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Seção 4: Loop por Segmento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SegmentChart title="Por Escolaridade" data={loopByEscolaridade} />
        <SegmentChart title="Por Objetivo" data={loopByObjetivo} />
      </div>

      {/* Seção 5: Métricas por Etapa */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Conversa" borderColor="#E8820C">
          <Metric label="Mediana de duração" value={etapaMetrics.conversa.medianaDuracao} />
          <Metric label="% > 3 min" value={`${etapaMetrics.conversa.pctMaior3min}%`} />
        </MetricCard>
        <MetricCard title="Proficiência" borderColor="#2E7D32">
          <Metric label="Taxa de geração" value={`${etapaMetrics.proficiencia.taxaGeracao}% das conversas`} />
          <div className="flex gap-1 mt-2 flex-wrap">
            {etapaMetrics.proficiencia.distribuicao.map((d) => (
              <span key={d.nivel} className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: d.cor + "22", color: d.cor }}>
                {d.nivel} {d.pct}%
              </span>
            ))}
          </div>
        </MetricCard>
        <MetricCard title="Resumo" borderColor="#1976D2">
          <Metric label="Taxa de geração" value={`${etapaMetrics.resumo.taxaGeracao}% das conversas`} />
          <Metric label="Completos" value={`${etapaMetrics.resumo.pctComplete}%`} />
          <Metric label="Falhos" value={`${etapaMetrics.resumo.pctFailed}%`} />
        </MetricCard>
        <MetricCard title="Quiz" borderColor="#7B1FA2">
          <Metric label="Taxa de geração" value={`${etapaMetrics.quiz.taxaGeracao}% das conversas`} />
          <Metric label="Completed" value={`${etapaMetrics.quiz.pctCompleted}%`} />
          <Metric label="Abandonados" value={`${etapaMetrics.quiz.pctStarted}%`} />
        </MetricCard>
      </div>

      {/* Comparação loop completo vs não */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Quem completa o loop vs quem não completa</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <ComparisonCol label="Completa o Loop" data={alunoComparison.completaLoop} highlight />
            <ComparisonCol label="Não completa" data={alunoComparison.naoCompleta} />
          </div>
        </CardContent>
      </Card>

      {/* Tabela de alunos */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Alunos Detalhados ({alunosFiltrados.length})</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aluno</TableHead>
                <TableHead>Escolaridade</TableHead>
                <TableHead>Objetivo</TableHead>
                <TableHead className="text-right">Conversas</TableHead>
                <TableHead className="text-right">Dur. Média</TableHead>
                <TableHead>Prof.</TableHead>
                <TableHead>Resumo</TableHead>
                <TableHead>Quiz</TableHead>
                <TableHead>Loop</TableHead>
                <TableHead className="text-right">XP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alunosFiltrados.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.apelido}</TableCell>
                  <TableCell>{a.escolaridade}</TableCell>
                  <TableCell className="text-xs">{a.objetivo}</TableCell>
                  <TableCell className="text-right">{a.conversas}</TableCell>
                  <TableCell className="text-right">{a.durMediaMin} min</TableCell>
                  <TableCell>{a.comProficiencia ? "✅" : "❌"}</TableCell>
                  <TableCell>{a.comResumo ? "✅" : "❌"}</TableCell>
                  <TableCell>{a.comQuiz ? "✅" : "❌"}</TableCell>
                  <TableCell>
                    <Badge variant={a.loopCompleto ? "default" : "outline"} className="text-xs">
                      {a.loopCompleto ? "Completo" : "Parcial"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">{a.xpTotal}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Sub-components ───

function SegmentChart({ title, data }: { title: string; data: typeof loopByEscolaridade }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-lg">{title}</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={data.length * 40 + 40}>
          <BarChart data={data} layout="vertical" margin={{ left: 80 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis dataKey="segmento" type="category" tick={{ fontSize: 11 }} width={75} />
            <Tooltip />
            <Bar dataKey="soConversa" stackId="a" fill="#9E9E9E" name="Só conversa" />
            <Bar dataKey="comProficiencia" stackId="a" fill="#2E7D32" name="Com proficiência" />
            <Bar dataKey="comResumo" stackId="a" fill="#1976D2" name="Com resumo" />
            <Bar dataKey="comQuiz" stackId="a" fill="#7B1FA2" name="Com quiz" radius={[0, 4, 4, 0]} />
            <Legend />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function MetricCard({ title, borderColor, children }: { title: string; borderColor: string; children: React.ReactNode }) {
  return (
    <Card style={{ borderTopWidth: 3, borderTopColor: borderColor }}>
      <CardHeader className="pb-2"><CardTitle className="text-sm">{title}</CardTitle></CardHeader>
      <CardContent className="space-y-1">{children}</CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function ComparisonCol({ label, data, highlight }: { label: string; data: typeof alunoComparison.completaLoop; highlight?: boolean }) {
  return (
    <div className={`rounded-lg p-4 space-y-2 ${highlight ? "bg-primary/5 border border-primary/20" : "bg-muted/50"}`}>
      <h4 className="font-semibold text-sm">{label} <span className="text-muted-foreground font-normal">({data.qtd} alunos)</span></h4>
      <Metric label="Duração média" value={`${data.duracaoMedia} min`} />
      <Metric label="Sessões/semana" value={`${data.sessoesSemana}`} />
      <Metric label="XP médio" value={`${data.xpMedio}`} />
      <Metric label="Retenção 7d" value={`${data.retencao7d}%`} />
    </div>
  );
}
