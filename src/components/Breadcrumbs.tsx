import { useLocation, Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export function Breadcrumbs() {
  const location = useLocation();
  const path = location.pathname;

  const crumbs: { label: string; to: string }[] = [
    { label: "Geral", to: "/" },
  ];

  if (path.startsWith("/escola/")) {
    crumbs.push({ label: "Escola", to: path });
  }
  if (path.startsWith("/turma/")) {
    crumbs.push({ label: "Turma", to: path });
  }
  if (path.startsWith("/aluno/")) {
    crumbs.push({ label: "Aluno", to: path });
  }
  if (path === "/alertas") {
    crumbs.push({ label: "Alertas", to: "/alertas" });
  }

  if (crumbs.length <= 1) return null;

  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
      {crumbs.map((crumb, i) => (
        <span key={crumb.to} className="flex items-center gap-1">
          {i > 0 && <ChevronRight size={14} />}
          {i < crumbs.length - 1 ? (
            <Link to={crumb.to} className="hover:text-foreground transition-colors">
              {crumb.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
