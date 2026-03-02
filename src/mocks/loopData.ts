// Mock data for Análise do Loop — realistic values based on production parameters
// Replace imports from this file with Supabase queries when connected

export interface FunnelStep {
  etapa: string;
  contagem: number;
  cor: string;
}

export interface DurationBucket {
  faixa: string;
  contagem: number;
  cor: string;
}

export interface WeeklyRate {
  semana: string;
  conversas3min: number;
  comProficiencia: number;
  comResumo: number;
  comQuiz: number;
}

export interface SegmentRow {
  segmento: string;
  soConversa: number;
  comProficiencia: number;
  comResumo: number;
  comQuiz: number;
}

export interface EtapaMetrics {
  conversa: { medianaDuracao: string; pctMaior3min: number };
  proficiencia: {
    taxaGeracao: number;
    distribuicao: { nivel: string; pct: number; cor: string }[];
  };
  resumo: { taxaGeracao: number; pctComplete: number; pctFailed: number };
  quiz: { taxaGeracao: number; pctCompleted: number; pctStarted: number; pctNull: number };
}

export interface AlunoComparison {
  completaLoop: { qtd: number; duracaoMedia: number; sessoesSemana: number; xpMedio: number; retencao7d: number };
  naoCompleta: { qtd: number; duracaoMedia: number; sessoesSemana: number; xpMedio: number; retencao7d: number };
}

export interface AlunoDetalhado {
  id: number;
  apelido: string;
  escolaridade: string;
  objetivo: string;
  conversas: number;
  durMediaMin: number;
  comProficiencia: boolean;
  comResumo: boolean;
  comQuiz: boolean;
  loopCompleto: boolean;
  xpTotal: number;
}

// ─── Funil ───
export const funnelData: FunnelStep[] = [
  { etapa: "Conversas Iniciadas", contagem: 3003, cor: "#E8820C" },
  { etapa: "Conversas > 3 min", contagem: 868, cor: "#F4A940" },
  { etapa: "Com proficiência", contagem: 1016, cor: "#2E7D32" },
  { etapa: "Resumos gerados", contagem: 50, cor: "#1976D2" },
  { etapa: "Quizzes completados", contagem: 77, cor: "#7B1FA2" },
];

// ─── Distribuição de duração ───
export const durationDistribution: DurationBucket[] = [
  { faixa: "< 1 min", contagem: 1502, cor: "#C62828" },
  { faixa: "1-3 min", contagem: 601, cor: "#E65100" },
  { faixa: "3-5 min", contagem: 330, cor: "#F9A825" },
  { faixa: "5-8 min", contagem: 180, cor: "#9E9D24" },
  { faixa: "8-15 min", contagem: 300, cor: "#558B2F" },
  { faixa: "15+ min", contagem: 90, cor: "#1B5E20" },
];

// ─── Conversão semanal (8 semanas, tendência crescente) ───
export const weeklyConversionRates: WeeklyRate[] = [
  { semana: "Sem 1", conversas3min: 24.1, comProficiencia: 28.5, comResumo: 1.2, comQuiz: 2.1 },
  { semana: "Sem 2", conversas3min: 25.3, comProficiencia: 30.1, comResumo: 1.3, comQuiz: 2.3 },
  { semana: "Sem 3", conversas3min: 26.8, comProficiencia: 31.4, comResumo: 1.4, comQuiz: 2.5 },
  { semana: "Sem 4", conversas3min: 27.5, comProficiencia: 32.8, comResumo: 1.5, comQuiz: 2.6 },
  { semana: "Sem 5", conversas3min: 28.2, comProficiencia: 33.5, comResumo: 1.6, comQuiz: 2.8 },
  { semana: "Sem 6", conversas3min: 29.1, comProficiencia: 34.2, comResumo: 1.7, comQuiz: 3.0 },
  { semana: "Sem 7", conversas3min: 29.8, comProficiencia: 34.8, comResumo: 1.8, comQuiz: 3.1 },
  { semana: "Sem 8", conversas3min: 30.5, comProficiencia: 35.3, comResumo: 1.9, comQuiz: 3.3 },
];

