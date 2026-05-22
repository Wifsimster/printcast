import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Printer, KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { endpoints, setToken } from "@/lib/api";

export function Login() {
  const { t } = useTranslation();
  const [token, setTokenValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token.trim()) return;
    setSubmitting(true);
    setToken(token.trim());
    try {
      await endpoints.config();
      toast.success(t("login.signedIn"));
      navigate("/", { replace: true });
    } catch {
      setToken("");
      toast.error(t("login.invalidToken"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Printer className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>{t("login.title")}</CardTitle>
          <CardDescription>{t("login.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="token">{t("login.tokenLabel")}</Label>
              <Input
                id="token"
                type="password"
                autoFocus
                placeholder={t("login.tokenPlaceholder")}
                value={token}
                onChange={(e) => setTokenValue(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <KeyRound className="mr-2 h-4 w-4" />
              )}
              {t("common.signIn")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
