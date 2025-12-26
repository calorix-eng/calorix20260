import { Reminder } from '../types';

/**
 * Provides a default set of reminders for new user profiles.
 */
export const getDefaultReminders = (): Reminder[] => [
    { id: 'logBreakfast', label: 'Registrar Café da Manhã', enabled: false, time: '09:00' },
    { id: 'logLunch', label: 'Registrar Almoço', enabled: false, time: '13:00' },
    { id: 'logDinner', label: 'Registrar Jantar', enabled: false, time: '20:00' },
    // Interval reminders start at 8am and repeat every `interval` hours.
    { id: 'drinkWater', label: 'Beber Água', enabled: false, interval: 2, time: '08:00' },
    { id: 'supplements', label: 'Tomar Suplementos', enabled: false, time: '08:00' },
];
