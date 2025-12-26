// services/authService.ts
import { auth } from "../firebase/config";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  updateProfile,
  getAdditionalUserInfo,
  sendPasswordResetEmail,
  User
} from "firebase/auth";
import { AuthUser } from "../types";

// Helper to convert Firebase User to our AuthUser
const toAuthUser = (user: User, name?: string): AuthUser => ({
    uid: user.uid,
    email: user.email!,
    name: name || user.displayName || 'Usuário',
    avatar: user.photoURL || undefined,
});

export const onAuthChange = (callback: (user: AuthUser | null) => void) => {
    if (!auth) {
        // In simulation mode, we don't have a real user listener.
        // App.tsx handles reading from localStorage.
        return () => {}; // Return an empty unsubscribe function
    }
    return auth.onAuthStateChanged(user => {
        if (user) {
            callback(toAuthUser(user));
        } else {
            callback(null);
        }
    });
};

export const registerUser = async (email: string, password: string, name: string): Promise<AuthUser> => {
    if (!auth) throw new Error("Firebase not configured.");
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name });
    return toAuthUser(userCredential.user, name);
};

export const loginUser = async (email: string, password: string): Promise<AuthUser> => {
    if (!auth) throw new Error("Firebase not configured.");
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return toAuthUser(userCredential.user);
};

export const logoutUser = () => {
    if (!auth) return Promise.resolve(); // Do nothing in mock mode
    return signOut(auth);
};

export const socialLogin = async (providerName: 'Google' | 'Facebook'): Promise<{user: AuthUser, isNew: boolean}> => {
    if (!auth) {
        // Simulate social login if Firebase is disconnected
        console.warn(`Firebase not configured. Simulating ${providerName} login.`);
        return new Promise(resolve => {
            setTimeout(() => {
                const mockUser: AuthUser = {
                    uid: crypto.randomUUID(),
                    name: `Usuário ${providerName}`,
                    email: `${providerName.toLowerCase()}user@calorix.app`,
                    avatar: `https://i.pravatar.cc/150?u=${providerName.toLowerCase()}user@calorix.app`
                };
                resolve({ user: mockUser, isNew: true });
            }, 1000);
        });
    }
    
    const provider = providerName === 'Google' ? new GoogleAuthProvider() : new FacebookAuthProvider();
    
    // Força a exibição da tela de seleção de conta do Google
    if (provider instanceof GoogleAuthProvider) {
        provider.setCustomParameters({
            prompt: 'select_account'
        });
    }

    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const additionalInfo = getAdditionalUserInfo(result);
    
    return {
        user: toAuthUser(user),
        isNew: !!additionalInfo?.isNewUser,
    };
};

export const sendResetPasswordEmail = (email: string) => {
    if (!auth) return Promise.resolve(); // Simulate in mock mode
    return sendPasswordResetEmail(auth, email);
};