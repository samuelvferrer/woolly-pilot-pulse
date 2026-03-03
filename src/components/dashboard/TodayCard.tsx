interface TodayCardProps {
  sessoes: number;
  loops: number;
}

export function TodayCard({ sessoes, loops }: TodayCardProps) {
  const taxa = sessoes > 0 ? (loops / sessoes) * 100 : 0;
  const taxaColor = taxa >= 50 ? "#16A34A" : "#CA8A04";

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm h-full flex flex-col">
      <h2 className="text-base font-semibold text-foreground mb-4">Hoje</h2>
      <div className="flex-1 flex flex-col justify-center divide-y divide-border">
        <div className="py-4 text-center">
          <p className="text-[40px] font-bold leading-none" style={{ color: "#E87C1E" }}>
            {sessoes}
          </p>
          <p className="text-sm text-muted-foreground mt-1">Sessões iniciadas</p>
        </div>
        <div className="py-4 text-center">
          <p className="text-[40px] font-bold leading-none" style={{ color: "#16A34A" }}>
            {loops}
          </p>
          <p className="text-sm text-muted-foreground mt-1">Loops completos</p>
        </div>
        <div className="py-4 text-center">
          <p className="text-[40px] font-bold leading-none" style={{ color: taxaColor }}>
            {taxa.toFixed(0)}%
          </p>
          <p className="text-sm text-muted-foreground mt-1">Taxa de conversão</p>
        </div>
      </div>
    </div>
  );
}
