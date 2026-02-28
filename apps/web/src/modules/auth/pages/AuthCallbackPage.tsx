import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../../../config/supabase";
import { ThemeToggle } from "../../../shared/components/ui/ThemeToggle";

export function AuthCallbackPage() {
  const { user, initialized } = useAuth();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    // Check if the URL hash contains tokens (Supabase redirects with hash fragments)
    const hashParams = new URLSearchParams(
      window.location.hash.substring(1), // remove the '#'
    );
    const accessToken = hashParams.get("access_token");
    const type = hashParams.get("type");

    if (accessToken && type === "recovery") {
      // Password recovery flow — Supabase will auto-set the session via onAuthStateChange
      // Listen for the PASSWORD_RECOVERY event
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event) => {
        if (event === "PASSWORD_RECOVERY") {
          // Redirect to update password page (or profile page with password section)
          navigate("/profile?action=update-password", { replace: true });
          subscription.unsubscribe();
        }
      });

      // Give supabase some time to process the token
      const timeout = setTimeout(() => {
        setProcessing(false);
        subscription.unsubscribe();
      }, 5000);

      return () => {
        clearTimeout(timeout);
        subscription.unsubscribe();
      };
    }

    // Regular callback (email confirmation, login, etc.)
    // Supabase handles session setting automatically.
    // We just need to wait for the AuthContext to update.
    setProcessing(false);
  }, [navigate]);

  useEffect(() => {
    if (!processing && initialized) {
      if (user) {
        navigate("/", { replace: true });
      } else {
        // If no user, redirect to home or login
        navigate("/", { replace: true });
      }
    }
  }, [user, initialized, processing, navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center font-sans relative">
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <p className="text-sm font-bold tracking-widest uppercase text-muted-foreground animate-pulse">
          Autenticando...
        </p>
      </div>
    </div>
  );
}
