import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

// Configuração do Firebase fornecida pelo usuário
const firebaseConfig = {
  apiKey: "AIzaSyAu8a5q_YU57vaKcmyw8aLuRXw75x4rHVA",
  authDomain: "calorix1-f5d67.firebaseapp.com",
  databaseURL: "https://calorix1-f5d67-default-rtdb.firebaseio.com",
  projectId: "calorix1-f5d67",
  storageBucket: "calorix1-f5d67.firebasestorage.app",
  messagingSenderId: "321233692033",
  appId: "1:321233692033:web:f3d45d2ada8a0839017480"
};


let auth: Auth | null = null;
let db: Firestore | null = null;

try {
    const app: FirebaseApp = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
} catch (error) {
    console.error("Erro ao inicializar o Firebase com a configuração fornecida:", error);
    console.warn("Ocorreu um erro. O app usará o modo de simulação com localStorage.");
}


// Exporta os serviços que o app usa
export { auth, db };