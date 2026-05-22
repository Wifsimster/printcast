import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Activity,
  BarChart3,
  Globe,
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
import { SUPPORTED_LANGUAGES } from "@/i18n";

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [health, setHealth] = useState<HealthResponse | null>(null);

  const nav = [
    { to: "/", label: t("nav.dashboard"), icon: LayoutDashboard },
    { to: "/analytics", label: t("nav.analytics"), icon: BarChart3 },
    { to: "/jobs", label: t("nav.jobs"), icon: ListChecks },
    { to: "/test", label: t("nav.testPrint"), icon: TestTube2 },
    { to: "/settings", label: t("nav.settings"), icon: SettingsIcon },
  ];

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

  const currentLang = (i18n.resolvedLanguage || i18n.language || "en").split("-")[0];

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
        <div className="border-t p-3 space-y-2">
          <div className="flex items-center gap-2 px-1">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <select
              aria-label={t("common.language")}
              value={currentLang}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              className="w-full rounded-md border bg-background px-2 py-1 text-sm"
            >
              {SUPPORTED_LANGUAGES.map((lng) => (
                <option key={lng} value={lng}>
                  {t(`languages.${lng}`)}
                </option>
              ))}
            </select>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => {
              clearToken();
              navigate("/login", { replace: true });
            }}
          >
            <LogOut className="mr-2 h-4 w-4" /> {t("common.signOut")}
          </Button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b bg-background px-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Activity className="h-4 w-4" />
            <span>{t("header.printer")}</span>
            <span className="font-mono text-foreground">
              {health?.printer?.host || t("header.unknown")}:{health?.printer?.port || t("common.dash")}
            </span>
            {health ? (
              health.printer.reachable ? (
                <Badge variant="success">{t("header.reachable")}</Badge>
              ) : (
                <Badge variant="destructive">{t("header.unreachable")}</Badge>
              )
            ) : (
              <Badge variant="outline">…</Badge>
            )}
          </div>
          <nav className="flex gap-1 md:hidden">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "rounded-md p-2",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent"
                  )
                }
              >
                <item.icon className="h-4 w-4" />
              </NavLink>
            ))}
          </nav>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
