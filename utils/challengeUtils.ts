import { Challenge, DailyLog, UserProfile } from '../types';

export const availableChallenges: Challenge[] = [
    {
        id: 'water_2l_7d',
        title: 'Hidratação Total',
        description: 'Beba pelo menos 2 litros de água por 7 dias.',
        type: 'water',
        goalValue: 7, // days
        durationDays: 7,
        dailyTarget: 2000, // ml
    },
    {
        id: 'deficit_5d',
        title: 'Foco no Déficit',
        description: 'Mantenha um déficit calórico por 5 dias nesta semana.',
        type: 'deficit',
        goalValue: 5, // days
        durationDays: 5,
    },
    {
        id: 'protein_goal_3d',
        title: 'Mestre da Proteína',
        description: 'Bata sua meta de proteína por 3 dias nesta semana.',
        type: 'protein_goal',
        goalValue: 3, // days
        durationDays: 3,
    },
    {
        id: 'log_streak_7d',
        title: 'Semana Perfeita',
        description: 'Registre suas refeições por 7 dias seguidos.',
        type: 'log_streak',
        goalValue: 7, // days
        durationDays: 7,
    },
    {
        id: 'low_carb_3d',
        title: 'Controle de Carboidratos',
        description: 'Mantenha a ingestão de carboidratos abaixo de 50g por 3 dias.',
        type: 'low_carb',
        goalValue: 3, // days
        durationDays: 3,
        dailyTarget: 50, // g
    },
];

export const getWeekNumber = (d: Date): number => {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return weekNo;
};


export const getStartOfWeek = (d: Date): Date => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const newDate = new Date(date.setDate(diff));
    newDate.setHours(0,0,0,0);
    return newDate;
};


export const updateChallengeProgress = (profile: UserProfile, logs: Record<string, Omit<DailyLog, 'micronutrientIntake'>>, challenge: Challenge): UserProfile => {
    if (!profile.challengeProgress || profile.challengeProgress.challengeId !== challenge.id) {
        return profile;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let successfulDays = 0;

    // Log streak is a special case: it must be N consecutive days ending today.
    if (challenge.type === 'log_streak') {
        for (let i = 0; i < challenge.goalValue; i++) {
            const dayDate = new Date(today);
            dayDate.setDate(today.getDate() - i);
            const dateString = dayDate.toISOString().split('T')[0];
            const log = logs[dateString];
            if (log && log.meals.some(m => m.items.length > 0)) {
                successfulDays++;
            } else {
                break; // Streak is broken
            }
        }
    } else {
        // For all other challenges, count successful days within the challenge date range.
        const challengeStartDate = new Date(profile.challengeProgress.startDate);
        challengeStartDate.setHours(0,0,0,0);
        
        const challengeEndDate = profile.challengeProgress.endDate
            ? new Date(profile.challengeProgress.endDate)
            : new Date(new Date(challengeStartDate).setDate(challengeStartDate.getDate() + 6));
        challengeEndDate.setHours(0,0,0,0);

        let currentDate = new Date(challengeStartDate);
        const loopUntil = today < challengeEndDate ? today : challengeEndDate;

        while(currentDate <= loopUntil) {
            const dateString = currentDate.toISOString().split('T')[0];
            const log = logs[dateString];
            if (log) {
                 const totals = log.meals.reduce((acc, meal) => {
                    meal.items.forEach(item => {
                        acc.calories += item.calories;
                        acc.protein += item.protein;
                        acc.carbs += item.carbs;
                    });
                    return acc;
                }, { calories: 0, protein: 0, carbs: 0 });

                let daySucceeded = false;
                switch (challenge.type) {
                    case 'water':
                        if (log.waterIntake >= (challenge.dailyTarget || 2000)) daySucceeded = true;
                        break;
                    case 'deficit':
                        if (totals.calories > 0 && totals.calories < profile.goals.calories) daySucceeded = true;
                        break;
                    case 'protein_goal':
                        if (totals.protein >= profile.goals.protein) daySucceeded = true;
                        break;
                    case 'low_carb':
                        if (challenge.dailyTarget && totals.carbs < challenge.dailyTarget) daySucceeded = true;
                        break;
                }
                if (daySucceeded) successfulDays++;
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }
    }

    const isCompleted = successfulDays >= challenge.goalValue;
    const progressArray = Array(challenge.durationDays).fill(false).map((_, i) => i < successfulDays);

    const updatedProfile = { ...profile };
    updatedProfile.challengeProgress = {
        ...profile.challengeProgress,
        progress: progressArray,
        completed: isCompleted,
    };
    
    return updatedProfile;
};