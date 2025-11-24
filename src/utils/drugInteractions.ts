import { DrugInteraction } from '@/types/medication';

// Base de datos simulada de interacciones medicamentosas comunes
// En producción, esto debería conectarse a una API médica real
export const knownInteractions: DrugInteraction[] = [
  {
    drug1: 'warfarina',
    drug2: 'aspirina',
    severity: 'high',
    description: 'Aumenta el riesgo de sangrado significativamente'
  },
  {
    drug1: 'omeprazol',
    drug2: 'clopidogrel',
    severity: 'high',
    description: 'Reduce la efectividad del anticoagulante'
  },
  {
    drug1: 'atorvastatina',
    drug2: 'gemfibrozilo',
    severity: 'high',
    description: 'Aumenta el riesgo de daño muscular (rabdomiólisis)'
  },
  {
    drug1: 'metformina',
    drug2: 'alcohol',
    severity: 'moderate',
    description: 'Aumenta el riesgo de acidosis láctica'
  },
  {
    drug1: 'losartán',
    drug2: 'ibuprofeno',
    severity: 'moderate',
    description: 'Puede reducir la efectividad del antihipertensivo'
  },
  {
    drug1: 'levotiroxina',
    drug2: 'calcio',
    severity: 'moderate',
    description: 'El calcio puede interferir con la absorción de levotiroxina'
  },
];

export function checkDrugInteraction(drug1: string, drug2: string): DrugInteraction | null {
  const normalizedDrug1 = drug1.toLowerCase().trim();
  const normalizedDrug2 = drug2.toLowerCase().trim();

  const interaction = knownInteractions.find(
    (interaction) =>
      (interaction.drug1.toLowerCase() === normalizedDrug1 &&
        interaction.drug2.toLowerCase() === normalizedDrug2) ||
      (interaction.drug1.toLowerCase() === normalizedDrug2 &&
        interaction.drug2.toLowerCase() === normalizedDrug1)
  );

  return interaction || null;
}

export function checkMultipleDrugInteractions(medications: string[]): DrugInteraction[] {
  const interactions: DrugInteraction[] = [];
  
  for (let i = 0; i < medications.length; i++) {
    for (let j = i + 1; j < medications.length; j++) {
      const interaction = checkDrugInteraction(medications[i], medications[j]);
      if (interaction) {
        interactions.push(interaction);
      }
    }
  }

  return interactions;
}

export function suggestTimeAdjustment(time1: string, time2: string, minHoursDiff: number = 2): string {
  const [hours1, minutes1] = time1.split(':').map(Number);
  const [hours2, minutes2] = time2.split(':').map(Number);
  
  const time1Minutes = hours1 * 60 + minutes1;
  const time2Minutes = hours2 * 60 + minutes2;
  
  const diffMinutes = Math.abs(time2Minutes - time1Minutes);
  const minDiffMinutes = minHoursDiff * 60;
  
  if (diffMinutes < minDiffMinutes) {
    // Adjust time2 to be minHoursDiff hours after time1
    let adjustedMinutes = time1Minutes + minDiffMinutes;
    
    // Handle day overflow
    if (adjustedMinutes >= 24 * 60) {
      adjustedMinutes = adjustedMinutes - 24 * 60;
    }
    
    const adjustedHours = Math.floor(adjustedMinutes / 60);
    const adjustedMins = adjustedMinutes % 60;
    
    return `${String(adjustedHours).padStart(2, '0')}:${String(adjustedMins).padStart(2, '0')}`;
  }
  
  return time2;
}