// ─── Loop por escolaridade ───
export const loopByEscolaridade: SegmentRow[] = [
  { segmento: "6° ano", soConversa: 280, comProficiencia: 95, comResumo: 5, comQuiz: 8 },
  { segmento: "7° ano", soConversa: 310, comProficiencia: 120, comResumo: 6, comQuiz: 9 },
  { segmento: "8° ano", soConversa: 350, comProficiencia: 150, comResumo: 8, comQuiz: 12 },
  { segmento: "9° ano", soConversa: 380, comProficiencia: 180, comResumo: 10, comQuiz: 15 },
  { segmento: "1° EM", soConversa: 300, comProficiencia: 160, comResumo: 8, comQuiz: 12 },
  { segmento: "2° EM", soConversa: 250, comProficiencia: 140, comResumo: 7, comQuiz: 10 },
  { segmento: "3° EM", soConversa: 200, comProficiencia: 110, comResumo: 4, comQuiz: 7 },
  { segmento: "Graduado", soConversa: 65, comProficiencia: 61, comResumo: 2, comQuiz: 4 },
];

// ─── Loop por objetivo ───
export const loopByObjetivo: SegmentRow[] = [
  { segmento: "Revisar um assunto", soConversa: 1410, comProficiencia: 700, comResumo: 35, comQuiz: 55 },
  { segmento: "Aprender algo novo", soConversa: 620, comProficiencia: 300, comResumo: 14, comQuiz: 20 },
  { segmento: "Onboarding", soConversa: 105, comProficiencia: 16, comResumo: 1, comQuiz: 2 },
];

// ─── Métricas por etapa ───
export const etapaMetrics: EtapaMetrics = {
  conversa: { medianaDuracao: "3.8 min", pctMaior3min: 28.9 },
  proficiencia: {
    taxaGeracao: 34,
    distribuicao: [
      { nivel: "Iniciante", pct: 45, cor: "#EF5350" },
      { nivel: "Mediano", pct: 25, cor: "#FFA726" },
      { nivel: "Avançado", pct: 23, cor: "#66BB6A" },
      { nivel: "Master", pct: 7, cor: "#42A5F5" },
    ],
  },
  resumo: { taxaGeracao: 1.7, pctComplete: 96, pctFailed: 4 },
  quiz: { taxaGeracao: 3.0, pctCompleted: 84, pctStarted: 11, pctNull: 5 },
};

// ─── Comparação aluno loop completo vs não ───
export const alunoComparison: AlunoComparison = {
  completaLoop: { qtd: 42, duracaoMedia: 8.3, sessoesSemana: 4.2, xpMedio: 1850, retencao7d: 78 },
  naoCompleta: { qtd: 158, duracaoMedia: 2.1, sessoesSemana: 1.4, xpMedio: 320, retencao7d: 31 },
};

// ─── Alunos detalhados ───
const escolaridades = ["6° ano", "7° ano", "8° ano", "9° ano", "1° EM", "2° EM", "3° EM", "Graduado"];
const objetivos = ["Revisar um assunto", "Aprender algo novo"];
const nomes = [
  "Luna", "Theo", "Gabi", "Davi", "Lara", "Enzo", "Marina", "Pedro",
  "Sofia", "Lucas", "Helena", "Arthur", "Valentina", "Miguel", "Alice",
  "Bernardo", "Manuela", "Rafael", "Júlia", "Heitor", "Lívia", "Gabriel",
  "Cecília", "Gustavo", "Isadora", "Samuel", "Laura", "Nicolas", "Beatriz", "Felipe",
];

export const alunosDetalhados: AlunoDetalhado[] = nomes.map((nome, i) => {
  const loopCompleto = i < 8;
  const comQuiz = loopCompleto || i < 12;
  const comResumo = comQuiz || i < 15;
  const comProficiencia = comResumo || i < 22;
  return {
    id: 1000 + i,
    apelido: nome,
    escolaridade: escolaridades[i % escolaridades.length],
    objetivo: objetivos[i % 2],
    conversas: loopCompleto ? 12 + (i % 8) : 3 + (i % 5),
    durMediaMin: loopCompleto ? 6 + +(Math.random() * 6).toFixed(1) : 1 + +(Math.random() * 3).toFixed(1),
    comProficiencia,
    comResumo,
    comQuiz,
    loopCompleto,
    xpTotal: loopCompleto ? 1200 + i * 80 : 100 + i * 30,
  };
});
