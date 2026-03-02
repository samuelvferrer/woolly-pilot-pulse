
-- Fix security definer views by setting them to SECURITY INVOKER
ALTER VIEW public.v_dashboard_escola SET (security_invoker = on);
ALTER VIEW public.v_dashboard_turma SET (security_invoker = on);
ALTER VIEW public.v_dashboard_aluno SET (security_invoker = on);
ALTER VIEW public.v_dashboard_alertas SET (security_invoker = on);
ALTER VIEW public.v_dashboard_historico SET (security_invoker = on);
