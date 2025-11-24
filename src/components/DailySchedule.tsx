import { Medication, MedicationLog } from '@/types/medication';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DailyScheduleProps {
  medications: Medication[];
  logs: MedicationLog[];
  onMarkAsTaken: (medicationId: string, time: string) => void;
}

interface ScheduledDose {
  medicationId: string;
  medicationName: string;
  dosage: string;
  time: string;
  status: 'pending' | 'taken' | 'overdue';
  hasInteraction: boolean;
}

export function DailySchedule({ medications, logs, onMarkAsTaken }: DailyScheduleProps) {
  const today = new Date().toISOString().split('T')[0];
  const currentTime = new Date();
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

  // Build schedule for today
  const schedule: ScheduledDose[] = [];
  
  medications.forEach(med => {
    med.times.forEach(time => {
      const [hours, minutes] = time.split(':').map(Number);
      const timeMinutes = hours * 60 + minutes;
      
      const log = logs.find(
        l => l.medicationId === med.id && 
             l.scheduledTime === time && 
             l.date === today
      );
      
      let status: 'pending' | 'taken' | 'overdue' = 'pending';
      if (log?.status === 'taken') {
        status = 'taken';
      } else if (timeMinutes < currentMinutes - 30) { // 30 min grace period
        status = 'overdue';
      }
      
      schedule.push({
        medicationId: med.id,
        medicationName: med.name,
        dosage: med.dosage,
        time,
        status,
        hasInteraction: (med.interactions?.length || 0) > 0
      });
    });
  });

  // Sort by time
  schedule.sort((a, b) => {
    const [aH, aM] = a.time.split(':').map(Number);
    const [bH, bM] = b.time.split(':').map(Number);
    return (aH * 60 + aM) - (bH * 60 + bM);
  });

  const takenCount = schedule.filter(s => s.status === 'taken').length;
  const pendingCount = schedule.filter(s => s.status === 'pending').length;
  const overdueCount = schedule.filter(s => s.status === 'overdue').length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 bg-success/10 border-success/20">
          <div className="text-2xl font-bold text-success">{takenCount}</div>
          <div className="text-sm text-muted-foreground">Tomados</div>
        </Card>
        <Card className="p-4 bg-primary/10 border-primary/20">
          <div className="text-2xl font-bold text-primary">{pendingCount}</div>
          <div className="text-sm text-muted-foreground">Pendientes</div>
        </Card>
        <Card className="p-4 bg-destructive/10 border-destructive/20">
          <div className="text-2xl font-bold text-destructive">{overdueCount}</div>
          <div className="text-sm text-muted-foreground">Retrasados</div>
        </Card>
      </div>

      <div className="space-y-3">
        {schedule.map((dose, index) => (
          <Card 
            key={`${dose.medicationId}-${dose.time}-${index}`}
            className={cn(
              "p-4 transition-all",
              dose.status === 'taken' && "bg-success/5 border-success/30",
              dose.status === 'overdue' && "bg-destructive/5 border-destructive/30",
              dose.hasInteraction && "border-l-4 border-l-warning"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "flex items-center justify-center w-16 h-16 rounded-xl font-bold text-lg",
                  dose.status === 'taken' ? "bg-success/20 text-success" :
                  dose.status === 'overdue' ? "bg-destructive/20 text-destructive" :
                  "bg-primary/20 text-primary"
                )}>
                  {dose.time}
                </div>
                
                <div>
                  <h4 className="font-semibold text-foreground">{dose.medicationName}</h4>
                  <p className="text-sm text-muted-foreground">{dose.dosage}</p>
                  
                  {dose.hasInteraction && (
                    <Badge variant="outline" className="mt-1 border-warning text-warning text-xs">
                      Tiene interacciones
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {dose.status === 'taken' ? (
                  <Badge className="bg-success hover:bg-success/90 gap-1">
                    <Check className="h-3 w-3" />
                    Tomado
                  </Badge>
                ) : dose.status === 'overdue' ? (
                  <Badge variant="destructive" className="gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Retrasado
                  </Badge>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => onMarkAsTaken(dose.medicationId, dose.time)}
                    className="gap-2"
                  >
                    <Check className="h-4 w-4" />
                    Marcar
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}

        {schedule.length === 0 && (
          <Card className="p-8 text-center">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No hay medicamentos programados para hoy</p>
          </Card>
        )}
      </div>
    </div>
  );
}
