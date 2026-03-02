// Supabase view types for Woolly Pilot Monitor

export interface DashboardEscola {
  escola_id: string;
  escola_nome: string;
  total_alunos: number;
  qes_medio: number;
  alunos_criticos: number;
  alunos_superficiais: number;
  alunos_recorrentes: number;
  alunos_engajados: number;
  alunos_profundos: number;
  taxa_loop_media: number;
}

export interface DashboardTurma {
  turma_id: string;
  turma_nome: string;
  serie: string;
  escola_nome: string;
  total_alunos: number;
  qes_medio: number;
  tam_medio: number;
  fr_medio: number;
  pi_medio: number;
  pd_medio: number;
  total_sessoes_turma: number;
  dias_ativos_medio: number;
}

export interface DashboardAluno {
  aluno_id: string;
  aluno_nome: string;
  turma_nome: string;
  serie: string;
  escola_nome: string;
  qes_total: number;
  qes_faixa: string;
  tam_score: number;
  fr_score: number;
  pi_score: number;
  pd_score: number;
  total_sessoes: number;
  total_minutos_ativos: number;
  dias_ativos: number;
  taxa_loop_completo: number;
  qes_anterior: number;
  tendencia: "novo" | "subindo" | "caindo" | "estavel";
}

export interface DashboardAlerta {
  aluno_nome: string;
  turma_nome: string;
  qes_total: number;
  qes_faixa: string;
  tipo_alerta: string;
  severidade: "alto" | "medio";
  acao_sugerida: string;
}

export interface DashboardHistorico {
  aluno_id: string;
  aluno_nome: string;
  turma_id: string;
  escola_id: string;
  data: string;
  qes_total: number;
  tam_score: number;
  fr_score: number;
  pi_score: number;
  pd_score: number;
  taxa_loop_completo: number;
  dias_ativos: number;
}
