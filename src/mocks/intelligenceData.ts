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
