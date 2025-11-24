import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X, AlertTriangle } from 'lucide-react';
import { Medication } from '@/types/medication';
import { checkMultipleDrugInteractions, suggestTimeAdjustment } from '@/utils/drugInteractions';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AddMedicationDialogProps {
  existingMedications: Medication[];
  onAdd: (medication: Medication) => void;
}

export function AddMedicationDialog({ existingMedications, onAdd }: AddMedicationDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [times, setTimes] = useState<string[]>(['']);
  const [notes, setNotes] = useState('');
  const [warnings, setWarnings] = useState<string[]>([]);

  const handleAddTime = () => {
    setTimes([...times, '']);
  };

  const handleRemoveTime = (index: number) => {
    setTimes(times.filter((_, i) => i !== index));
  };

  const handleTimeChange = (index: number, value: string) => {
    const newTimes = [...times];
    newTimes[index] = value;
    setTimes(newTimes);
    
    // Check for time conflicts with interacting medications
    checkForConflicts(name, newTimes);
  };

  const checkForConflicts = (drugName: string, scheduledTimes: string[]) => {
    if (!drugName.trim()) return;
    
    const allDrugs = [drugName, ...existingMedications.map(m => m.name)];
    const interactions = checkMultipleDrugInteractions(allDrugs);
    
    const newWarnings: string[] = [];
    
    interactions.forEach(interaction => {
      const interactingMed = existingMedications.find(
        m => m.name.toLowerCase() === interaction.drug1.toLowerCase() || 
             m.name.toLowerCase() === interaction.drug2.toLowerCase()
      );
      
      if (interactingMed) {
        interactingMed.times.forEach(existingTime => {
          scheduledTimes.forEach(newTime => {
            if (newTime) {
              const [h1, m1] = existingTime.split(':').map(Number);
              const [h2, m2] = newTime.split(':').map(Number);
              const diff = Math.abs((h1 * 60 + m1) - (h2 * 60 + m2));
              
              if (diff < 120) { // Less than 2 hours apart
                newWarnings.push(
                  `⚠️ ${interaction.severity === 'high' ? 'ALERTA CRÍTICA' : 'Advertencia'}: ${name} interactúa con ${interactingMed.name}. Separar al menos 2 horas.`
                );
              }
            }
          });
        });
      }
    });
    
    setWarnings(newWarnings);
  };

  const handleSubmit = () => {
    if (!name || !dosage || times.some(t => !t)) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    const allDrugs = [name, ...existingMedications.map(m => m.name)];
    const interactions = checkMultipleDrugInteractions(allDrugs);
    
    if (interactions.length > 0 && warnings.length > 0) {
      const confirmed = window.confirm(
        `Se detectaron ${interactions.length} interacción(es) medicamentosa(s). ¿Deseas continuar de todos modos? Se recomienda consultar con un profesional de la salud.`
      );
      if (!confirmed) return;
    }

    const newMedication: Medication = {
      id: Date.now().toString(),
      name,
      dosage,
      frequency,
      times: times.filter(t => t),
      startDate: new Date().toISOString(),
      notes,
      interactions: interactions.map(i => i.drug1 === name ? i.drug2 : i.drug1)
    };

    onAdd(newMedication);
    
    // Reset form
    setName('');
    setDosage('');
    setFrequency('');
    setTimes(['']);
    setNotes('');
    setWarnings([]);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 w-full sm:w-auto">
          <Plus className="h-5 w-5" />
          Agregar Medicamento
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Medicamento</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {warnings.length > 0 && (
            <Alert variant="destructive" className="border-warning bg-warning/10">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                {warnings.map((warning, i) => (
                  <div key={i} className="mb-1">{warning}</div>
                ))}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Medicamento *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                checkForConflicts(e.target.value, times);
              }}
              placeholder="ej: Aspirina"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dosage">Dosis *</Label>
            <Input
              id="dosage"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              placeholder="ej: 100mg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency">Frecuencia</Label>
            <Input
              id="frequency"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              placeholder="ej: Cada 8 horas"
            />
          </div>

          <div className="space-y-2">
            <Label>Horarios *</Label>
            {times.map((time, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => handleTimeChange(index, e.target.value)}
                  className="flex-1"
                />
                {times.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleRemoveTime(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={handleAddTime}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Horario
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Instrucciones especiales, con o sin alimentos, etc."
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>
            Guardar Medicamento
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
