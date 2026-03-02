// Mock data for Inteligência screen — Sections 1, 2, 3
// Replace with Supabase queries when connected

// ─── SECTION 1: Cohort Retention ───

export interface CohortRow {
  weekLabel: string;
  totalAlunos: number;
  retentionByWeek: number[]; // percentages, index 0 = week 0
}

// 10 cohorts, up to 10 weeks of retention
export const cohortData: CohortRow[] = [
  { weekLabel: "Sem. 06/01", totalAlunos: 45, retentionByWeek: [100, 62, 49, 38, 31, 27, 22, 20, 18, 16] },
  { weekLabel: "Sem. 13/01", totalAlunos: 52, retentionByWeek: [100, 58, 44, 35, 28, 24, 21, 18, 15] },
  { weekLabel: "Sem. 20/01", totalAlunos: 38, retentionByWeek: [100, 55, 42, 34, 29, 25, 20, 17] },
  { weekLabel: "Sem. 27/01", totalAlunos: 61, retentionByWeek: [100, 64, 51, 42, 36, 30, 26] },
  { weekLabel: "Sem. 03/02", totalAlunos: 47, retentionByWeek: [100, 60, 47, 38, 32, 28] },
  { weekLabel: "Sem. 10/02", totalAlunos: 55, retentionByWeek: [100, 67, 54, 45, 38] },
  { weekLabel: "Sem. 17/02", totalAlunos: 42, retentionByWeek: [100, 57, 43, 35] },
  { weekLabel: "Sem. 24/02", totalAlunos: 68, retentionByWeek: [100, 63, 50] },
  { weekLabel: "Sem. 03/03", totalAlunos: 50, retentionByWeek: [100, 66] },
  { weekLabel: "Sem. 10/03", totalAlunos: 58, retentionByWeek: [100] },
];

// ─── SECTION 2: Usage Heatmap (hora x dia da semana) ───

export interface UsageCell {
  day: string;   // Seg, Ter, ...
  hour: number;  // 6..23
  count: number;
}

const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const hours = Array.from({ length: 18 }, (_, i) => i + 6); // 6 to 23

// Realistic pattern: peak on weekdays 19-21h, low on weekends morning
function generateUsageHeatmap(): UsageCell[] {
  const cells: UsageCell[] = [];
  for (const day of days) {
    const isWeekend = day === "Sáb" || day === "Dom";
    for (const hour of hours) {
      let base = 10;
      // Afternoon bump (contraturno)
      if (hour >= 14 && hour <= 17) base = isWeekend ? 25 : 55;
      // Evening peak
      if (hour >= 18 && hour <= 21) base = isWeekend ? 40 : 95;
      if (hour === 20) base = isWeekend ? 55 : 140;
      // Night
      if (hour >= 22) base = isWeekend ? 15 : 25;
      // Morning low
      if (hour >= 6 && hour <= 10) base = isWeekend ? 5 : 15;
      // School hours
      if (hour >= 7 && hour <= 12 && !isWeekend) base = 20;
      // Add noise
      const noise = Math.round((Math.random() - 0.5) * base * 0.4);
      cells.push({ day, hour, count: Math.max(0, base + noise) });
    }
  }
  return cells;
}

export const usageHeatmapData: UsageCell[] = generateUsageHeatmap();

// ─── SECTION 3: Activation Funnel ───

export interface ActivationStep {
  etapa: string;
  contagem: number;
  cor: string;
}

export const activationFunnelData: ActivationStep[] = [
  { etapa: "Conta criada", contagem: 516, cor: "#78909C" },
  { etapa: "Primeira conversa", contagem: 438, cor: "#E8820C" },
  { etapa: "Conversa > 3 min", contagem: 195, cor: "#F4A940" },
  { etapa: "Retornou (2+ conv.)", contagem: 267, cor: "#2E7D32" },
  { etapa: "Hábito (5+ conv.)", contagem: 112, cor: "#1B5E20" },
];

export interface ConversationBucket {
  faixa: string;
  contagem: number;
  isHighlight: boolean; // highlight "1 conversa" in red
}

export const conversationDistribution: ConversationBucket[] = [
  { faixa: "1", contagem: 171, isHighlight: true },
  { faixa: "2", contagem: 78, isHighlight: false },
  { faixa: "3", contagem: 55, isHighlight: false },
  { faixa: "4", contagem: 34, isHighlight: false },
  { faixa: "5", contagem: 28, isHighlight: false },
  { faixa: "6-10", contagem: 42, isHighlight: false },
  { faixa: "11-20", contagem: 22, isHighlight: false },
  { faixa: "20+", contagem: 8, isHighlight: false },
];

export const timeToFirstValue = 18.4; // hours

// ─── SECTION 4: Subject & Topic Analysis ───

