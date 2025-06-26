import { BrainCircuitIcon } from "lucide-react";

interface TypingIndicatorProps {
  className?: string;
}

export function TypingIndicator({ className = "" }: TypingIndicatorProps) {
  return (
    <div className={`flex gap-4 p-6 bg-muted/30 ${className}`}>
      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-brand-accent text-white flex items-center justify-center">
        <BrainCircuitIcon className="w-4 h-4" />
      </div>

      {/* Contenu */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-semibold text-sm">RStudio IA</span>
          <span className="text-xs text-muted-foreground">
            en train d'écrire...
          </span>
        </div>

        {/* Animation de frappe */}
        <div className="flex items-center gap-1">
          <div className="flex gap-1">
            <div
              className="w-2 h-2 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: "0ms" }}
            ></div>
            <div
              className="w-2 h-2 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: "150ms" }}
            ></div>
            <div
              className="w-2 h-2 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: "300ms" }}
            ></div>
          </div>
          <span className="text-sm text-muted-foreground ml-2">
            Génération de la réponse...
          </span>
        </div>
      </div>
    </div>
  );
}
