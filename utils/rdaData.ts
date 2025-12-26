import { MicronutrientGoal } from '../types';

// Valores baseados em RDAs (Recommended Dietary Allowances) do National Institutes of Health (NIH), simplificados.
// As unidades são miligramas (mg) ou microgramas (mcg).

interface RdaValues {
    'Vitamina C': { amount: number, unit: 'mg' },
    'Cálcio': { amount: number, unit: 'mg' },
    'Ferro': { amount: number, unit: 'mg' },
    'Vitamina D': { amount: number, unit: 'mcg' },
    'Vitamina A': { amount: number, unit: 'mcg' },
    'Potássio': { amount: number, unit: 'mg' },
    'Magnésio': { amount: number, unit: 'mg' },
}

const rdaMale: { [ageRange: string]: RdaValues } = {
    '19-50': {
        'Vitamina C': { amount: 90, unit: 'mg' },
        'Cálcio': { amount: 1000, unit: 'mg' },
        'Ferro': { amount: 8, unit: 'mg' },
        'Vitamina D': { amount: 15, unit: 'mcg' },
        'Vitamina A': { amount: 900, unit: 'mcg' },
        'Potássio': { amount: 3400, unit: 'mg' },
        'Magnésio': { amount: 420, unit: 'mg' },
    },
    '51+': {
        'Vitamina C': { amount: 90, unit: 'mg' },
        'Cálcio': { amount: 1200, unit: 'mg' },
        'Ferro': { amount: 8, unit: 'mg' },
        'Vitamina D': { amount: 20, unit: 'mcg' },
        'Vitamina A': { amount: 900, unit: 'mcg' },
        'Potássio': { amount: 3400, unit: 'mg' },
        'Magnésio': { amount: 420, unit: 'mg' },
    },
};

const rdaFemale: { [ageRange: string]: RdaValues } = {
    '19-50': {
        'Vitamina C': { amount: 75, unit: 'mg' },
        'Cálcio': { amount: 1000, unit: 'mg' },
        'Ferro': { amount: 18, unit: 'mg' },
        'Vitamina D': { amount: 15, unit: 'mcg' },
        'Vitamina A': { amount: 700, unit: 'mcg' },
        'Potássio': { amount: 2600, unit: 'mg' },
        'Magnésio': { amount: 320, unit: 'mg' },
    },
    '51+': {
        'Vitamina C': { amount: 75, unit: 'mg' },
        'Cálcio': { amount: 1200, unit: 'mg' },
        'Ferro': { amount: 8, unit: 'mg' },
        'Vitamina D': { amount: 20, unit: 'mcg' },
        'Vitamina A': { amount: 700, unit: 'mcg' },
        'Potássio': { amount: 2600, unit: 'mg' },
        'Magnésio': { amount: 320, unit: 'mg' },
    },
};

export const getRDAs = (age: number, sex: 'male' | 'female' | 'prefer_not_to_say'): MicronutrientGoal => {
    let ageRange: string;
    if (age >= 19 && age <= 50) {
        ageRange = '19-50';
    } else if (age > 50) {
        ageRange = '51+';
    } else {
        // Default to 19-50 for simplicity if age is outside defined ranges
        ageRange = '19-50';
    }

    if (sex === 'male') {
        return rdaMale[ageRange];
    } else {
        return rdaFemale[ageRange];
    }
};