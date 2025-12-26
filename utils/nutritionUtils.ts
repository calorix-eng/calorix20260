import { UserProfile, ActivityLevel } from '../types';
import { getRDAs } from './rdaData';

type CalculationParams = Omit<UserProfile, 'goals' | 'name' | 'mealCategories' | 'avatar' | 'reminders' | 'exercises' | 'customWaterGoal' | 'mealCategories' | 'reminders'>;


export const calculateNutritionalGoals = (params: CalculationParams) => {
  const { age, sex, weight, height, activityLevel, goal, activityType } = params;

  // Harris-Benedict BMR Equation
  let bmr = 0;
  if (sex === 'male') {
    bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
  } else {
    bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
  }

  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    very: 1.725,
    extra: 1.9,
  };

  // TDEE (Total Daily Energy Expenditure)
  let tdee = bmr * activityMultipliers[activityLevel];

  if (goal === 'lose') {
    tdee -= 500;
  } else if (goal === 'gain') {
    tdee += 500;
  }

  const calories = Math.round(tdee);
  
  // Macronutrient split logic
  let proteinRatio = 0.30; // default
  let carbRatio = 0.40;    // default
  let fatRatio = 0.30;     // default

  if (activityType === 'weightlifting' || activityType === 'crossfit') {
    switch (goal) {
      case 'gain':
        proteinRatio = 0.35; // Higher protein for muscle building
        carbRatio = 0.40;
        fatRatio = 0.25;
        break;
      case 'lose':
        proteinRatio = 0.40; // Higher protein for satiety and muscle preservation
        carbRatio = 0.30;
        fatRatio = 0.30;
        break;
      case 'maintain':
        proteinRatio = 0.35;
        carbRatio = 0.35;
        fatRatio = 0.30;
        break;
    }
  }
  
  const protein = Math.round((calories * proteinRatio) / 4);
  const carbs = Math.round((calories * carbRatio) / 4);
  const fat = Math.round((calories * fatRatio) / 9);

  // Water goal: 35ml per kg of body weight
  const water = Math.round(weight * 35);
  
  // Micronutrient goals
  const micronutrients = getRDAs(age, sex);


  return { calories, protein, carbs, fat, water, micronutrients };
};