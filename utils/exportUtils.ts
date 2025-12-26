
import { DailyLog, UserProfile } from "../types";

// Function to convert data to CSV format and trigger download
export const exportLogToCSV = (log: DailyLog, date: string, profile: UserProfile) => {
    // CSV Header
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Refeição,Alimento,Calorias,Proteína (g),Carboidratos (g),Gordura (g),Porção\r\n";

    // Add meal items
    log.meals.forEach(meal => {
        meal.items.forEach(item => {
            const row = [
                `"${meal.name}"`,
                `"${item.name}"`,
                item.calories,
                item.protein,
                item.carbs,
                item.fat,
                `"${item.servingSize}"`
            ].join(',');
            csvContent += row + "\r\n";
        });
    });

    // Add totals and summary
    const totals = log.meals.reduce(
        (acc, meal) => {
            meal.items.forEach(item => {
                acc.calories += item.calories;
                acc.protein += item.protein;
                acc.carbs += item.carbs;
                acc.fat += item.fat;
            });
            return acc;
        },
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
    
    csvContent += "\r\n";
    csvContent += "Resumo do Dia\r\n";
    csvContent += `Total de Calorias,${totals.calories},Meta,${profile.goals.calories}\r\n`;
    csvContent += `Total de Proteína (g),${totals.protein},Meta,${profile.goals.protein}\r\n`;
    csvContent += `Total de Carboidratos (g),${totals.carbs},Meta,${profile.goals.carbs}\r\n`;
    csvContent += `Total de Gordura (g),${totals.fat},Meta,${profile.goals.fat}\r\n`;
    csvContent += `Ingestão de Água (ml),${log.waterIntake},Meta,${profile.goals.water}\r\n`;

    // Create a link and trigger the download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `calorix_log_${date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const exportUserDataToJSON = (profile: UserProfile, logs: Record<string, Omit<DailyLog, 'micronutrientIntake'>>) => {
    const dataToExport = {
        userProfile: profile,
        dailyLogs: logs,
    };

    const jsonString = JSON.stringify(dataToExport, null, 2); // Pretty print JSON
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `calorix_my_data_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