export interface MateriaData {
  materia: string;
  conversas: number;
  duracaoMedia: number; // minutos
  pctComProficiencia: number;
  proficiencia: { iniciante: number; mediano: number; avancado: number; master: number };
}

export const materiaData: MateriaData[] = [
  { materia: "Matemática", conversas: 520, duracaoMedia: 5.2, pctComProficiencia: 38, proficiencia: { iniciante: 210, mediano: 95, avancado: 85, master: 28 } },
  { materia: "Português", conversas: 410, duracaoMedia: 4.8, pctComProficiencia: 35, proficiencia: { iniciante: 155, mediano: 80, avancado: 72, master: 22 } },
  { materia: "História", conversas: 340, duracaoMedia: 5.5, pctComProficiencia: 40, proficiencia: { iniciante: 100, mediano: 88, avancado: 90, master: 30 } },
  { materia: "Ciências", conversas: 280, duracaoMedia: 4.1, pctComProficiencia: 32, proficiencia: { iniciante: 120, mediano: 60, avancado: 55, master: 15 } },
  { materia: "Geografia", conversas: 240, duracaoMedia: 4.5, pctComProficiencia: 36, proficiencia: { iniciante: 85, mediano: 55, avancado: 50, master: 14 } },
  { materia: "Física", conversas: 200, duracaoMedia: 5.8, pctComProficiencia: 30, proficiencia: { iniciante: 95, mediano: 40, avancado: 35, master: 10 } },
  { materia: "Química", conversas: 185, duracaoMedia: 5.0, pctComProficiencia: 28, proficiencia: { iniciante: 88, mediano: 38, avancado: 32, master: 8 } },
  { materia: "Biologia", conversas: 170, duracaoMedia: 4.3, pctComProficiencia: 34, proficiencia: { iniciante: 65, mediano: 40, avancado: 38, master: 12 } },
  { materia: "Inglês", conversas: 150, duracaoMedia: 3.8, pctComProficiencia: 42, proficiencia: { iniciante: 40, mediano: 35, avancado: 42, master: 18 } },
  { materia: "Filosofia", conversas: 120, duracaoMedia: 6.1, pctComProficiencia: 45, proficiencia: { iniciante: 30, mediano: 28, avancado: 35, master: 15 } },
];

export interface AssuntoData {
  assunto: string;
  materia: string;
  conversas: number;
  duracaoMedia: number;
  pctComProficiencia: number;
  proficienciaMaisComum: string;
}

export const topAssuntos: AssuntoData[] = [
  { assunto: "Equações do 2° grau", materia: "Matemática", conversas: 95, duracaoMedia: 5.8, pctComProficiencia: 42, proficienciaMaisComum: "Mediano" },
  { assunto: "Interpretação de texto", materia: "Português", conversas: 88, duracaoMedia: 4.5, pctComProficiencia: 38, proficienciaMaisComum: "Iniciante" },
  { assunto: "Revolução Francesa", materia: "História", conversas: 76, duracaoMedia: 6.2, pctComProficiencia: 48, proficienciaMaisComum: "Avançado" },
  { assunto: "Frações e decimais", materia: "Matemática", conversas: 72, duracaoMedia: 4.2, pctComProficiencia: 35, proficienciaMaisComum: "Iniciante" },
  { assunto: "Células e organelas", materia: "Biologia", conversas: 65, duracaoMedia: 5.1, pctComProficiencia: 40, proficienciaMaisComum: "Mediano" },
  { assunto: "Leis de Newton", materia: "Física", conversas: 60, duracaoMedia: 6.5, pctComProficiencia: 32, proficienciaMaisComum: "Iniciante" },
  { assunto: "Clima e vegetação", materia: "Geografia", conversas: 55, duracaoMedia: 4.8, pctComProficiencia: 44, proficienciaMaisComum: "Avançado" },
  { assunto: "Tabela periódica", materia: "Química", conversas: 52, duracaoMedia: 5.3, pctComProficiencia: 30, proficienciaMaisComum: "Iniciante" },
  { assunto: "Verbos irregulares", materia: "Inglês", conversas: 48, duracaoMedia: 3.5, pctComProficiencia: 50, proficienciaMaisComum: "Avançado" },
  { assunto: "Figuras de linguagem", materia: "Português", conversas: 45, duracaoMedia: 4.0, pctComProficiencia: 36, proficienciaMaisComum: "Mediano" },
  { assunto: "Função afim", materia: "Matemática", conversas: 42, duracaoMedia: 5.5, pctComProficiencia: 38, proficienciaMaisComum: "Mediano" },
  { assunto: "Era Vargas", materia: "História", conversas: 40, duracaoMedia: 5.8, pctComProficiencia: 45, proficienciaMaisComum: "Avançado" },
  { assunto: "Reações químicas", materia: "Química", conversas: 38, duracaoMedia: 5.0, pctComProficiencia: 28, proficienciaMaisComum: "Iniciante" },
  { assunto: "Ética e moral", materia: "Filosofia", conversas: 35, duracaoMedia: 6.8, pctComProficiencia: 52, proficienciaMaisComum: "Avançado" },
  { assunto: "Genética básica", materia: "Biologia", conversas: 33, duracaoMedia: 5.2, pctComProficiencia: 36, proficienciaMaisComum: "Mediano" },
];

