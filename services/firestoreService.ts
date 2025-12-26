
import { db } from '../firebase/config';
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    onSnapshot,
    collection,
    query,
    orderBy,
    addDoc,
    Timestamp,
    writeBatch,
    where,
    getDocs
} from 'firebase/firestore';
import { UserProfile, DailyLog, Post, AppNotification, Action } from '../types';

if (!db) {
    console.warn("Firestore is not initialized. Data persistence will not work with Google Cloud.");
}

// --- User Profile ---

export const createUserProfile = async (userId: string, profileData: UserProfile): Promise<void> => {
    if (!db) return;
    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, profileData);
};

export const onUserProfileSnapshot = (userId: string, callback: (profile: UserProfile | null) => void) => {
    if (!db) return () => {};
    const userDocRef = doc(db, 'users', userId);
    return onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
            callback(docSnap.data() as UserProfile);
        } else {
            callback(null);
        }
    });
};

export const updateUserProfile = async (userId: string, data: Partial<UserProfile>): Promise<void> => {
    if (!db) return;
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, data);
};

// --- Daily Logs ---

// Structure: /users/{userId}/dailyLogs/{dateString}
export const onDailyLogsSnapshot = (userId: string, callback: (logs: Record<string, Omit<DailyLog, 'micronutrientIntake'>>) => void) => {
    if (!db) return () => {};
    const logsCollectionRef = collection(db, 'users', userId, 'dailyLogs');
    return onSnapshot(logsCollectionRef, (querySnapshot) => {
        const logs: Record<string, Omit<DailyLog, 'micronutrientIntake'>> = {};
        querySnapshot.forEach((docSnap) => {
            logs[docSnap.id] = docSnap.data() as Omit<DailyLog, 'micronutrientIntake'>;
        });
        callback(logs);
    });
};

export const updateDailyLog = async (userId: string, dateString: string, logData: Partial<Omit<DailyLog, 'micronutrientIntake'>>): Promise<void> => {
    if (!db) return;
    const logDocRef = doc(db, 'users', userId, 'dailyLogs', dateString);
    await setDoc(logDocRef, logData, { merge: true });
};


// --- Community Posts ---

export const onCommunityPostsSnapshot = (callback: (posts: Post[]) => void) => {
    if (!db) return () => {};
    const postsCollectionRef = collection(db, 'communityPosts');
    const q = query(postsCollectionRef, orderBy('timestamp', 'desc'));

    return onSnapshot(q, (querySnapshot) => {
        const posts: Post[] = [];
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            // Convert Firestore Timestamp to number if needed
            const timestamp = data.timestamp instanceof Timestamp ? data.timestamp.toMillis() : data.timestamp;
            posts.push({ id: docSnap.id, ...data, timestamp } as Post);
        });
        callback(posts);
    });
};

export const createCommunityPost = async (postData: Omit<Post, 'id' | 'timestamp'> & { timestamp?: number }): Promise<void> => {
    if (!db) return;
    const postsCollectionRef = collection(db, 'communityPosts');
    await addDoc(postsCollectionRef, {
        ...postData,
        timestamp: Timestamp.now(),
    });
};

export const updateCommunityPost = async (postId: string, data: Partial<Post>): Promise<void> => {
    if (!db) return;
    const postDocRef = doc(db, 'communityPosts', postId);
    await updateDoc(postDocRef, data);
};


// --- Notifications ---
export const onNotificationsSnapshot = (userId: string, callback: (notifications: AppNotification[]) => void) => {
    if (!db) return () => {};
    const notificationsCollectionRef = collection(db, 'users', userId, 'notifications');
    const q = query(notificationsCollectionRef, orderBy('timestamp', 'desc'));

    return onSnapshot(q, (querySnapshot) => {
        const notifications: AppNotification[] = [];
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const timestamp = data.timestamp instanceof Timestamp ? data.timestamp.toMillis() : data.timestamp;
            notifications.push({ id: docSnap.id, ...data, timestamp } as AppNotification);
        });
        callback(notifications);
    });
};

export const createNotification = async (recipientId: string, notificationData: Omit<AppNotification, 'id'>): Promise<void> => {
    if (!db) return;
    const notificationsCollectionRef = collection(db, 'users', recipientId, 'notifications');
    await addDoc(notificationsCollectionRef, {
        ...notificationData,
        timestamp: Timestamp.now(),
    });
};

export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
    if (!db) return;
    const notificationsCollectionRef = collection(db, 'users', userId, 'notifications');
    const q = query(notificationsCollectionRef, where('read', '==', false));
    const querySnapshot = await getDocs(q);
    
    const batch = writeBatch(db);
    querySnapshot.forEach(docSnap => {
        batch.update(docSnap.ref, { read: true });
    });
    await batch.commit();
}


// --- Sync Service for Offline Actions ---
export const processActionQueue = async (userId: string, actions: Action[]): Promise<void> => {
    if (!db) throw new Error("Firestore not available");

    // We need to fetch all relevant daily logs first to avoid race conditions
    const logDates = new Set<string>(actions.filter(a => a.payload.date).map(a => a.payload.date));
    const logsToUpdate: Record<string, any> = {};

    for (const date of logDates) {
        const logDocRef = doc(db, 'users', userId, 'dailyLogs', date);
        const logSnap = await getDoc(logDocRef);
        logsToUpdate[date] = logSnap.exists() ? logSnap.data() : { meals: [], waterIntake: 0 };
    }

    actions.forEach(action => {
        const { type, payload } = action;
        const dateStr = payload.date;

        switch (type) {
            case 'ADD_FOODS': {
                const dayLog = logsToUpdate[dateStr];
                const meal = dayLog.meals.find((m: any) => m.name === payload.mealName);
                if (meal) {
                    meal.items.push(...payload.foods);
                } else {
                    dayLog.meals.push({ name: payload.mealName, items: payload.foods });
                }
                break;
            }
            case 'DELETE_FOOD': {
                const dayLog = logsToUpdate[dateStr];
                const meal = dayLog.meals.find((m: any) => m.name === payload.mealName);
                if (meal) {
                    meal.items = meal.items.filter((item: any) => item.id !== payload.foodId);
                }
                break;
            }
            case 'SET_WATER': {
                 const dayLog = logsToUpdate[dateStr];
                 dayLog.waterIntake = payload.amount;
                 break;
            }
        }
    });
    
    const batch = writeBatch(db);
    // Write all updated logs to the batch
    for (const dateStr in logsToUpdate) {
        const logDocRef = doc(db, 'users', userId, 'dailyLogs', dateStr);
        batch.set(logDocRef, logsToUpdate[dateStr], { merge: true });
    }

    await batch.commit();
};
