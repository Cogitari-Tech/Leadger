import { useState, useEffect, type FormEvent } from "react";
import { useParams, Navigate } from "react-router-dom";
import { supabase } from "../../../config/supabase";
import type { Invitation } from "../types/auth.types";
import { Activity, ShieldCheck, Database } from "lucide-react";
import { ThemeToggle } from "../../../shared/components/ui/ThemeToggle";

export function AcceptInvitePage() {
  const { token } = useParams<{ token: string }>();
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isInviteLink, setIsInviteLink] = useState(false);

  useEffect(() => {
    if (!token) return;

    const fetchInvitation = async () => {
      // First, try to find in invite_links by hashing the token
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(token);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const tokenHash = hashArray
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");

        const { data: linkData } = await supabase
          .from("invite_links")
          .select(
            "*, role:roles(name, display_name), tenant:tenants(name, slug)",
          )
          .eq("token_hash", tokenHash)
          .eq("revoked", false)
          .single();

        if (
          linkData &&
          new Date(linkData.expires_at) > new Date() &&
          (linkData.max_uses === null ||
            linkData.current_uses < linkData.max_uses)
        ) {
          setIsInviteLink(true);
          setInvitation({
            id: linkData.id,
            tenant_id: linkData.tenant_id,
            email: "",
            role_id: linkData.role_id,
            invited_by: linkData.created_by,
            token: token || "",
            status: "pending",
            expires_at: linkData.expires_at,
            created_at: linkData.created_at,
            accepted_at: null,
            role: linkData.role,
            tenant: linkData.tenant,
          } as Invitation);
          setLoading(false);
          return;
        }
      } catch {
        // Not an invite link, try invitations table
      }

      // Fallback: try invitations table
      const { data: invData, error: fetchError } = await supabase
        .from("invitations")
        .select("*, role:roles(name, display_name), tenant:tenants(name, slug)")
        .eq("token", token)
        .eq("status", "pending")
        .single();

      if (fetchError || !invData) {
        setError("Convite inválido ou expirado.");
      } else if (new Date(invData.expires_at) < new Date()) {
        setError("Este convite expirou. Solicite um novo ao administrador.");
      } else {
        setInvitation(invData as Invitation);
      }
      setLoading(false);
    };

    fetchInvitation();
  }, [token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!invitation) return;

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    if (password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      // 1. Create user account
      const { data: authData, error: signUpError } = await supabase.auth.signUp(
        {
          email: isInviteLink ? (undefined as any) : invitation.email,
          password,
          options: {
            data: {
              name,
              signup_mode: isInviteLink ? "invite_link" : "invite",
              invite_token: token,
            },
          },
        },
      );

      if (signUpError || !authData.user) {
        setError(signUpError?.message ?? "Erro ao criar conta.");
        setSubmitting(false);
        return;
      }

      // 2. Mark invitation as accepted (via service role edge function or RPC)
      await supabase
        .from("invitations")
        .update({ status: "accepted", accepted_at: new Date().toISOString() })
        .eq("id", invitation.id);

      setSuccess(true);
    } catch {
      setError("Erro inesperado. Tente novamente.");
    }
    setSubmitting(false);
  };

  if (success) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      {/* 
        RADICAL ASYMMETRIC LAYOUT (70/30 split)
      */}
      <div className="hidden md:flex flex-col justify-between w-[65%] border-r border-border p-12 lg:p-24 relative overflow-hidden bg-slate-950">
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
            backgroundSize: "4rem 4rem",
          }}
        />

        <div className="relative z-10 flex items-center justify-between">
          <img
            src="/images/logo-cogitari.png"
            alt="Cogitari"
            className="h-8 w-auto block dark:hidden transition-all opacity-90 hover:opacity-100"
          />
          <img
            src="/images/logo-cogitari-dark.png"
            alt="Cogitari"
            className="h-8 w-auto hidden dark:block transition-all opacity-90 hover:opacity-100"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/images/logo-cogitari.png";
            }}
          />
          <span className="text-secondary-foreground/40 font-mono text-xs tracking-widest uppercase border border-border/30 px-3 py-1 bg-background/5">
            System Auth v2.0
          </span>
        </div>

        <div className="relative z-10 space-y-8 mt-24 flex-grow flex flex-col justify-center">
          <h1 className="text-6xl lg:text-7xl font-bold tracking-tighter text-white leading-[1.1]">
            <span className="block text-primary mb-2">PRECISÃO.</span>
            DADOS SOB <br /> CONTROLE.
          </h1>
          <p className="max-w-xl text-lg text-slate-400 font-light leading-relaxed">
            Plataforma corporativa de auditoria e compliance financeiro. Acesso
            restrito ao pessoal autorizado.
          </p>

          <div className="flex gap-8 pt-8 border-t border-border/30 w-fit">
            <div className="flex flex-col gap-2">
              <ShieldCheck className="text-primary w-6 h-6 stroke-[1.5]" />
              <span className="text-xs font-mono text-slate-500 uppercase">
                Isolamento
                <br />
                Garantido
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <Database className="text-primary w-6 h-6 stroke-[1.5]" />
              <span className="text-xs font-mono text-slate-500 uppercase">
                Dados
                <br />
                Críticos
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <Activity className="text-primary w-6 h-6 stroke-[1.5]" />
              <span className="text-xs font-mono text-slate-500 uppercase">
                Alta
                <br />
                Performance
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Form */}
      <div className="flex-1 flex flex-col justify-center p-8 sm:p-12 lg:p-16 bg-background relative">
        <div className="absolute top-6 right-6 z-50">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-sm mx-auto space-y-8">
          {/* Mobile Logo */}
          <div className="md:hidden flex justify-start mb-8 pb-8 border-b border-border">
            <img
              src="/images/logo-cogitari.png"
              alt="Cogitari"
              className="h-8 w-auto block dark:hidden transition-all opacity-90 hover:opacity-100"
            />
            <img
              src="/images/logo-cogitari-dark.png"
              alt="Cogitari"
              className="h-8 w-auto hidden dark:block transition-all opacity-90 hover:opacity-100"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "/images/logo-cogitari.png";
              }}
            />
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-12">
              <div className="h-10 w-10 animate-spin border-2 border-primary border-t-transparent rounded-none" />
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                Verificando Credenciais...
              </p>
            </div>
          ) : error && !invitation ? (
            <div className="space-y-6 pt-4 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center border border-destructive/50 bg-destructive/10 text-destructive">
                <svg
                  className="h-7 w-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                    strokeWidth={1.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold tracking-tight">
                Acesso Negado
              </h2>
              <p className="text-sm font-mono text-muted-foreground leading-relaxed">
                {error}
              </p>
              <div className="pt-4">
                <a
                  href="/"
                  className="font-bold text-brand-500 uppercase tracking-widest hover:text-brand-400 transition-colors"
                >
                  Ir para o Início
                </a>
              </div>
            </div>
          ) : invitation ? (
            <>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Registro</h2>
                <p className="text-sm font-mono text-muted-foreground uppercase tracking-wider leading-relaxed">
                  Convidado para{" "}
                  <span className="text-foreground font-bold">
                    {invitation.tenant?.name}
                  </span>
                  <br />
                  Permissão:{" "}
                  <span className="text-primary font-bold">
                    {invitation.role?.display_name}
                  </span>
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                {error && (
                  <div className="border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive font-mono">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="invite-email"
                      className="text-xs font-mono uppercase tracking-wider text-muted-foreground"
                    >
                      E-mail
                    </label>
                    <input
                      id="invite-email"
                      type="email"
                      value={invitation.email}
                      disabled
                      className="w-full px-4 py-3 text-sm bg-muted/30 border border-border outline-none rounded-none font-mono opacity-70 cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="name"
                      className="text-xs font-mono uppercase tracking-wider text-muted-foreground"
                    >
                      Nome completo
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="AUDITOR NOME"
                      className="w-full px-4 py-3 text-sm bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors rounded-none font-mono uppercase"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="invite-password"
                      className="text-xs font-mono uppercase tracking-wider text-muted-foreground"
                    >
                      Senha
                    </label>
                    <input
                      id="invite-password"
                      type="password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="MÍN. 8 CARACTERES"
                      className="w-full px-4 py-3 text-sm bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors rounded-none font-mono tracking-widest"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="confirm-password"
                      className="text-xs font-mono uppercase tracking-wider text-muted-foreground"
                    >
                      Confirmar senha
                    </label>
                    <input
                      id="confirm-password"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 text-sm bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors rounded-none font-mono tracking-widest"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary text-primary-foreground py-3 text-sm font-bold tracking-widest uppercase hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 transition-all rounded-none mt-2"
                >
                  {submitting ? "Registrando..." : "Finalizar Registro"}
                </button>
              </form>
            </>
          ) : null}
        </div>

        {/* Footer info strictly positioned */}
        <div className="absolute bottom-8 left-0 right-0 text-center">
          <p className="text-[10px] font-mono text-muted-foreground uppercase opacity-50 tracking-[0.2em]">
            V 3.0.0 · COGITARI GOVERNANCE
          </p>
        </div>
      </div>
    </div>
  );
}
