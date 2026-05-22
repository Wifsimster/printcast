import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Activity,
  BarChart3,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Printer,
  Settings as SettingsIcon,
  TestTube2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { clearToken, endpoints, getToken, HealthResponse } from "@/lib/api";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/jobs", label: "Jobs", icon: ListChecks },
  { to: "/test", label: "Test print", icon: TestTube2 },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [health, setHealth] = useState<HealthResponse | null>(null);

  useEffect(() => {
    if (!getToken()) {
      navigate("/login", { replace: true });
      return;
    }
    let cancelled = false;
    const tick = () =>
      endpoints
        .health()
        .then((h) => !cancelled && setHealth(h))
        .catch(() => !cancelled && setHealth(null));
    tick();
    const id = setInterval(tick, 15000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [navigate, location.pathname]);

  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="hidden w-60 flex-col border-r bg-background md:flex">
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <Printer className="h-5 w-5 text-primary" />
          <span className="text-lg font-semibold tracking-tight">printcast</span>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t p-3">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => {
              clearToken();
              navigate("/login", { replace: true });
            }}
          >
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between gap-2 border-b bg-background px-3 md:h-16 md:px-6">
          <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
            <Printer className="h-5 w-5 shrink-0 text-primary md:hidden" />
            <span className="truncate font-semibold text-foreground md:hidden">
              printcast
            </span>
            <Activity className="hidden h-4 w-4 shrink-0 md:inline" />
            <span className="hidden md:inline">Printer</span>
            <span className="hidden truncate font-mono text-foreground md:inline">
              {health?.printer?.host || "unknown"}:{health?.printer?.port || "—"}
            </span>
            {health ? (
              health.printer.reachable ? (
                <Badge variant="success" className="shrink-0">
                  <span className="hidden sm:inline">reachable</span>
                  <span className="sm:hidden" aria-label="reachable">ok</span>
                </Badge>
              ) : (
                <Badge variant="destructive" className="shrink-0">
                  <span className="hidden sm:inline">unreachable</span>
                  <span className="sm:hidden" aria-label="unreachable">down</span>
                </Badge>
              )
            ) : (
              <Badge variant="outline" className="shrink-0">…</Badge>
            )}
          </div>
          <nav className="flex shrink-0 items-center gap-0.5 md:hidden">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                aria-label={item.label}
                title={item.label}
                className={({ isActive }) =>
                  cn(
                    "flex h-9 w-9 items-center justify-center rounded-md",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent"
                  )
                }
              >
                <item.icon className="h-4 w-4" />
              </NavLink>
            ))}
            <Button
              variant="ghost"
              size="icon"
              aria-label="Sign out"
              title="Sign out"
              className="h-9 w-9 text-muted-foreground"
              onClick={() => {
                clearToken();
                navigate("/login", { replace: true });
              }}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </nav>
        </header>
        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
