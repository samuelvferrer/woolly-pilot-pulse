import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UseSupabaseQueryResult<T> {
  data: T[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useSupabaseQuery<T = Record<string, unknown>>(
  viewName: string,
  filters?: Record<string, unknown>
): UseSupabaseQueryResult<T> {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Using any to bypass strict typing since we query views that may not be in generated types
      let query = (supabase as any).from(viewName).select("*");

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      const { data: result, error: queryError } = await query;

      if (queryError) throw queryError;
      setData(result as T[]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao carregar dados";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewName, JSON.stringify(filters)]);

  return { data, loading, error, refetch: fetchData };
}
