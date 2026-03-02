
-- Base tables
CREATE TABLE public.escolas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.turmas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  serie TEXT NOT NULL,
  escola_id UUID REFERENCES public.escolas(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.alunos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  turma_id UUID REFERENCES public.turmas(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.sessoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID REFERENCES public.alunos(id) ON DELETE CASCADE NOT NULL,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  minutos_ativos NUMERIC NOT NULL DEFAULT 0,
  loops_iniciados INT NOT NULL DEFAULT 0,
  loops_completos INT NOT NULL DEFAULT 0,
  profundidade_interacao NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.qes_diario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID REFERENCES public.alunos(id) ON DELETE CASCADE NOT NULL,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  qes_total NUMERIC NOT NULL DEFAULT 0,
  tam_score NUMERIC NOT NULL DEFAULT 0,
  fr_score NUMERIC NOT NULL DEFAULT 0,
  pi_score NUMERIC NOT NULL DEFAULT 0,
  pd_score NUMERIC NOT NULL DEFAULT 0,
  taxa_loop_completo NUMERIC NOT NULL DEFAULT 0,
  dias_ativos INT NOT NULL DEFAULT 0,
  UNIQUE(aluno_id, data)
);

-- Enable RLS
ALTER TABLE public.escolas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.turmas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qes_diario ENABLE ROW LEVEL SECURITY;

-- Allow read access (internal dashboard, authenticated users)
CREATE POLICY "Allow read escolas" ON public.escolas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read turmas" ON public.turmas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read alunos" ON public.alunos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read sessoes" ON public.sessoes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read qes_diario" ON public.qes_diario FOR SELECT TO authenticated USING (true);

-- Also allow anon for now (dev/testing)
CREATE POLICY "Allow anon read escolas" ON public.escolas FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read turmas" ON public.turmas FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read alunos" ON public.alunos FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read sessoes" ON public.sessoes FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read qes_diario" ON public.qes_diario FOR SELECT TO anon USING (true);

-- VIEW 1: v_dashboard_escola
CREATE OR REPLACE VIEW public.v_dashboard_escola AS
SELECT
  e.id AS escola_id,
  e.nome AS escola_nome,
  COUNT(DISTINCT a.id) AS total_alunos,
  COALESCE(ROUND(AVG(latest_qes.qes_total)::numeric, 1), 0) AS qes_medio,
  COUNT(DISTINCT a.id) FILTER (WHERE latest_qes.qes_total < 25) AS alunos_criticos,
  COUNT(DISTINCT a.id) FILTER (WHERE latest_qes.qes_total >= 25 AND latest_qes.qes_total < 45) AS alunos_superficiais,
  COUNT(DISTINCT a.id) FILTER (WHERE latest_qes.qes_total >= 45 AND latest_qes.qes_total < 65) AS alunos_recorrentes,
  COUNT(DISTINCT a.id) FILTER (WHERE latest_qes.qes_total >= 65 AND latest_qes.qes_total < 85) AS alunos_engajados,
  COUNT(DISTINCT a.id) FILTER (WHERE latest_qes.qes_total >= 85) AS alunos_profundos,
  COALESCE(ROUND(AVG(latest_qes.taxa_loop_completo)::numeric, 1), 0) AS taxa_loop_media
FROM public.escolas e
JOIN public.turmas t ON t.escola_id = e.id
JOIN public.alunos a ON a.turma_id = t.id
LEFT JOIN LATERAL (
  SELECT q.qes_total, q.taxa_loop_completo
  FROM public.qes_diario q
  WHERE q.aluno_id = a.id
  ORDER BY q.data DESC
  LIMIT 1
) latest_qes ON true
GROUP BY e.id, e.nome;

-- VIEW 2: v_dashboard_turma
CREATE OR REPLACE VIEW public.v_dashboard_turma AS
SELECT
  t.id AS turma_id,
  t.nome AS turma_nome,
  t.serie,
  e.nome AS escola_nome,
  COUNT(DISTINCT a.id) AS total_alunos,
  COALESCE(ROUND(AVG(lq.qes_total)::numeric, 1), 0) AS qes_medio,
  COALESCE(ROUND(AVG(lq.tam_score)::numeric, 1), 0) AS tam_medio,
  COALESCE(ROUND(AVG(lq.fr_score)::numeric, 1), 0) AS fr_medio,
  COALESCE(ROUND(AVG(lq.pi_score)::numeric, 1), 0) AS pi_medio,
  COALESCE(ROUND(AVG(lq.pd_score)::numeric, 1), 0) AS pd_medio,
  COALESCE(SUM(total_sess.cnt)::int, 0) AS total_sessoes_turma,
  COALESCE(ROUND(AVG(lq.dias_ativos)::numeric, 1), 0) AS dias_ativos_medio
FROM public.turmas t
JOIN public.escolas e ON e.id = t.escola_id
JOIN public.alunos a ON a.turma_id = t.id
LEFT JOIN LATERAL (
  SELECT q.qes_total, q.tam_score, q.fr_score, q.pi_score, q.pd_score, q.dias_ativos
  FROM public.qes_diario q WHERE q.aluno_id = a.id ORDER BY q.data DESC LIMIT 1
) lq ON true
LEFT JOIN LATERAL (
  SELECT COUNT(*) AS cnt FROM public.sessoes s WHERE s.aluno_id = a.id
) total_sess ON true
GROUP BY t.id, t.nome, t.serie, e.nome;

-- VIEW 3: v_dashboard_aluno
CREATE OR REPLACE VIEW public.v_dashboard_aluno AS
SELECT
  a.id AS aluno_id,
  a.nome AS aluno_nome,
  t.nome AS turma_nome,
  t.serie,
  e.nome AS escola_nome,
  COALESCE(lq.qes_total, 0) AS qes_total,
  CASE
    WHEN COALESCE(lq.qes_total, 0) < 25 THEN 'Crítico'
    WHEN COALESCE(lq.qes_total, 0) < 45 THEN 'Superficial'
    WHEN COALESCE(lq.qes_total, 0) < 65 THEN 'Recorrente'
    WHEN COALESCE(lq.qes_total, 0) < 85 THEN 'Engajado'
    ELSE 'Profundo'
  END AS qes_faixa,
  COALESCE(lq.tam_score, 0) AS tam_score,
  COALESCE(lq.fr_score, 0) AS fr_score,
  COALESCE(lq.pi_score, 0) AS pi_score,
  COALESCE(lq.pd_score, 0) AS pd_score,
  COALESCE(total_sess.cnt, 0)::int AS total_sessoes,
  COALESCE(total_sess.min_ativos, 0)::int AS total_minutos_ativos,
  COALESCE(lq.dias_ativos, 0) AS dias_ativos,
  COALESCE(lq.taxa_loop_completo, 0) AS taxa_loop_completo,
  COALESCE(prev_qes.qes_total, 0) AS qes_anterior,
  CASE
    WHEN prev_qes.qes_total IS NULL THEN 'novo'
    WHEN lq.qes_total > prev_qes.qes_total + 3 THEN 'subindo'
    WHEN lq.qes_total < prev_qes.qes_total - 3 THEN 'caindo'
    ELSE 'estavel'
  END AS tendencia
FROM public.alunos a
JOIN public.turmas t ON t.id = a.turma_id
JOIN public.escolas e ON e.id = t.escola_id
LEFT JOIN LATERAL (
  SELECT q.qes_total, q.tam_score, q.fr_score, q.pi_score, q.pd_score, q.dias_ativos, q.taxa_loop_completo, q.data
  FROM public.qes_diario q WHERE q.aluno_id = a.id ORDER BY q.data DESC LIMIT 1
) lq ON true
LEFT JOIN LATERAL (
  SELECT q.qes_total
  FROM public.qes_diario q WHERE q.aluno_id = a.id AND q.data < lq.data ORDER BY q.data DESC LIMIT 1
) prev_qes ON true
LEFT JOIN LATERAL (
  SELECT COUNT(*) AS cnt, SUM(s.minutos_ativos) AS min_ativos FROM public.sessoes s WHERE s.aluno_id = a.id
) total_sess ON true;

-- VIEW 4: v_dashboard_alertas
CREATE OR REPLACE VIEW public.v_dashboard_alertas AS
SELECT
  a.nome AS aluno_nome,
  t.nome AS turma_nome,
  COALESCE(lq.qes_total, 0) AS qes_total,
  CASE
    WHEN COALESCE(lq.qes_total, 0) < 25 THEN 'Crítico'
    WHEN COALESCE(lq.qes_total, 0) < 45 THEN 'Superficial'
    WHEN COALESCE(lq.qes_total, 0) < 65 THEN 'Recorrente'
    WHEN COALESCE(lq.qes_total, 0) < 85 THEN 'Engajado'
    ELSE 'Profundo'
  END AS qes_faixa,
  CASE
    WHEN COALESCE(lq.qes_total, 0) < 25 THEN 'QES Crítico'
    WHEN prev_qes.qes_total IS NOT NULL AND lq.qes_total < prev_qes.qes_total - 15 THEN 'Queda acentuada'
    WHEN COALESCE(lq.taxa_loop_completo, 0) < 20 THEN 'Uso raso'
    ELSE 'QES Superficial'
  END AS tipo_alerta,
  CASE
    WHEN COALESCE(lq.qes_total, 0) < 25 THEN 'alto'
    ELSE 'medio'
  END AS severidade,
  CASE
    WHEN COALESCE(lq.qes_total, 0) < 25 THEN 'Agendar conversa com o aluno e professor responsável'
    WHEN prev_qes.qes_total IS NOT NULL AND lq.qes_total < prev_qes.qes_total - 15 THEN 'Investigar causa da queda e oferecer suporte'
    WHEN COALESCE(lq.taxa_loop_completo, 0) < 20 THEN 'Revisar conteúdo e nível de dificuldade'
    ELSE 'Monitorar engajamento nos próximos dias'
  END AS acao_sugerida
FROM public.alunos a
JOIN public.turmas t ON t.id = a.turma_id
LEFT JOIN LATERAL (
  SELECT q.qes_total, q.taxa_loop_completo, q.data
  FROM public.qes_diario q WHERE q.aluno_id = a.id ORDER BY q.data DESC LIMIT 1
) lq ON true
LEFT JOIN LATERAL (
  SELECT q.qes_total
  FROM public.qes_diario q WHERE q.aluno_id = a.id AND q.data < lq.data ORDER BY q.data DESC LIMIT 1
) prev_qes ON true
WHERE COALESCE(lq.qes_total, 0) < 45
   OR (prev_qes.qes_total IS NOT NULL AND lq.qes_total < prev_qes.qes_total - 15)
   OR COALESCE(lq.taxa_loop_completo, 0) < 20;

-- VIEW 5: v_dashboard_historico
CREATE OR REPLACE VIEW public.v_dashboard_historico AS
SELECT
  q.aluno_id,
  a.nome AS aluno_nome,
  t.id AS turma_id,
  e.id AS escola_id,
  q.data,
  q.qes_total,
  q.tam_score,
  q.fr_score,
  q.pi_score,
  q.pd_score,
  q.taxa_loop_completo,
  q.dias_ativos
FROM public.qes_diario q
JOIN public.alunos a ON a.id = q.aluno_id
JOIN public.turmas t ON t.id = a.turma_id
JOIN public.escolas e ON e.id = t.escola_id
ORDER BY q.data;
