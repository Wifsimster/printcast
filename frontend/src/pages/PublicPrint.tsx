import { FormEvent, useEffect, useState } from "react";
import { Loader2, Printer, Send } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ApiError, endpoints } from "@/lib/api";

const USERNAME_KEY = "printcast.public.username";

export function PublicPrint() {
  // Remember the username locally so a returning visitor doesn't retype it.
  const [username, setUsername] = useState(
    () => localStorage.getItem(USERNAME_KEY) ?? ""
  );
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [enabled, setEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    endpoints
      .setupStatus()
      .then((s) => setEnabled(s.public_print_enabled !== false))
      .catch(() => setEnabled(true));
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!username.trim() || !message.trim()) return;
    setBusy(true);
    try {
      await endpoints.publicPrint(username.trim(), message.trim());
      localStorage.setItem(USERNAME_KEY, username.trim());
      toast.success("Message envoyé à l'imprimante !");
      setMessage("");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Échec de l'envoi");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Printer className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Envoyer à printcast</CardTitle>
          <CardDescription>
            Laissez un mot et il sortira sur l'imprimante thermique.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {enabled === false ? (
            <p className="text-center text-sm text-muted-foreground">
              L'impression publique est désactivée pour le moment.
            </p>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Votre nom / pseudo</Label>
                <Input
                  id="username"
                  autoFocus
                  required
                  maxLength={32}
                  placeholder="ex : Alex"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  rows={5}
                  required
                  maxLength={500}
                  placeholder="Votre message…"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={busy || enabled === null || !username.trim() || !message.trim()}
              >
                {busy ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Imprimer
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
