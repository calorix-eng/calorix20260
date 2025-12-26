import React from 'react';
import { UserProfile, DailyLog } from './types';
import { ChartBarIcon } from './components/icons/ChartBarIcon';
import { StarIcon } from './components/icons/StarIcon';
import { LockClosedIcon } from './components/icons/LockClosedIcon';

interface ReportsDashboardProps {
    userProfile: UserProfile;
    dailyLogs: Record<string, Omit<DailyLog, 'micronutrientIntake'>>;
    onUpgradeClick: () => void;
}

const ReportsDashboard: React.FC<ReportsDashboardProps> = ({ userProfile, dailyLogs, onUpgradeClick }) => {

    if (!userProfile.isPremium) {
        return (
            <div className="relative bg-light-card dark:bg-dark-card p-8 rounded-xl shadow-lg text-center overflow-hidden">
                <div className="absolute inset-0 bg-light-card/50 dark:bg-dark-card/50 backdrop-blur-sm rounded-xl z-10"></div>
                <div className="relative z-20">
                    <LockClosedIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-2xl font-bold font-display text-gray-800 dark:text-white">Relatórios Avançados são um recurso Premium</h3>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Faça upgrade para ter acesso a análises detalhadas da sua jornada.</p>
                    <button onClick={onUpgradeClick} className="mt-6 flex items-center justify-center mx-auto space-x-2 bg-yellow-400 text-yellow-900 px-6 py-3 rounded-lg font-bold hover:bg-yellow-500 transition-colors text-lg">
                        <StarIcon className="w-6 h-6" />
                        <span>Desbloquear Agora</span>
                    </button>
                </div>
            </div>
        );
    }

    const generateWeeklyData = () => {
        const data = { calories: 0, protein: 0, carbs: 0, fat: 0, water: 0, daysLogged: 0 };
        const today = new Date();
        for (let i = 0; i < 7; i++) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateString = d.toISOString().split('T')[0];
            const log = dailyLogs[dateString];
            if (log) {
                data.daysLogged++;
                data.water += log.waterIntake;
                log.meals.forEach(meal => {
                    meal.items.forEach(item => {
                        data.calories += item.calories;
                        data.protein += item.protein;
                        data.carbs += item.carbs;
                        data.fat += item.fat;
                    });
                });
            }
        }
        return data;
    };

    const weeklyData = generateWeeklyData();
    const avgCalories = weeklyData.daysLogged > 0 ? Math.round(weeklyData.calories / weeklyData.daysLogged) : 0;
    const totalMacros = weeklyData.protein + weeklyData.carbs + weeklyData.fat || 1;

    const macroDistribution = {
        protein: Math.round((weeklyData.protein / totalMacros) * 100),
        carbs: Math.round((weeklyData.carbs / totalMacros) * 100),
        fat: Math.round((weeklyData.fat / totalMacros) * 100),
    };

    const FeatureCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
        <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold mb-4">{title}</h3>
            {children}
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center">
                <ChartBarIcon className="w-8 h-8 text-accent-green mr-3" />
                <h2 className="text-3xl font-bold font-display text-gray-800 dark:text-white">Relatórios Avançados</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FeatureCard title="Média de Calorias (Últimos 7 Dias)">
                    <div className="text-center">
                        <p className="text-6xl font-bold text-accent-green">{avgCalories}</p>
                        <p className="text-gray-500 dark:text-gray-400">kcal / dia</p>
                    </div>
                </FeatureCard>

                <FeatureCard title="Distribuição de Macronutrientes">
                    <div>
                        <p className="text-sm font-semibold mb-2">Média dos últimos 7 dias</p>
                        <div className="w-full flex h-8 rounded-full overflow-hidden">
                            <div className="bg-red-500 flex items-center justify-center text-white font-bold" style={{ width: `${macroDistribution.protein}%` }} title="Proteína">{macroDistribution.protein}%</div>
                            <div className="bg-orange-500 flex items-center justify-center text-white font-bold" style={{ width: `${macroDistribution.carbs}%` }} title="Carboidratos">{macroDistribution.carbs}%</div>
                            <div className="bg-yellow-500 flex items-center justify-center text-white font-bold" style={{ width: `${macroDistribution.fat}%` }} title="Gordura">{macroDistribution.fat}%</div>
                        </div>
                    </div>
                </FeatureCard>
                
                 <FeatureCard title="Consistência da Hidratação">
                    <p className="text-4xl font-bold text-accent-blue">{weeklyData.daysLogged > 0 ? Math.round(weeklyData.water / weeklyData.daysLogged) : 0} ml</p>
                    <p className="text-gray-500 dark:text-gray-400">Média de ingestão de água nos dias registrados.</p>
                </FeatureCard>

                <FeatureCard title="Mais Relatórios em Breve">
                    <p className="text-gray-500 dark:text-gray-400">Estamos trabalhando em novos relatórios para trazer ainda mais insights sobre sua jornada!</p>
                </FeatureCard>
            </div>
        </div>
    );
};

export default ReportsDashboard;