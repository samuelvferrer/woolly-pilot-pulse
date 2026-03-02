import { AlertTriangle, AlertCircle } from "lucide-react";
import { QesBadge } from "./QesBadge";

interface AlertCardProps {
  alunoNome: string;
  turmaNome: string;
  qesTotal: number;
  qesFaixa: string;
  tipoAlerta: string;
  severidade: string;
  acaoSugerida: string;
}

export function AlertCard({
  alunoNome,
  turmaNome,
  qesTotal,
  qesFaixa,
  tipoAlerta,
  severidade,
  acaoSugerida,
}: AlertCardProps) {
  const isAlto = severidade === "alto";

  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-sm animate-fade-in">
      <div className="mt-0.5">
        {isAlto ? (
          <AlertTriangle size={18} className="text-destructive" />
        ) : (
          <AlertCircle size={18} className="text-qes-recorrente" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm text-foreground">{alunoNome}</span>
          <span className="text-xs text-muted-foreground">{turmaNome}</span>
          <QesBadge qes={qesTotal} faixa={qesFaixa} showValue />
        </div>
        <p className="mt-1 text-sm font-medium text-foreground">{tipoAlerta}</p>
        <p className="mt-0.5 text-xs italic text-muted-foreground">{acaoSugerida}</p>
      </div>
    </div>
  );
}
