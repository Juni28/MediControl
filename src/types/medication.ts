export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[]; // Array of times like ["08:00", "14:00", "20:00"]
  startDate: string;
  notes?: string;
  interactions?: string[]; // IDs of medications it interacts with
}

export interface MedicationLog {
  id: string;
  medicationId: string;
  scheduledTime: string;
  takenTime?: string;
  status: 'pending' | 'taken' | 'skipped';
  date: string;
}

export interface DrugInteraction {
  drug1: string;
  drug2: string;
  severity: 'high' | 'moderate' | 'low';
  description: string;
}
