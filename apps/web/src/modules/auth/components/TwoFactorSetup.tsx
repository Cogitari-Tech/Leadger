import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "../../../config/supabase";
import { Button } from "../../../shared/components/ui/Button";
import { Input } from "../../../shared/components/ui/Input";
import { CheckCircle2, ShieldAlert, Loader2 } from "lucide-react";

export function TwoFactorSetup() {
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    checkEnrollment();
  }, []);

  const checkEnrollment = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;

      const totpFactors = data.totp || [];
      const enrolled = totpFactors.some(
        (factor) => factor.status === "verified",
      );
      setIsEnrolled(enrolled);

      if (enrolled) {
        // Find the verified factor ID
        const verifiedFactor = totpFactors.find((f) => f.status === "verified");
        if (verifiedFactor) {
          setFactorId(verifiedFactor.id);
        }
      }
    } catch (err: any) {
      console.error("Error checking MFA status:", err);
    }
  };

  const startEnrollment = async () => {
    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
      });

      if (error) throw error;

      setFactorId(data.id);
      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
    } catch (err: any) {
      console.error("[2FA Enrollment Error]:", err);
      let errMsg = err.message || "Falha ao iniciar configuração do 2FA.";
      if (err.message?.includes("not enabled")) {
        errMsg =
          "O Autenticador TOTP não foi ativado no painel do banco de dados de autenticação. Confirme se a funcionalidade MFA está habilitada.";
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const verifyEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factorId) return;

    setLoading(true);
    setError("");

    try {
      // Step 1: Challenge
      const challengeCode = await supabase.auth.mfa.challenge({ factorId });
      if (challengeCode.error) throw challengeCode.error;

      // Step 2: Verify
      const { error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeCode.data.id,
        code: verifyCode,
      });

      if (error) throw error;

      setIsEnrolled(true);
    } catch (err: any) {
      console.error("[2FA Verification Error]:", err);
      setError(err.message || "Código inválido. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const unenroll = async () => {
    if (!factorId) return;
    setLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId });
      if (error) throw error;

      setIsEnrolled(false);
      setFactorId(null);
      setQrCode(null);
      setSecret(null);
      setVerifyCode("");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Falha ao desativar 2FA.");
    } finally {
      setLoading(false);
    }
  };

  if (isEnrolled) {
    return (
      <div className="rounded-2xl border border-border/40 bg-background/50 backdrop-blur-sm p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-emerald-500/10 p-3 text-emerald-500">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <h3 className="text-lg font-medium text-foreground">
              Autenticação de Dois Fatores (2FA) Ativa
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Sua conta está mais segura. Um código será solicitado sempre que
              você fizer login.
            </p>
            <div className="mt-4">
              <Button variant="danger" onClick={unenroll} disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                <span>Desativar 2FA</span>
              </Button>
            </div>
            {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/40 bg-background/50 backdrop-blur-sm p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="rounded-full bg-amber-500/10 p-3 text-amber-500">
          <ShieldAlert size={24} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-medium text-foreground">
            Proteger Conta com 2FA
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Adicione uma camada extra de segurança à sua conta exigindo um
            código do Google Authenticator ou Authy no login.
          </p>

          {!qrCode ? (
            <div className="mt-6">
              <button
                onClick={startEnrollment}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-bold uppercase tracking-widest hover:brightness-110 disabled:opacity-50 transition-all active:scale-95"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                <span>Configurar 2FA (TOTP)</span>
              </button>
              {error && (
                <p className="mt-4 text-sm text-destructive font-medium border border-destructive/20 bg-destructive/10 p-3 rounded-lg">
                  {error}
                </p>
              )}
            </div>
          ) : (
            <div className="mt-6 flex flex-col gap-6 md:flex-row">
              <div className="flex shrink-0 flex-col items-center gap-4 rounded-xl border border-border/40 bg-muted/30 p-4">
                <div className="bg-white p-2 rounded-lg">
                  <QRCodeSVG value={qrCode} size={160} />
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    Ou use o código manual:
                  </p>
                  <code className="mt-1 block rounded bg-background border border-border/40 px-2 py-1 text-xs font-medium text-foreground">
                    {secret}
                  </code>
                </div>
              </div>

              <div className="flex-1">
                <form onSubmit={verifyEnrollment} className="space-y-4">
                  <div>
                    <label
                      htmlFor="code"
                      className="block text-sm font-medium text-foreground"
                    >
                      Código de Verificação
                    </label>
                    <p className="mb-3 mt-1 text-xs text-muted-foreground">
                      Escaneie o QR Code com o aplicativo Authy ou Google
                      Authenticator e digite o código de 6 dígitos gerado.
                    </p>
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
                      className="text-center text-xl tracking-[0.5em] font-mono h-14"
                      required
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-destructive font-medium">
                      {error}
                    </p>
                  )}

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setQrCode(null);
                        setFactorId(null);
                      }}
                      className="px-4 py-2.5 text-sm font-medium text-muted-foreground bg-muted/50 rounded-xl hover:bg-muted transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={verifyCode.length !== 6 || loading}
                      className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold uppercase tracking-widest hover:brightness-110 disabled:opacity-50 transition-all active:scale-95"
                    >
                      {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      <span>Ativar</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
