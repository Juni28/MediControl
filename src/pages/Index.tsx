import { useState, useEffect } from 'react';
import { Medication, MedicationLog } from '@/types/medication';
import { AddMedicationDialog } from '@/components/AddMedicationDialog';
import { DailySchedule } from '@/components/DailySchedule';
import { InteractionAlert } from '@/components/InteractionAlert';
import { MedicationCard } from '@/components/MedicationCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pill, Calendar, List, AlertTriangle } from 'lucide-react';
import { checkMultipleDrugInteractions } from '@/utils/drugInteractions';
import { toast } from 'sonner';

const Index = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [logs, setLogs] = useState<MedicationLog[]>([]);

  // Load from localStorage
  useEffect(() => {
    const savedMeds = localStorage.getItem('medications');
    const savedLogs = localStorage.getItem('medicationLogs');
    
    if (savedMeds) setMedications(JSON.parse(savedMeds));
    if (savedLogs) setLogs(JSON.parse(savedLogs));
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('medications', JSON.stringify(medications));
  }, [medications]);

  useEffect(() => {
    localStorage.setItem('medicationLogs', JSON.stringify(logs));
  }, [logs]);

  const handleAddMedication = (medication: Medication) => {
    setMedications([...medications, medication]);
    toast.success(`${medication.name} agregado correctamente`);
  };

  const handleMarkAsTaken = (medicationId: string, time: string) => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toTimeString().split(' ')[0].slice(0, 5);

    const newLog: MedicationLog = {
      id: Date.now().toString(),
      medicationId,
      scheduledTime: time,
      takenTime: now,
      status: 'taken',
      date: today
    };

    setLogs([...logs, newLog]);
    
    const medication = medications.find(m => m.id === medicationId);
    toast.success(`${medication?.name} marcado como tomado`);
  };

  const handleDeleteMedication = (id: string) => {
    const medication = medications.find(m => m.id === id);
    if (window.confirm(`¿Eliminar ${medication?.name}?`)) {
      setMedications(medications.filter(m => m.id !== id));
      setLogs(logs.filter(l => l.medicationId !== id));
      toast.success('Medicamento eliminado');
    }
  };

  // Check for interactions
  const allMedNames = medications.map(m => m.name);
  const interactions = checkMultipleDrugInteractions(allMedNames);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="text-center py-6">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <Pill className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              MediControl
            </h1>
          </div>
          <p className="text-muted-foreground">
            Control inteligente de medicamentos y sus interacciones
          </p>
        </div>

        {/* Interaction Alerts */}
        {interactions.length > 0 && (
          <InteractionAlert interactions={interactions} />
        )}

        {/* Add Medication Button */}
        <div className="flex justify-center">
          <AddMedicationDialog 
            existingMedications={medications}
            onAdd={handleAddMedication}
          />
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="today" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="today" className="gap-2">
              <Calendar className="h-4 w-4" />
              Hoy
            </TabsTrigger>
            <TabsTrigger value="medications" className="gap-2">
              <List className="h-4 w-4" />
              Medicamentos
            </TabsTrigger>
            <TabsTrigger value="interactions" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              Interacciones
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="mt-6">
            <DailySchedule
              medications={medications}
              logs={logs}
              onMarkAsTaken={handleMarkAsTaken}
            />
          </TabsContent>

          <TabsContent value="medications" className="mt-6 space-y-4">
            {medications.length === 0 ? (
              <div className="text-center py-12">
                <Pill className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-lg">
                  No tienes medicamentos registrados
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Agrega tu primer medicamento para comenzar
                </p>
              </div>
            ) : (
              medications.map(med => {
                const nextDose = med.times.sort()[0];
                const hasInteractions = (med.interactions?.length || 0) > 0;
                
                return (
                  <div key={med.id} className="relative">
                    <MedicationCard
                      medication={med}
                      nextDose={nextDose}
                      hasInteractions={hasInteractions}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => handleDeleteMedication(med.id)}
                    >
                      Eliminar
                    </Button>
                  </div>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="interactions" className="mt-6">
            {interactions.length === 0 ? (
              <div className="text-center py-12">
                <AlertTriangle className="h-16 w-16 mx-auto text-success mb-4" />
                <p className="text-foreground text-lg font-semibold">
                  ¡Todo bien!
                </p>
                <p className="text-muted-foreground mt-2">
                  No se detectaron interacciones entre tus medicamentos
                </p>
              </div>
            ) : (
              <InteractionAlert interactions={interactions} />
            )}
          </TabsContent>
        </Tabs>

        {/* Footer Info */}
        <div className="text-center text-xs text-muted-foreground pt-6 pb-4 border-t">
          <p>⚕️ Esta aplicación es una herramienta de apoyo educativo.</p>
          <p className="mt-1">Siempre consulta con un profesional de la salud.</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
