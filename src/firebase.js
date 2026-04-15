import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAH5kicbZ_9Shhba4jYIoawTj8k9mz6Dfk",
  authDomain: "teno-21f35.firebaseapp.com",
  projectId: "teno-21f35",
  storageBucket: "teno-21f35.firebasestorage.app",
  messagingSenderId: "541939352779",
  appId: "1:541939352779:web:32c43c99dd8c187c3d074e",
  measurementId: "G-2JNSVHPNNG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
