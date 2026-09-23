// Import the functions you need from the SDKs you need
import { initializeApp,getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCSaARn8ZyOKCfXG6GTKqXc8zSEmkPhfMU",
  authDomain: "recipe-finder-b3798.firebaseapp.com",
  projectId: "recipe-finder-b3798",
  storageBucket: "recipe-finder-b3798.firebasestorage.app",
  messagingSenderId: "272633705694",
  appId: "1:272633705694:web:0200c6c5ef6828b341be4f",
  measurementId: "G-CEYSXSN712",
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
export const db = getFirestore(app);
