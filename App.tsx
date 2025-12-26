
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { UserProfile, DailyLog, Food, MealCategory, AuthUser, Post, Comment, AppNotification, Challenge, FastingState, ReactionType, PostCategory, Reminder, CompletedChallenge, UserChallengeProgress, Meal, Workout, View } from './types';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import AddFoodModal from './components/AddFoodModal';
import Header from './components/Header';
import { calculateNutritionalGoals } from './utils/nutritionUtils';
import ProfileModal, { ProfileTab } from './components/ProfileModal';
import Auth from './components/Auth';
import CommunityFeed from './components/CommunityFeed';
import RecipesDashboard from './components/RecipesDashboard';
import WorkoutDashboard from './components/WorkoutDashboard';
import VideosDashboard from './components/VideosDashboard';
import IntegrationsDashboard from './components/IntegrationsDashboard';
import { getDefaultReminders } from './utils/reminderUtils';
import Toast from './components/Toast';
import ChangePasswordModal from './components/ChangePasswordModal';
import InteractiveTutorial from './components/InteractiveTutorial';
import { availableChallenges, getStartOfWeek, getWeekNumber, updateChallengeProgress } from './utils/challengeUtils';
import ReportsDashboard from './ReportsDashboard';
import Sidebar from './components/Sidebar';
import QuickViewSidebar from './components/QuickViewSidebar';
import RemindersModal from './components/RemindersModal';
import ChallengesModal from './components/ChallengesModal';
import AchievementsModal from './components/AchievementsModal';
import NotificationsModal from './components/NotificationsModal';
import GoPremiumModal from './GoPremiumModal';


const initialFastingState: FastingState = {
  isFasting: false,
  startTime: null,
  durationHours: 0,
  endTime: null,
  completionNotified: false,
};

