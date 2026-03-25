import { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in application:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center h-full min-h-[400px]">
          <div className="w-16 h-16 bg-destructive/10 rounded-xl flex items-center justify-center mb-6 border border-destructive/20 shadow-sm">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold font-display tracking-tight text-foreground mb-3">
            Ocorreu um erro na página
          </h2>
          <p className="text-muted-foreground max-w-sm mx-auto mb-8 text-sm font-medium leading-relaxed">
            Houve uma falha inesperada ao tentar exibir as informações desta
            página. Nossos sistemas já registraram o incidente.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-bold uppercase tracking-widest hover:brightness-110 shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            Recarregar a Página
          </button>

          {process.env.NODE_ENV === "development" && this.state.error && (
            <div className="mt-12 p-4 bg-foreground/5 rounded-xl text-left border border-border/40 w-full max-w-2xl overflow-auto text-[11px] font-mono select-text custom-scrollbar">
              <strong className="text-destructive mb-2 block">
                {this.state.error.toString()}
              </strong>
              <div className="whitespace-pre text-muted-foreground/60 leading-relaxed">
                {this.state.error.stack}
              </div>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
