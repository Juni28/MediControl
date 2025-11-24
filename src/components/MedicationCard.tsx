import { Medication } from '@/types/medication';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Pill, AlertTriangle, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MedicationCardProps {
  medication: Medication;
  nextDose?: string;
  status?: 'pending' | 'taken' | 'overdue';
  onMarkAsTaken?: () => void;
  hasInteractions?: boolean;
}

export function MedicationCard({ 
  medication, 
  nextDose, 
  status = 'pending',
  onMarkAsTaken,
  hasInteractions = false
}: MedicationCardProps) {
  return (
    <Card className={cn(
      "p-4 transition-all hover:shadow-md",
      hasInteractions && "border-warning"
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div className={cn(
            "p-2 rounded-lg",
            status === 'taken' ? "bg-success/10" : "bg-primary/10"
          )}>
            <Pill className={cn(
              "h-5 w-5",
              status === 'taken' ? "text-success" : "text-primary"
            )} />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{medication.name}</h3>
            <p className="text-sm text-muted-foreground">{medication.dosage}</p>
          </div>
        </div>
        
        {hasInteractions && (
          <Badge variant="outline" className="border-warning text-warning gap-1">
            <AlertTriangle className="h-3 w-3" />
            Alerta
          </Badge>
        )}
      </div>

      {nextDose && (
        <div className="flex items-center gap-2 mb-3 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-foreground">Próxima dosis: {nextDose}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <Badge 
          variant={status === 'taken' ? 'default' : 'secondary'}
          className={cn(
            status === 'taken' && "bg-success hover:bg-success/90"
          )}
        >
          {status === 'taken' ? 'Tomado' : 'Pendiente'}
        </Badge>

        {status !== 'taken' && onMarkAsTaken && (
          <Button 
            size="sm" 
            onClick={onMarkAsTaken}
            className="gap-2"
          >
            <Check className="h-4 w-4" />
            Marcar como tomado
          </Button>
        )}
      </div>

      {medication.notes && (
        <p className="text-xs text-muted-foreground mt-3 pt-3 border-t">
          {medication.notes}
        </p>
      )}
    </Card>
  );
}