const calculateTotals = (meals: Meal[]) => {
  return meals.reduce(
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
};


const App: React.FC = () => {
  const [authUser, setAuthUser] = useLocalStorage<AuthUser | null>('calorix_authUser', null);
  
  const userProfileKey = authUser ? `userProfile_${authUser.uid}` : null;
  const [userProfile, setUserProfile] = useLocalStorage<UserProfile | null>(userProfileKey, null);

  const dailyLogsKey = authUser ? `dailyLogs_${authUser.uid}` : null;
  const [dailyLogs, setDailyLogs] = useLocalStorage<Record<string, Omit<DailyLog, 'micronutrientIntake'>>>(dailyLogsKey, {});
  
  const [communityPosts, setCommunityPosts] = useLocalStorage<Post[]>('communityPosts', []);

  const notificationsKey = authUser ? `notifications_${authUser.uid}` : null;
  const [notifications, setNotifications] = useLocalStorage<AppNotification[]>(notificationsKey, []);

  // Local storage for device-specific or less critical data
  const fastingStateKey = authUser ? `fastingState_${authUser.email}` : null;
  const lastNotifiedKey = authUser ? `lastNotified_${authUser.email}` : null;

  const [fastingState, setFastingState] = useLocalStorage<FastingState>(fastingStateKey, initialFastingState);
  const [lastNotified, setLastNotified] = useLocalStorage<Record<string, string>>(lastNotifiedKey, {});


  const [isAddFoodModalOpen, setIsAddFoodModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isRemindersModalOpen, setIsRemindersModalOpen] = useState(false);
  const [isChallengesModalOpen, setIsChallengesModalOpen] = useState(false);
  const [isAchievementsModalOpen, setIsAchievementsModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isGoPremiumModalOpen, setIsGoPremiumModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [initialProfileTab, setInitialProfileTab] = useState<ProfileTab>('profile');
  const [mealToAdd, setMealToAdd] = useState<MealCategory | null>(null);
  const [darkMode, setDarkMode] = useLocalStorage<boolean>('darkMode', false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [toast, setToast] = useState<{ message: string; id: number } | null>(null);
  const [showCoach, setShowCoach] = useState(false);
  
  const selectedDateString = selectedDate.toISOString().split('T')[0];
  const notifiedGoalsKey = authUser ? `notifiedGoals_${authUser.email}_${selectedDateString}` : null;
  const [notifiedGoals, setNotifiedGoals] = useLocalStorage<string[]>(notifiedGoalsKey, []);

  const showToast = useCallback((message: string) => {
    setToast({ message, id: Date.now() });
  }, []);
  
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then(registration => console.log('ServiceWorker registration successful with scope: ', registration.scope))
          .catch(err => console.log('ServiceWorker registration failed: ', err));
      });
    }
  }, []);

  // --- Auto-Sync Logic Simulation (Every 2 hours) ---
  useEffect(() => {
    if (!userProfile?.integrations) return;

    const syncInterval = 2 * 60 * 60 * 1000; // 2 hours in ms
    const checkSync = () => {
        const now = new Date();
        let profileUpdated = false;
        const newIntegrations = { ...userProfile.integrations };

        Object.keys(newIntegrations).forEach((key) => {
            const integration = newIntegrations[key as keyof typeof newIntegrations];
            if (integration && integration.enabled) {
                const lastSyncDate = integration.lastSync ? new Date(integration.lastSync) : new Date(0);
                if (now.getTime() - lastSyncDate.getTime() > syncInterval) {
                    integration.lastSync = now.toISOString();
                    profileUpdated = true;
                    console.log(`Auto-syncing ${key}...`);
                }
            }
        });

        if (profileUpdated) {
            setUserProfile({ ...userProfile, integrations: newIntegrations });
            showToast("Dados de saúde sincronizados automaticamente.");
        }
    };

    checkSync();
    const intervalId = setInterval(checkSync, 60000); // Check every minute
    return () => clearInterval(intervalId);
  }, [userProfile, setUserProfile, showToast]);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const dayBefore = new Date(today);
    dayBefore.setDate(today.getDate() - 2);
    const dayBeforeStr = dayBefore.toISOString().split('T')[0];

    const yesterdayLog = dailyLogs[yesterdayStr];
    const dayBeforeLog = dailyLogs[dayBeforeStr];

    const hasYesterdayLog = yesterdayLog && (yesterdayLog.meals.some(m => m.items.length > 0) || yesterdayLog.waterIntake > 0);
    const hasDayBeforeLog = dayBeforeLog && (dayBeforeLog.meals.some(m => m.items.length > 0) || dayBeforeLog.waterIntake > 0);

    // Show coach if no logs for the past 2 full days
    if (!hasYesterdayLog && !hasDayBeforeLog) {
        setShowCoach(true);
    } else {
        setShowCoach(false);
    }
  }, [dailyLogs]);

  const unreadNotificationsCount = useMemo(() => {
      return notifications.filter(n => !n.read).length;
  }, [notifications]);

  useEffect(() => {
    if (userProfile && (!userProfile.reminders || !userProfile.following || !userProfile.savedPosts || !userProfile.completedChallenges || userProfile.hasAllergies === undefined || !userProfile.units || !userProfile.customChallenges || !userProfile.integrations || userProfile.isPremium === undefined || !userProfile.coach?.avatar)) {
        if (!authUser?.uid) return;
        setUserProfile({
            ...userProfile,
            reminders: userProfile.reminders || getDefaultReminders(),
            following: userProfile.following || [],
            savedPosts: userProfile.savedPosts || [],
            completedChallenges: userProfile.completedChallenges || [],
            hasAllergies: userProfile.hasAllergies ?? false,
            allergies: userProfile.allergies || [],
            units: userProfile.units || 'metric',
            isPremium: userProfile.isPremium ?? false,
            hasCompletedTutorial: userProfile.hasCompletedTutorial ?? false,
            customChallenges: userProfile.customChallenges || [],
            integrations: userProfile.integrations || {
                googleFit: { enabled: false },
                appleHealth: { enabled: false },
                fitbit: { enabled: false },
                samsungHealth: { enabled: false },
                garmin: { enabled: false },
                strava: { enabled: false },
                xiaomi: { enabled: false },
                appleWatch: { enabled: false },
            },
            coach: {
                id: 'leo',
                name: userProfile.coach?.name || 'Leo',
                avatar: userProfile.coach?.avatar || 'https://images.pexels.com/photos/2220337/pexels-photo-2220337.jpeg?auto=compress&cs=tinysrgb&w=400',
            },
        });
    }
  }, [userProfile, authUser?.uid, setUserProfile]);

  const showNotification = useCallback(async (title: string, body: string) => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') {
        new Notification(title, { body, icon: '/vite.svg' });
    } else if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            new Notification(title, { body, icon: '/vite.svg' });
        }
    }
  }, []);
  
    // Effect for on-the-fly goal completion toasts
    useEffect(() => {
        if (!userProfile || !dailyLogs[selectedDateString]) return;

        const todaysLog = dailyLogs[selectedDateString];
        const totals = calculateTotals(todaysLog.meals);
        const goals = userProfile.goals;
        const newlyNotifiedGoals: string[] = [];

        // Helper function to check for goal completion OR proximity
        const checkGoal = (
            type: 'calories' | 'protein' | 'carbs' | 'fat' | 'water',
            consumed: number,
            goal: number,
            messages: { met: string; near: string; }
        ) => {
            if (consumed > 0 && goal > 0) {
                const nearKey = `${type}_near`;
                if (consumed >= goal && !notifiedGoals.includes(type)) {
                    newlyNotifiedGoals.push(type);
                    showToast(messages.met);
                } else if (consumed >= goal * 0.9 && consumed < goal && !notifiedGoals.includes(nearKey)) {
                    newlyNotifiedGoals.push(nearKey);
                    showToast(messages.near);
                }
            }
        };

        checkGoal('calories', totals.calories, goals.calories, {
            met: 'Parabéns! Você atingiu sua meta de calorias! 🎉',
            near: `Você está quase atingindo sua meta de calorias! Faltam ${Math.round(goals.calories - totals.calories)} kcal.`
        });

        checkGoal('protein', totals.protein, goals.protein, {
            met: 'Meta de proteína batida! 💪',
            near: 'Continue assim! Você está perto de bater sua meta de proteína. 💪'
        });

        checkGoal('carbs', totals.carbs, goals.carbs, {
            met: 'Meta de carboidratos alcançada! ⚡',
            near: 'Falta pouco para alcançar sua meta de carboidratos! ⚡'
        });

        checkGoal('fat', totals.fat, goals.fat, {
            met: 'Meta de gordura atingida! 🥑',
            near: 'Quase lá! Você está perto da sua meta de gordura diária. 🥑'
        });
        
        checkGoal('water', todaysLog.waterIntake, goals.water, {
            met: 'Meta de hidratação alcançada! 💧',
            near: 'Você está quase lá! Beba mais um pouco de água para atingir sua meta. 💧'
        });


        if (newlyNotifiedGoals.length > 0) {
            setNotifiedGoals(prev => [...new Set([...prev, ...newlyNotifiedGoals])]);
        }
    }, [dailyLogs, selectedDateString, userProfile, notifiedGoals, setNotifiedGoals, showToast]);

    // Main useEffect for scheduled, intelligent notifications
    useEffect(() => {
        if (!userProfile?.reminders) return;

        const intervalId = setInterval(() => {
            const now = new Date();
            const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            const todayStr = now.toISOString().split('T')[0];

            // 1. Standard user-configured reminders
            userProfile.reminders?.forEach(reminder => {
                if (reminder.enabled && reminder.time === currentTime) {
                    const notificationId = `reminder_${reminder.id}_${todayStr}`;
                    if (!lastNotified?.[notificationId]) {
                        showNotification(`Lembrete: ${reminder.label}`, `Está na hora de ${reminder.label.toLowerCase()}.`);
                        setLastNotified(prev => ({ ...prev, [notificationId]: new Date().toISOString() }));
                    }
                }
            });

            // 2. Missed Meal Logging Reminders
            userProfile.reminders?.forEach(reminder => {
                if (!reminder.enabled || !reminder.time || reminder.interval) return;
                
                const [hour, minute] = reminder.time.split(':').map(Number);
                const reminderTimeToday = new Date(now);
                reminderTimeToday.setHours(hour, minute, 0, 0);

                const twoHoursPast = reminderTimeToday.getTime() + 2 * 60 * 60 * 1000;

                if (now.getTime() >= twoHoursPast && now.getTime() < twoHoursPast + 60000) {
                    const mealName = reminder.label.replace('Registrar ', '');
                    const dayLog = dailyLogs[todayStr];
                    const mealLogged = dayLog?.meals.some(m => m.name === mealName && m.items.length > 0);
                    
                    const notificationId = `missed_${reminder.id}_${todayStr}`;
                    if (!mealLogged && !lastNotified?.[notificationId]) {
                        showNotification(`Ops! Esqueceu algo?`, `Parece que você ainda não registrou seu ${mealName.toLowerCase()} hoje.`);
                        setLastNotified(prev => ({ ...prev, [notificationId]: now.toISOString() }));
                    }
                }
            });

            // 3. Daily Summary Reminder
            if (currentTime === '21:00') {
                const notificationId = `summary_${todayStr}`;
                const dayLog = dailyLogs[todayStr];
                if (dayLog && (dayLog.meals.length > 0 || dayLog.waterIntake > 0) && !lastNotified?.[notificationId]) {
                    const totals = calculateTotals(dayLog.meals);
                    const summaryMsg = `Resumo do dia: Você consumiu ${totals.calories} de ${userProfile.goals.calories} kcal. Continue assim!`;
                    showNotification('Seu Resumo Diário do calorix', summaryMsg);
                    setLastNotified(prev => ({ ...prev, [notificationId]: now.toISOString() }));
                }
            }

            // 4. Challenge Progress Reminder
            const dayOfWeek = now.getDay();
            if (dayOfWeek === 4 && currentTime === '16:00') { // Thursday at 4 PM
                const challengeProgress = userProfile.challengeProgress;
                const allChallenges = [...availableChallenges, ...(userProfile.customChallenges || [])];
                const challenge = allChallenges.find(c => c.id === challengeProgress?.challengeId);
                
                if (challenge && challengeProgress && !challengeProgress.completed) {
                    const notificationId = `challenge_reminder_${challenge.id}_${getWeekNumber(now)}`;
                    if (!lastNotified?.[notificationId]) {
                        const daysCompleted = challengeProgress.progress.filter(p => p).length;
                        const daysNeeded = challenge.goalValue - daysCompleted;
                        if (daysNeeded > 0) {
                            showNotification(
                                'Lembrete do Desafio!',
                                `Faltam 3 dias na semana. Você ainda precisa de ${daysNeeded} dia(s) para completar "${challenge.title}". Vamos lá!`
                            );
                            setLastNotified(prev => ({ ...prev, [notificationId]: now.toISOString() }));
                        }
                    }
                }
            }
        }, 60000);

        return () => clearInterval(intervalId);
    }, [userProfile?.reminders, dailyLogs, lastNotified, setLastNotified, showNotification, userProfile?.customChallenges, userProfile?.challengeProgress]);


  useEffect(() => {
    if (!userProfile || !authUser || !userProfile.challengeProgress) return;

    const allChallenges = [...availableChallenges, ...(userProfile.customChallenges || [])];
    const currentChallenge = allChallenges.find(c => c.id === userProfile.challengeProgress?.challengeId);
    
    if (!currentChallenge) return;

    let profileNeedsUpdate = false;
    let updatedProfile = { ...userProfile };

    const previousProgressJSON = JSON.stringify(updatedProfile.challengeProgress);
    const profileWithUpdatedProgress = updateChallengeProgress(updatedProfile, dailyLogs, currentChallenge);
    
    if (JSON.stringify(profileWithUpdatedProgress.challengeProgress) !== previousProgressJSON) {
        updatedProfile = profileWithUpdatedProgress;
        profileNeedsUpdate = true;
    }

    // Check for completion notification and adding medal
    const wasJustCompleted = updatedProfile.challengeProgress?.completed && !updatedProfile.challengeProgress.completionNotified;
    if (wasJustCompleted) {
        showToast(`🏆 Desafio Concluído: "${currentChallenge.title}"!`);
        updatedProfile.challengeProgress.completionNotified = true;

        const alreadyHasMedal = updatedProfile.completedChallenges?.some(
            medal => medal.challengeId === currentChallenge.id
        );

        if (!alreadyHasMedal) {
            const newMedal: CompletedChallenge = {
                challengeId: currentChallenge.id,
                dateCompleted: new Date().toISOString().split('T')[0],
            };
            updatedProfile.completedChallenges = [...(updatedProfile.completedChallenges || []), newMedal];
        }
        
        profileNeedsUpdate = true;
    }

    if (profileNeedsUpdate) {
        setUserProfile(updatedProfile);
    }
  }, [dailyLogs, userProfile, authUser, showToast, setUserProfile]);


  const selectedDateLog = useMemo(() => {
      const log = dailyLogs[selectedDateString] || { meals: [], waterIntake: 0 };
      const computedMicronutrients = (userProfile?.goals.micronutrients && Object.keys(userProfile.goals.micronutrients).reduce((acc, key) => {
          acc[key as keyof typeof acc] = 0;
          return acc;
      }, {} as Required<DailyLog>['micronutrientIntake'])) || {};
      log.meals.forEach(meal => meal.items.forEach(food => { if (food.micronutrients) { for (const key in food.micronutrients) { const microKey = key as keyof typeof computedMicronutrients; if (computedMicronutrients[microKey] !== undefined) { computedMicronutrients[microKey]! += food.micronutrients[microKey]!; } } } }));
      return { ...log, micronutrientIntake: computedMicronutrients };
  }, [dailyLogs, selectedDateString, userProfile?.goals.micronutrients]);

  const handleSetProfile = useCallback((profile: UserProfile) => {
    setUserProfile(profile);
  }, [setUserProfile]);
  
  const handleLogin = useCallback((user: AuthUser) => {
    setAuthUser(user);
  }, [setAuthUser]);

  const handleRegister = useCallback((user: AuthUser) => {
    setUserProfile(null);
    setAuthUser(user);
  }, [setUserProfile, setAuthUser]);
  
  const handleLogout = useCallback(async () => {
    setIsSidebarOpen(false);
    setAuthUser(null);
  }, [setAuthUser]);
  
  const handleProfileCreate = useCallback(async (profile: UserProfile) => {
    setUserProfile(profile);
  }, [setUserProfile]);

  const handleUpdateGoal = useCallback((newGoal: 'lose' | 'maintain' | 'gain') => {
    if (!userProfile) return;
    const newProfile = { ...userProfile, goal: newGoal };
    const newGoals = calculateNutritionalGoals(newProfile);
    const finalProfile = { ...newProfile, goals: { ...userProfile.goals, ...newGoals }};
    setUserProfile(finalProfile);
    showToast(`Objetivo atualizado.`);
  }, [userProfile, setUserProfile, showToast]);

  const handleAddFoodClick = useCallback((meal: MealCategory) => {
    setMealToAdd(meal);
    setIsAddFoodModalOpen(true);
  }, []);
  
  const handleAddFoods = useCallback((foods: Food[]) => {
    if (!authUser?.uid || !mealToAdd) return;
    const timestamp = Date.now();
    const foodsWithTimestamp = foods.map((f, i) => ({ ...f, timestamp: timestamp + i }));
    const dateStr = selectedDate.toISOString().split('T')[0];
    
    const newLogs = { ...dailyLogs };
    const dayLog = newLogs[dateStr] ? { ...newLogs[dateStr] } : { meals: [], waterIntake: 0 };
    const meal = dayLog.meals.find(m => m.name === mealToAdd.name);
    if (meal) {
        meal.items = [...meal.items, ...foodsWithTimestamp];
    } else {
        dayLog.meals.push({ name: mealToAdd.name, items: foodsWithTimestamp });
    }
    newLogs[dateStr] = dayLog;

    setDailyLogs(newLogs);

    setIsAddFoodModalOpen(false);
    setMealToAdd(null);
    setShowCoach(false);
    showToast(`${foods.length} item(s) adicionado(s) a ${mealToAdd.name}!`);
  }, [mealToAdd, selectedDate, dailyLogs, setDailyLogs, showToast, authUser]);

  const handleDeleteFood = useCallback((mealName: string, foodId: string) => {
    if (!authUser?.uid) return;
    const dateStr = selectedDate.toISOString().split('T')[0];

    const newLogs = { ...dailyLogs };
    const dayLog = newLogs[dateStr];
    if (!dayLog) return;

    const updatedMeals = dayLog.meals.map(meal => {
        if (meal.name === mealName) {
            return {
                ...meal,
                items: meal.items.filter(item => item.id !== foodId),
            };
        }
        return meal;
    }).filter(meal => meal.items.length > 0);

    newLogs[dateStr] = { ...dayLog, meals: updatedMeals };
    
    setDailyLogs(newLogs);
    showToast("Alimento removido.");
  }, [selectedDate, dailyLogs, setDailyLogs, showToast, authUser]);
  
  const handleAddFoodToMeal = useCallback((food: Food, mealName: string) => {
    if (!authUser?.uid || !userProfile) return;
      const mealCategory = userProfile.mealCategories.find(c => c.name === mealName);
      if (mealCategory) {
          const timestamp = Date.now();
          const foodsWithTimestamp = [{ ...food, timestamp }];
          const dateStr = selectedDate.toISOString().split('T')[0];

          const newLogs = { ...dailyLogs };
          const dayLog = newLogs[dateStr] ? { ...newLogs[dateStr] } : { meals: [], waterIntake: 0 };
          const meal = dayLog.meals.find(m => m.name === mealName);
          if (meal) {
              meal.items = [...meal.items, ...foodsWithTimestamp];
          } else {
              dayLog.meals.push({ name: mealName, items: foodsWithTimestamp });
          }
          newLogs[dateStr] = dayLog;

          setDailyLogs(newLogs);
          setShowCoach(false);
          showToast(`${food.name} adicionado a ${mealName}!`);
      } else {
          showToast(`Refeição "${mealName}" não encontrada.`);
      }
  }, [userProfile, selectedDate, dailyLogs, setDailyLogs, showToast, authUser]);

  const handleAddRecipeToLog = useCallback((foods: Food[], mealName: string) => {
    if (!authUser?.uid) return;
    const timestamp = Date.now();
    const foodsWithTimestamp = foods.map((f, i) => ({ ...f, id: crypto.randomUUID(), timestamp: timestamp + i }));
    const dateStr = selectedDate.toISOString().split('T')[0];

    const newLogs = { ...dailyLogs };
    const dayLog = newLogs[dateStr] ? { ...newLogs[dateStr] } : { meals: [], waterIntake: 0 };
    const meal = dayLog.meals.find(m => m.name === mealName);
    if (meal) {
        meal.items = [...meal.items, ...foodsWithTimestamp];
    } else {
        dayLog.meals.push({ name: mealName, items: foodsWithTimestamp });
    }
    newLogs[dateStr] = dayLog;

    setDailyLogs(newLogs);
    setShowCoach(false);
    showToast(`Receita adicionada a ${mealName}!`);
  }, [selectedDate, dailyLogs, setDailyLogs, showToast, authUser]);

  const handleLogWorkout = useCallback((workout: Workout) => {
    if (!authUser?.uid) return;
    const dateStr = selectedDate.toISOString().split('T')[0];
    
    const newLogs = { ...dailyLogs };
    const dayLog = newLogs[dateStr] ? { ...newLogs[dateStr] } : { meals: [], waterIntake: 0 };
    
    const existingWorkouts = dayLog.workouts || [];
    dayLog.workouts = [...existingWorkouts, workout];
    
    newLogs[dateStr] = dayLog;
    setDailyLogs(newLogs);
    showToast(`Treino registrado! -${workout.calories_estimated} kcal`);
  }, [selectedDate, dailyLogs, setDailyLogs, authUser, showToast]);

  const handleSetWater = useCallback((amount: number) => {
    if (!authUser?.uid) return;
    const dateStr = selectedDate.toISOString().split('T')[0];
    
    const newLogs = { ...dailyLogs };
    const dayLog = newLogs[dateStr] ? { ...newLogs[dateStr] } : { meals: [], waterIntake: 0 };
    dayLog.waterIntake = amount;
    newLogs[dateStr] = dayLog;

    setDailyLogs(newLogs);
    setShowCoach(false);
  }, [selectedDate, dailyLogs, setDailyLogs, authUser]);

  const handleStartFasting = useCallback((duration: number) => {
    const now = Date.now();
    setFastingState({
        isFasting: true,
        startTime: now,
        durationHours: duration,
        endTime: now + duration * 60 * 60 * 1000,
        completionNotified: false
    });
    showToast(`Jejum de ${duration} horas iniciado!`);
  }, [setFastingState, showToast]);

  const handleStopFasting = useCallback(() => {
    setFastingState(initialFastingState);
    showToast('Jejum encerrado.');
  }, [setFastingState, showToast]);

  const handleUpdateFastingTimes = useCallback((newTimes: { startTime?: number; endTime?: number }) => {
    setFastingState(prev => {
        const updatedState = { ...prev, ...newTimes };

        if (updatedState.startTime && updatedState.endTime && updatedState.startTime < updatedState.endTime) {
            const durationMs = updatedState.endTime - updatedState.startTime;
            updatedState.durationHours = Math.round((durationMs / (1000 * 60 * 60)) * 100) / 100;
        }

        return updatedState;
    });
    showToast("Horário do jejum atualizado.");
  }, [setFastingState, showToast]);
  
  const handleSaveProfile = useCallback((profileData: Partial<UserProfile>, mealCategories: MealCategory[]) => {
    if (!userProfile) return;
    
    let updatedProfile = { ...userProfile, ...profileData, mealCategories };
    const goalsNeedRecalculation = Object.keys(profileData).some(key => ['age', 'sex', 'weight', 'height', 'activityLevel', 'practicesSports', 'activityType'].includes(key));
    if (goalsNeedRecalculation) {
        const newGoals = calculateNutritionalGoals(updatedProfile);
        const customWaterGoal = updatedProfile.customWaterGoal ?? newGoals.water;
        updatedProfile.goals = {
            ...newGoals,
            water: customWaterGoal,
            calories: updatedProfile.customGoals?.calories ?? newGoals.calories,
            protein: updatedProfile.customGoals?.protein ?? newGoals.protein,
            carbs: updatedProfile.customGoals?.carbs ?? newGoals.carbs,
            fat: updatedProfile.customGoals?.fat ?? newGoals.fat,
        };
    }
    
    setUserProfile(updatedProfile);
    showToast("Perfil salvo com sucesso!");
  }, [userProfile, setUserProfile, showToast]);

    const handleSaveReminders = useCallback((newReminders: Reminder[]) => {
        if (!userProfile) return;
        setUserProfile({ ...userProfile, reminders: newReminders });
        showToast("Lembretes salvos com sucesso!");
    }, [userProfile, setUserProfile, showToast]);

  const handleCreatePost = useCallback(async (text: string, category: PostCategory, imageUrl?: string, videoUrl?: string) => {
    if (!authUser || !userProfile) return;
    const newPost: Post = {
        id: crypto.randomUUID(),
        author: { uid: authUser.uid, name: userProfile.name, email: authUser.email, avatar: userProfile.avatar },
        text,
        category,
        imageUrl,
        videoUrl,
        reactions: {},
        comments: [],
        timestamp: Date.now(),
    };
    setCommunityPosts(prev => [newPost, ...prev]);
    showToast("Publicação criada!");
  }, [authUser, userProfile, setCommunityPosts, showToast]);
  
  const handleChangePassword = useCallback(async (current: string, newP: string) => {
    const normalizedEmail = authUser?.email.toLowerCase().trim();
    if (!normalizedEmail) {
        return { success: false, message: "Usuário não encontrado." };
    }
    // This uses the mock user storage from Auth.tsx
    const users = JSON.parse(localStorage.getItem('calorix_users') || '{}');
    const user = users[normalizedEmail];

    if (!user || user.password !== current) {
        return { success: false, message: "A senha atual está incorreta." };
    }

    user.password = newP;
    users[normalizedEmail] = user;
    localStorage.setItem('calorix_users', JSON.stringify(users));
    showToast("Senha alterada com sucesso!");
    return { success: true, message: "Senha alterada com sucesso!" };
  }, [authUser, showToast]);

  const handleReactToPost = useCallback((postId: string, reaction: ReactionType) => {
    if (!authUser || !userProfile) return;
    
    setCommunityPosts(prevPosts => {
        const newPosts = [...prevPosts];
        const postIndex = newPosts.findIndex(p => p.id === postId);
        if (postIndex === -1) return prevPosts;

        const post = { ...newPosts[postIndex] };
        const newReactions = { ...post.reactions };

        (Object.keys(newReactions) as ReactionType[]).forEach(key => {
            newReactions[key] = newReactions[key]?.filter(email => email !== authUser.email);
        });

        if (!post.reactions[reaction]?.includes(authUser.email)) {
            newReactions[reaction] = [...(newReactions[reaction] || []), authUser.email];
        }
        
        post.reactions = newReactions;
        newPosts[postIndex] = post;
        return newPosts;
    });
  }, [authUser, userProfile, setCommunityPosts]);
  
  const handleAddComment = useCallback((postId: string, commentText: string) => {
    if (!authUser || !userProfile) return;

    setCommunityPosts(prevPosts => {
        const newPosts = [...prevPosts];
        const postIndex = newPosts.findIndex(p => p.id === postId);
        if (postIndex === -1) return prevPosts;

        const post = { ...newPosts[postIndex] };
        const newComment: Comment = {
            id: crypto.randomUUID(),
            author: { name: userProfile.name, email: authUser.email, avatar: userProfile.avatar },
            text: commentText,
            timestamp: Date.now(),
        };
        post.comments = [...post.comments, newComment];
        newPosts[postIndex] = post;
        return newPosts;
    });
  }, [authUser, userProfile, setCommunityPosts]);
  
  const handleFollowUser = useCallback((authorEmail: string, authorId: string) => {
      if (!userProfile) return;
        const isFollowing = userProfile.following?.includes(authorEmail);
        const newFollowing = isFollowing
            ? userProfile.following?.filter(email => email !== authorEmail)
            : [...(userProfile.following || []), authorEmail];
        
        setUserProfile({ ...userProfile, following: newFollowing });

        const authorName = communityPosts.find(p => p.author.email === authorEmail)?.author.name || authorEmail;
        showToast(isFollowing ? `Você deixou de seguir ${authorName}.` : `Você está seguindo ${authorName}.`);
        
  }, [userProfile, setUserProfile, showToast, communityPosts]);
  
  const handleSavePost = useCallback((postId: string) => {
    if (!userProfile) return;
        const isSaved = userProfile.savedPosts?.includes(postId);
        const newSaved = isSaved
            ? userProfile.savedPosts?.filter(id => id !== postId)
            : [...(userProfile.savedPosts || []), postId];
        
        setUserProfile({ ...userProfile, savedPosts: newSaved });
        showToast(isSaved ? "Publicação removida dos salvos." : "Publicação salva!");
  }, [userProfile, setUserProfile, showToast]);
  
  const handleSharePost = useCallback(async (text: string, imageUrl?: string, videoUrl?: string) => {
    // navigator.share can be finicky about URLs. We ensure it's a valid absolute URL.
    const shareUrl = window.location.href.startsWith('http') ? window.location.href : window.location.origin;
    const shareData: ShareData = {
        title: 'calorix - Nutrição Inteligente',
        text: text,
        url: shareUrl,
    };

    try {
        if (navigator.share) {
            await navigator.share(shareData);
            showToast("Publicação compartilhada!");
        } else {
            await navigator.clipboard.writeText(`${text}\n\n${shareData.url}`);
            showToast("Link copiado!");
        }
    } catch (err) {
        console.error("Share failed:", err);
        // Fallback for when share fails or is blocked
        await navigator.clipboard.writeText(`${text}\n\n${shareData.url}`);
        showToast("Link copiado para a área de transferência!");
    }
  }, [showToast]);
  
  const handleSelectChallenge = useCallback((challengeId: string) => {
    if (!userProfile) return;
        const selectedChallenge = availableChallenges.find(c => c.id === challengeId);
        if (!selectedChallenge) return;

        const weekStartDate = getStartOfWeek(new Date()).toISOString().split('T')[0];
        
        const newChallengeProgress: UserChallengeProgress = {
            challengeId: selectedChallenge.id,
            startDate: weekStartDate,
            progress: Array(selectedChallenge.durationDays).fill(false),
            completed: false,
            completionNotified: false,
        };
        
        setUserProfile({ ...userProfile, challengeProgress: newChallengeProgress });
        showToast(`Desafio "${selectedChallenge.title}" selecionado para a semana!`);
        setIsChallengesModalOpen(false);
  }, [userProfile, setUserProfile, showToast]);
  
  const handleCreateAndSelectCustomChallenge = useCallback((challenge: Omit<Challenge, 'id' | 'isCustom'>, startDate: string, endDate: string) => {
    if (!userProfile) return;
        const newChallenge: Challenge = {
            ...challenge,
            id: crypto.randomUUID(),
            isCustom: true,
        };

        const updatedCustomChallenges = [...(userProfile.customChallenges || []), newChallenge];
        
        const newChallengeProgress: UserChallengeProgress = {
            challengeId: newChallenge.id,
            startDate: startDate,
            endDate: endDate,
            progress: Array(challenge.durationDays).fill(false),
            completed: false,
            completionNotified: false,
        };

        setUserProfile({
            ...userProfile,
            customChallenges: updatedCustomChallenges, 
            challengeProgress: newChallengeProgress 
        });
        showToast(`Desafio personalizado "${challenge.title}" criado e selecionado!`);
        setIsChallengesModalOpen(false);
  }, [userProfile, setUserProfile, showToast]);

  const handleDisableChallenge = useCallback(() => {
    if (!userProfile) return;
        showToast("Desafio da semana desativado.");
        const newProfile = { ...userProfile };
        delete newProfile.challengeProgress;
        setUserProfile(newProfile);
        setIsChallengesModalOpen(false);
  }, [userProfile, setUserProfile, showToast]);

  const handleMarkAllAsRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({...n, read: true})));
    showToast("Notificações marcadas como lidas.");
  }, [setNotifications, showToast]);

  const handleUpgradeToPremium = useCallback(() => {
    if (!userProfile) return;
    setUserProfile({ ...userProfile, isPremium: true });
    setIsGoPremiumModalOpen(false);
    showToast("Parabéns! Você agora é um usuário Premium. ✨");
  }, [userProfile, setUserProfile, showToast]);

  const handleDismissCoach = useCallback(() => setShowCoach(false), []);

  if (!authUser) return <Auth onLogin={handleLogin} onRegister={handleRegister} />;
  if (!userProfile) return <Onboarding onProfileCreate={handleProfileCreate} defaultName={authUser.name} />;
  if (!userProfile.hasCompletedTutorial) return <InteractiveTutorial onComplete={() => setUserProfile(prev => prev ? { ...prev, hasCompletedTutorial: true } : null)} />;


  return (
    <div className={`${darkMode ? 'dark' : ''}`}>
        <div className="min-h-screen font-sans bg-light-bg-main dark:bg-dark-bg text-light-text dark:text-dark-text">
            
            <div className={`transition-all duration-300 ease-in-out ${isSidebarOpen || isQuickViewOpen ? 'blur-sm pointer-events-none' : ''}`}>
                <Header
                    userProfile={userProfile}
                    darkMode={darkMode}
                    toggleDarkMode={() => setDarkMode(!darkMode)}
                    onProfileClick={() => { setInitialProfileTab('profile'); setIsProfileModalOpen(true); }}
                    currentView={currentView}
                    onNavigate={setCurrentView}
                    toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                    toggleDataSidebar={() => setIsQuickViewOpen(!isQuickViewOpen)}
                    unreadNotificationsCount={unreadNotificationsCount}
                    onNotificationsClick={() => setIsNotificationsModalOpen(true)}
                    onPremiumClick={() => setIsGoPremiumModalOpen(true)}
                />
                <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                    {currentView === 'dashboard' && (
                        <Dashboard
                            userProfile={userProfile}
                            selectedDate={selectedDate}
                            onDateChange={setSelectedDate}
                            selectedDateLog={selectedDateLog}
                            dailyLogs={dailyLogs}
                            onAddFoodClick={handleAddFoodClick}
                            onAddFoodToMeal={handleAddFoodToMeal}
                            onDeleteFood={handleDeleteFood}
                            onUpdateGoal={handleUpdateGoal}
                            onSetWater={handleSetWater}
                            onEditGoals={() => { setInitialProfileTab('goals'); setIsProfileModalOpen(true); }}
                            fastingState={fastingState}
                            onStartFasting={handleStartFasting}
                            onStopFasting={handleStopFasting}
                            onUpdateFastingTimes={handleUpdateFastingTimes}
                            onFastingCompletionNotified={() => setFastingState(prev => ({ ...prev, completionNotified: true }))}
                            showCoach={showCoach}
                            onDismissCoach={handleDismissCoach}
                        />
                    )}
                    {currentView === 'community' && (
                        <CommunityFeed
                            posts={communityPosts}
                            currentUserProfile={userProfile}
                            currentUserAuth={authUser}
                            onCreatePost={handleCreatePost}
                            onReactToPost={handleReactToPost}
                            onAddComment={handleAddComment}
                            onFollowUser={handleFollowUser}
                            onSavePost={handleSavePost}
                            onSharePost={handleSharePost}
                        />
                    )}
                    {currentView === 'recipes' && (
                        <RecipesDashboard 
                            userProfile={userProfile}
                            onAddRecipeToLog={handleAddRecipeToLog}
                        />
                    )}
                    {currentView === 'reports' && (
                        <ReportsDashboard 
                            userProfile={userProfile}
                            dailyLogs={dailyLogs}
                            onUpgradeClick={() => setIsGoPremiumModalOpen(true)}
                        />
                    )}
                    {currentView === 'workouts' && (
                        <WorkoutDashboard
                            userProfile={userProfile}
                            onLogWorkout={handleLogWorkout}
                        />
                    )}
                    {currentView === 'videos' && (
                        <VideosDashboard />
                    )}
                    {currentView === 'integrations' && (
                        <IntegrationsDashboard
                            userProfile={userProfile}
                            onUpdateIntegrations={(newIntegrations) => handleSaveProfile({ integrations: newIntegrations }, userProfile.mealCategories)}
                        />
                    )}
                </main>
            </div>

            <Sidebar 
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                userProfile={userProfile}
                currentView={currentView}
                onNavigate={(view) => {
                    setCurrentView(view);
                    setIsSidebarOpen(false);
                }}
                onLogout={handleLogout}
                onRemindersClick={() => {
                    setIsRemindersModalOpen(true);
                    setIsSidebarOpen(false);
                }}
                onChallengesClick={() => {
                    setIsChallengesModalOpen(true);
                    setIsSidebarOpen(false);
                }}
                onAchievementsClick={() => {
                    setIsAchievementsModalOpen(true);
                    setIsSidebarOpen(false);
                }}
            />

            <QuickViewSidebar
                isOpen={isQuickViewOpen}
                onClose={() => setIsQuickViewOpen(false)}
                userProfile={userProfile}
                dailyLog={selectedDateLog}
            />

            {isAddFoodModalOpen && mealToAdd && (
                <AddFoodModal 
                    mealName={mealToAdd.name}
                    onClose={() => setIsAddFoodModalOpen(false)}
                    onAddFoods={handleAddFoods}
                />
            )}
            
            {isProfileModalOpen && (
                <ProfileModal
                    userProfile={userProfile}
                    dailyLogs={dailyLogs}
                    onClose={() => setIsProfileModalOpen(false)}
                    onSave={handleSaveProfile}
                    onLogout={handleLogout}
                    onUpdateWaterGoal={(goal) => handleSaveProfile({ customWaterGoal: goal }, userProfile.mealCategories)}
                    onChangePasswordClick={() => setIsChangePasswordModalOpen(true)}
                    onUpgradeClick={() => setIsGoPremiumModalOpen(true)}
                    initialTab={initialProfileTab}
                    darkMode={darkMode}
                    toggleDarkMode={() => setDarkMode(!darkMode)}
                />
            )}

            {isRemindersModalOpen && (
                <RemindersModal
                    reminders={userProfile.reminders || getDefaultReminders()}
                    onClose={() => setIsRemindersModalOpen(false)}
                    onSave={handleSaveReminders}
                />
            )}

            {isChallengesModalOpen && (
                <ChallengesModal
                    userProfile={userProfile}
                    onClose={() => setIsChallengesModalOpen(false)}
                    onSelectChallenge={handleSelectChallenge}
                    onDisableChallenge={handleDisableChallenge}
                    onCreateAndSelectCustomChallenge={handleCreateAndSelectCustomChallenge}
                />
            )}
            
            {isAchievementsModalOpen && (
                <AchievementsModal
                    userProfile={userProfile}
                    onClose={() => setIsAchievementsModalOpen(false)}
                />
            )}

            {isNotificationsModalOpen && (
                <NotificationsModal
                    notifications={notifications}
                    onClose={() => setIsNotificationsModalOpen(false)}
                    onMarkAllAsRead={handleMarkAllAsRead}
                />
            )}
            
            {isChangePasswordModalOpen && (
                <ChangePasswordModal 
                    onClose={() => setIsChangePasswordModalOpen(false)}
                    onChangePassword={handleChangePassword}
                />
            )}
            
            {isGoPremiumModalOpen && (
                <GoPremiumModal 
                    onClose={() => setIsGoPremiumModalOpen(false)}
                    onUpgrade={handleUpgradeToPremium}
                />
            )}

            <Toast toast={toast} onClose={() => setToast(null)} />
        </div>
    </div>
  );
};

export default App;
