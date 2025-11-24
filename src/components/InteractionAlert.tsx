import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Info } from 'lucide-react';
import { DrugInteraction } from '@/types/medication';
import { cn } from '@/lib/utils';

interface InteractionAlertProps {
  interactions: DrugInteraction[];
}

export function InteractionAlert({ interactions }: InteractionAlertProps) {
  if (interactions.length === 0) return null;

  const highSeverity = interactions.filter(i => i.severity === 'high');
  const moderateSeverity = interactions.filter(i => i.severity === 'moderate');

  return (
    <div className="space-y-3">
      {highSeverity.length > 0 && (
        <Alert variant="destructive" className="border-destructive bg-destructive/10">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="font-semibold">Interacciones Críticas Detectadas</AlertTitle>
          <AlertDescription className="mt-2 space-y-2">
            {highSeverity.map((interaction, index) => (
              <div key={index} className="text-sm">
                <strong>{interaction.drug1}</strong> + <strong>{interaction.drug2}</strong>
                <p className="text-destructive-foreground/90 mt-1">{interaction.description}</p>
              </div>
            ))}
            <p className="text-xs mt-3 pt-3 border-t border-destructive/20">
              ⚠️ Consulta con tu médico antes de tomar estos medicamentos juntos.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {moderateSeverity.length > 0 && (
        <Alert className="border-warning bg-warning/10">
          <Info className="h-5 w-5 text-warning" />
          <AlertTitle className="font-semibold text-warning-foreground">Advertencias de Interacción</AlertTitle>
          <AlertDescription className="mt-2 space-y-2">
            {moderateSeverity.map((interaction, index) => (
              <div key={index} className="text-sm text-warning-foreground/90">
                <strong>{interaction.drug1}</strong> + <strong>{interaction.drug2}</strong>
                <p className="mt-1">{interaction.description}</p>
              </div>
            ))}
            <p className="text-xs mt-3 pt-3 border-t border-warning/20">
              💡 Considera separar la toma de estos medicamentos al menos 2 horas.
            </p>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