// ─── SECTION 5: Short Conversations Diagnosis ───

export interface ShortConvProfile {
  label: string;
  count: number;
  color: string;
}

export const shortConvProfiles: ShortConvProfile[] = [
  { label: "Alunos recorrentes (3+ curtas)", count: 85, color: "#C62828" },
  { label: "Alunos únicos (1-2 curtas)", count: 210, color: "#F9A825" },
  { label: "Primeira conversa do aluno", count: 145, color: "#78909C" },
];

export interface DailyConvTrend {
  dia: string;
  total: number;
  curtas: number;
}

function generateDailyTrend(): DailyConvTrend[] {
  const data: DailyConvTrend[] = [];
  const start = new Date("2025-02-01");
  for (let i = 0; i < 30; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const base = isWeekend ? 60 : 110;
    const total = base + Math.round((Math.random() - 0.5) * 30);
    const curtas = Math.round(total * (0.45 + Math.random() * 0.15));
    data.push({
      dia: `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`,
      total,
      curtas,
    });
  }
  return data;
}

export const dailyConvTrend: DailyConvTrend[] = generateDailyTrend();

export const shortConvInsights = {
  pctCurtas: 50.2,
  alunosSoCurtas: 62,
  pctPrimeiraConversa: 33.0,
};

// ─── SECTION 7: Proficiency Evolution ───

export interface ProficiencyWeek {
  semana: string;
  iniciante: number;
  mediano: number;
  avancado: number;
  master: number;
}

export const proficiencyEvolution: ProficiencyWeek[] = [
  { semana: "Sem 1", iniciante: 55, mediano: 22, avancado: 18, master: 5 },
  { semana: "Sem 2", iniciante: 52, mediano: 24, avancado: 19, master: 5 },
  { semana: "Sem 3", iniciante: 50, mediano: 24, avancado: 20, master: 6 },
  { semana: "Sem 4", iniciante: 48, mediano: 25, avancado: 21, master: 6 },
  { semana: "Sem 5", iniciante: 45, mediano: 25, avancado: 23, master: 7 },
  { semana: "Sem 6", iniciante: 43, mediano: 26, avancado: 23, master: 8 },
  { semana: "Sem 7", iniciante: 41, mediano: 26, avancado: 24, master: 9 },
  { semana: "Sem 8", iniciante: 39, mediano: 27, avancado: 25, master: 9 },
];

export interface AlunoEvolucao {
  apelido: string;
  totalConversas: number;
  primeiraProficiencia: string;
  ultimaProficiencia: string;
}

const profLevels = ["Iniciante", "Mediano", "Avançado", "Master"];

function generateAlunoEvolucao(): AlunoEvolucao[] {
  const nomes = [
    "Luna", "Thor", "Gaia", "Bolt", "Star", "Wave", "Pixel", "Blaze", "Echo", "Nova",
    "Iris", "Rex", "Sky", "Jade", "Atom", "Coral", "Dusk", "Fern", "Hawk", "Lynx",
  ];
  return nomes.map((n) => {
    const first = Math.random() < 0.5 ? 0 : Math.random() < 0.5 ? 1 : 2;
    const delta = Math.random() < 0.55 ? 1 : Math.random() < 0.3 ? 0 : -1;
    const last = Math.max(0, Math.min(3, first + delta));
    return {
      apelido: n,
      totalConversas: Math.round(5 + Math.random() * 40),
      primeiraProficiencia: profLevels[first],
      ultimaProficiencia: profLevels[last],
    };
  }).sort((a, b) => {
    const aDelta = profLevels.indexOf(a.ultimaProficiencia) - profLevels.indexOf(a.primeiraProficiencia);
    const bDelta = profLevels.indexOf(b.ultimaProficiencia) - profLevels.indexOf(b.primeiraProficiencia);
    return bDelta - aDelta || b.totalConversas - a.totalConversas;
  });
}

export const alunoEvolucao: AlunoEvolucao[] = generateAlunoEvolucao();

// ─── SECTION 6: Gamification as Engagement Driver ───

export interface GamificationComparison {
  metrica: string;
  comGamificacao: number | string;
  semGamificacao: number | string;
}

