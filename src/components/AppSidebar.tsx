import {
  LayoutDashboard,
  AlertTriangle,
  School,
  Users,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useState } from "react";
import { useSupabaseQuery } from "@/hooks/useSupabaseQuery";
import type { DashboardEscola, DashboardTurma, DashboardAlerta } from "@/types/dashboard";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const [expandedEscolas, setExpandedEscolas] = useState<Set<string>>(new Set());

  const { data: escolas } = useSupabaseQuery<DashboardEscola>("v_dashboard_escola");
  const { data: turmas } = useSupabaseQuery<DashboardTurma>("v_dashboard_turma");
  const { data: alertas } = useSupabaseQuery<DashboardAlerta>("v_dashboard_alertas");

  const alertCount = alertas?.length || 0;

  const toggleEscola = (id: string) => {
    setExpandedEscolas((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const escolaTurmas = (escolaNome: string) =>
    turmas?.filter((t) => t.escola_nome === escolaNome) || [];

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarContent>
        {/* Logo */}
        <div className="px-4 py-5">
          <span className="text-xl font-bold text-primary tracking-tight">
            {collapsed ? "W" : "Woolly"}
          </span>
        </div>

        {/* Main Nav */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/"
                    end
                    className="hover:bg-sidebar-accent"
                    activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    {!collapsed && <span>Visão Geral</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/alertas"
                    className="hover:bg-sidebar-accent"
                    activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  >
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    {!collapsed && <span>Alertas</span>}
                    {alertCount > 0 && (
                      <span className="ml-auto inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-bold text-destructive-foreground">
                        {alertCount}
                      </span>
                    )}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && (
          <>
            <SidebarSeparator />

            <SidebarGroup>
              <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground">
                Escolas
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {escolas?.map((escola) => {
                    const isExpanded = expandedEscolas.has(escola.escola_id);
                    const turmasEscola = escolaTurmas(escola.escola_nome);
                    return (
                      <div key={escola.escola_id}>
                        <SidebarMenuItem>
                          <SidebarMenuButton asChild>
                            <div className="flex w-full items-center">
                              <NavLink
                                to={`/escola/${escola.escola_id}`}
                                className="flex-1 flex items-center hover:bg-sidebar-accent"
                                activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                              >
                                <School className="mr-2 h-4 w-4" />
                                <span className="truncate text-sm">{escola.escola_nome}</span>
                              </NavLink>
                              {turmasEscola.length > 0 && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleEscola(escola.escola_id);
                                  }}
                                  className="p-1 hover:bg-sidebar-accent rounded"
                                >
                                  {isExpanded ? (
                                    <ChevronDown size={14} />
                                  ) : (
                                    <ChevronRight size={14} />
                                  )}
                                </button>
                              )}
                            </div>
                          </SidebarMenuButton>
                        </SidebarMenuItem>

                        {isExpanded &&
                          turmasEscola.map((turma) => (
                            <SidebarMenuItem key={turma.turma_id}>
                              <SidebarMenuButton asChild>
                                <NavLink
                                  to={`/turma/${turma.turma_id}`}
                                  className="pl-9 hover:bg-sidebar-accent"
                                  activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                                >
                                  <Users className="mr-2 h-3.5 w-3.5" />
                                  <span className="truncate text-xs">
                                    {turma.turma_nome}
                                  </span>
                                </NavLink>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          ))}
                      </div>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
