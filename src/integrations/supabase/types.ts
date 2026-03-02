export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      alunos: {
        Row: {
          created_at: string | null
          id: string
          nome: string
          turma_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          nome: string
          turma_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          nome?: string
          turma_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alunos_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alunos_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "v_dashboard_historico"
            referencedColumns: ["turma_id"]
          },
          {
            foreignKeyName: "alunos_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "v_dashboard_turma"
            referencedColumns: ["turma_id"]
          },
        ]
      }
      escolas: {
        Row: {
          created_at: string | null
          id: string
          nome: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          nome: string
        }
        Update: {
          created_at?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      qes_diario: {
        Row: {
          aluno_id: string
          data: string
          dias_ativos: number
          fr_score: number
          id: string
          pd_score: number
          pi_score: number
          qes_total: number
          tam_score: number
          taxa_loop_completo: number
        }
        Insert: {
          aluno_id: string
          data?: string
          dias_ativos?: number
          fr_score?: number
          id?: string
          pd_score?: number
          pi_score?: number
          qes_total?: number
          tam_score?: number
          taxa_loop_completo?: number
        }
        Update: {
          aluno_id?: string
          data?: string
          dias_ativos?: number
          fr_score?: number
          id?: string
          pd_score?: number
          pi_score?: number
          qes_total?: number
          tam_score?: number
          taxa_loop_completo?: number
        }
        Relationships: [
          {
            foreignKeyName: "qes_diario_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qes_diario_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "v_dashboard_aluno"
            referencedColumns: ["aluno_id"]
          },
        ]
      }
      sessoes: {
        Row: {
          aluno_id: string
          created_at: string | null
          data: string
          id: string
          loops_completos: number
          loops_iniciados: number
          minutos_ativos: number
          profundidade_interacao: number
        }
        Insert: {
          aluno_id: string
          created_at?: string | null
          data?: string
          id?: string
          loops_completos?: number
          loops_iniciados?: number
          minutos_ativos?: number
          profundidade_interacao?: number
        }
        Update: {
          aluno_id?: string
          created_at?: string | null
          data?: string
          id?: string
          loops_completos?: number
          loops_iniciados?: number
          minutos_ativos?: number
          profundidade_interacao?: number
        }
        Relationships: [
          {
            foreignKeyName: "sessoes_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessoes_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "v_dashboard_aluno"
            referencedColumns: ["aluno_id"]
          },
        ]
      }
      turmas: {
        Row: {
          created_at: string | null
          escola_id: string
          id: string
          nome: string
          serie: string
        }
        Insert: {
          created_at?: string | null
          escola_id: string
          id?: string
          nome: string
          serie: string
        }
        Update: {
          created_at?: string | null
          escola_id?: string
          id?: string
          nome?: string
          serie?: string
        }
        Relationships: [
          {
            foreignKeyName: "turmas_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "turmas_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "v_dashboard_escola"
            referencedColumns: ["escola_id"]
          },
          {
            foreignKeyName: "turmas_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "v_dashboard_historico"
            referencedColumns: ["escola_id"]
          },
        ]
      }
    }
    Views: {
      v_dashboard_alertas: {
        Row: {
          acao_sugerida: string | null
          aluno_nome: string | null
          qes_faixa: string | null
          qes_total: number | null
          severidade: string | null
          tipo_alerta: string | null
          turma_nome: string | null
        }
        Relationships: []
      }
      v_dashboard_aluno: {
        Row: {
          aluno_id: string | null
          aluno_nome: string | null
          dias_ativos: number | null
          escola_nome: string | null
          fr_score: number | null
          pd_score: number | null
          pi_score: number | null
          qes_anterior: number | null
          qes_faixa: string | null
          qes_total: number | null
          serie: string | null
          tam_score: number | null
          taxa_loop_completo: number | null
          tendencia: string | null
          total_minutos_ativos: number | null
          total_sessoes: number | null
          turma_nome: string | null
        }
        Relationships: []
      }
      v_dashboard_escola: {
        Row: {
          alunos_criticos: number | null
          alunos_engajados: number | null
          alunos_profundos: number | null
          alunos_recorrentes: number | null
          alunos_superficiais: number | null
          escola_id: string | null
          escola_nome: string | null
          qes_medio: number | null
          taxa_loop_media: number | null
          total_alunos: number | null
        }
        Relationships: []
      }
      v_dashboard_historico: {
        Row: {
          aluno_id: string | null
          aluno_nome: string | null
          data: string | null
          dias_ativos: number | null
          escola_id: string | null
          fr_score: number | null
          pd_score: number | null
          pi_score: number | null
          qes_total: number | null
          tam_score: number | null
          taxa_loop_completo: number | null
          turma_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qes_diario_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qes_diario_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "v_dashboard_aluno"
            referencedColumns: ["aluno_id"]
          },
        ]
      }
      v_dashboard_turma: {
        Row: {
          dias_ativos_medio: number | null
          escola_nome: string | null
          fr_medio: number | null
          pd_medio: number | null
          pi_medio: number | null
          qes_medio: number | null
          serie: string | null
          tam_medio: number | null
          total_alunos: number | null
          total_sessoes_turma: number | null
          turma_id: string | null
          turma_nome: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
