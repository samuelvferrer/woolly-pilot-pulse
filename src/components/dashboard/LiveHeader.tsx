import { useEffect, useState } from "react";

export function LiveHeader() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatted = now.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const time = now.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-2xl font-extrabold" style={{ color: "#E87C1E" }}>
          Woolly
        </span>
        <span className="text-base font-medium text-muted-foreground">
          Painel de Monitoramento
        </span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
          </span>
          <span className="text-sm font-semibold" style={{ color: "#16A34A" }}>
            Ao vivo
          </span>
        </div>
        <div className="text-right text-sm text-muted-foreground leading-tight">
          <div className="font-semibold tabular-nums">{time}</div>
          <div className="text-xs capitalize">{formatted}</div>
        </div>
      </div>
    </div>
  );
}