export const gamificationComparison: GamificationComparison[] = [
  { metrica: "Quantidade de alunos", comGamificacao: 218, semGamificacao: 298 },
  { metrica: "Média de conversas/aluno", comGamificacao: 8.4, semGamificacao: 3.1 },
  { metrica: "Duração média (min)", comGamificacao: 5.6, semGamificacao: 2.8 },
  { metrica: "% com resumo", comGamificacao: "12%", semGamificacao: "3%" },
  { metrica: "% com quiz", comGamificacao: "18%", semGamificacao: "5%" },
  { metrica: "% com 5+ conversas (hábito)", comGamificacao: "42%", semGamificacao: "11%" },
];

export interface ScatterPoint {
  apelido: string;
  xpTotal: number;
  totalConversas: number;
  escolaridade: string;
}

function generateScatterData(): ScatterPoint[] {
  const escolaridades = ["6° ano", "7° ano", "8° ano", "9° ano", "1° EM", "2° EM", "3° EM"];
  const nomes = [
    "Luna","Thor","Gaia","Bolt","Star","Wave","Pixel","Blaze","Echo","Nova",
    "Iris","Rex","Sky","Jade","Atom","Coral","Dusk","Fern","Hawk","Lynx",
    "Nyx","Ash","Ivy","Kit","Leo","Sage","Wren","Zara","Finn","Cleo",
    "Beau","Lily","Max","Aria","Rio","Skye","Juno","Eden","Luca","Milo",
  ];
  return nomes.map((n) => {
    const base = Math.random();
    const xp = Math.round(base * 2000 + Math.random() * 500);
    const conv = Math.round(base * 30 + Math.random() * 10 + 1);
    return {
      apelido: n,
      xpTotal: xp,
      totalConversas: conv,
      escolaridade: escolaridades[Math.floor(Math.random() * escolaridades.length)],
    };
  });
}

export const scatterXpConversas: ScatterPoint[] = generateScatterData();

// Pearson correlation
export function pearsonCorrelation(data: ScatterPoint[]): number {
  const n = data.length;
  const sumX = data.reduce((s, d) => s + d.xpTotal, 0);
  const sumY = data.reduce((s, d) => s + d.totalConversas, 0);
  const sumXY = data.reduce((s, d) => s + d.xpTotal * d.totalConversas, 0);
  const sumX2 = data.reduce((s, d) => s + d.xpTotal ** 2, 0);
  const sumY2 = data.reduce((s, d) => s + d.totalConversas ** 2, 0);
  const num = n * sumXY - sumX * sumY;
  const den = Math.sqrt((n * sumX2 - sumX ** 2) * (n * sumY2 - sumY ** 2));
  return den === 0 ? 0 : num / den;
}

// ─── SECTION 8: Growth ───

export interface WeeklyGrowth {
  semana: string;
  escola: number;
  organico: number;
}

export const weeklyGrowthData: WeeklyGrowth[] = [
  { semana: "Sem 1", escola: 18, organico: 12 },
  { semana: "Sem 2", escola: 22, organico: 8 },
  { semana: "Sem 3", escola: 15, organico: 14 },
  { semana: "Sem 4", escola: 28, organico: 10 },
  { semana: "Sem 5", escola: 20, organico: 16 },
  { semana: "Sem 6", escola: 35, organico: 11 },
  { semana: "Sem 7", escola: 24, organico: 13 },
  { semana: "Sem 8", escola: 30, organico: 9 },
];

export const growthMetrics = {
  totalAtivos: 516,
  cadastradosNoPeriodo: 192,
  taxaAtivacao: 62.5,
  alunosDeletados: 34,
  motivosExclusao: ["Não usa mais", "Criou outra conta", "Problemas técnicos"],
};

export interface OrgAlunos {
  organizacao: string;
  alunos: number;
}

export const alunosPorOrganizacao: OrgAlunos[] = [
  { organizacao: "Colégio Progresso", alunos: 128 },
  { organizacao: "Escola Nova Era", alunos: 95 },
  { organizacao: "Instituto Educar", alunos: 72 },
  { organizacao: "Colégio Futuro", alunos: 55 },
  { organizacao: "Escola Criativa", alunos: 38 },
];

// ─── SECTION 9: Premium vs Free ───

export interface PremiumFreeComparison {
  metrica: string;
  premium: number | string;
  free: number | string;
}

export const premiumFreeComparison: PremiumFreeComparison[] = [
  { metrica: "Quantidade de alunos", premium: 89, free: 427 },
  { metrica: "Média de conversas/aluno", premium: 9.2, free: 4.8 },
  { metrica: "Duração média (min)", premium: 6.1, free: 3.4 },
  { metrica: "% conversas > 3 min", premium: "48%", free: "26%" },
  { metrica: "% que fez resumo", premium: "15%", free: "4%" },
  { metrica: "% que fez quiz", premium: "22%", free: "7%" },
  { metrica: "% prof. Avançado/Master", premium: "38%", free: "22%" },
  { metrica: "Média dias streak", premium: 4.2, free: 1.8 },
];
