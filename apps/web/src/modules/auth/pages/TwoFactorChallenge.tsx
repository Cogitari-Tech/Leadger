import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../../../config/supabase";
import { Button } from "../../../shared/components/ui/Button";
import { Input } from "../../../shared/components/ui/Input";
import { ShieldCheck, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function TwoFactorChallenge() {
  const [verifyCode, setVerifyCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [rememberDevice, setRememberDevice] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  // Get where they were trying to go, default to dashboard
  const from = (location.state as any)?.from?.pathname || "/";

  useEffect(() => {
    checkFactors();
  }, []);

  const checkFactors = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;

      const totpFactors = data.totp || [];
      const verifiedFactor = totpFactors.find((f) => f.status === "verified");

      if (verifiedFactor) {
        setFactorId(verifiedFactor.id);
      } else {
        // No enrolled factor found, they shouldn't be here unless forced to enroll
        // But for challenge, if no factor exists, just let them go back to login
        signOut();
      }
    } catch (err) {
      console.error(err);
      signOut();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factorId) {
      setError("Nenhum fator 2FA configurado encontrado.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Step 1: Challenge
      const challenge = await supabase.auth.mfa.challenge({ factorId });
      if (challenge.error) throw challenge.error;

      // Step 2: Verify
      const { error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.data.id,
        code: verifyCode,
      });

      if (error) throw error;

      // Successfully verified AAL2! Handle device trust
      if (rememberDevice && user) {
        // Trust for 30 days
        const trustUntil = Date.now() + 30 * 24 * 60 * 60 * 1000;
        localStorage.setItem(`mfa_trust_${user.id}`, trustUntil.toString());
      }

      // Redirect to their destination
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error(err);
      setError("Código inválido. Tente novamente.");
      setVerifyCode("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center p-4"
      style={{
        backgroundImage:
          "radial-gradient(at 0% 0%, hsla(253, 16%, 7%, 1) 0, transparent 50%), radial-gradient(at 50% 0%, hsla(225, 39%, 30%, 1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(339, 49%, 30%, 1) 0, transparent 50%)",
      }}
    >
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <img
            src="/images/logo-light.webp"
            alt="Leadgers"
            className="h-10 w-auto drop-shadow-lg hidden dark:block"
          />
          <img
            src="/images/logo-dark.webp"
            alt="Leadgers"
            className="h-10 w-auto drop-shadow-lg block dark:hidden"
          />
        </div>

        <div className="glass-card border border-white/20 p-8 shadow-xl backdrop-blur-md">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-4 rounded-full bg-brand-500/20 p-3 text-brand-400 border border-brand-500/30">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-2xl font-bold text-white">
              Verificação em Duas Etapas
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Abra seu aplicativo autenticador e digite o código de 6 dígitos
              gerado.
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <Input
                id="code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="000 000"
                value={verifyCode}
                onChange={(e) =>
                  setVerifyCode(e.target.value.replace(/\D/g, ""))
                }
                className="h-14 bg-white/5 border-white/10 text-white placeholder-slate-500 text-center text-2xl tracking-[0.5em] focus:border-brand-500 focus:ring-brand-500/20"
                autoFocus
                required
              />
            </div>

            <div className="flex items-center justify-center">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberDevice}
                  onChange={(e) => setRememberDevice(e.target.checked)}
                  className="w-4 h-4 rounded border-white/10 text-brand-500 focus:ring-brand-500/20 bg-white/5 transition-all"
                />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-300 transition-colors">
                  Lembrar deste dispositivo por 30 dias
                </span>
              </label>
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 text-center">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-sm font-semibold rounded-xl bg-brand-500 hover:bg-brand-600 focus:ring-brand-500/50"
              disabled={verifyCode.length !== 6 || loading || !factorId}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {loading ? "Verificando..." : "Verificar Código"}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => signOut()}
                className="text-xs text-slate-500 hover:text-white transition-colors"
              >
                Cancelar e sair
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
