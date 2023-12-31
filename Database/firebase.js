// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { query, where, getFirestore, collection, getDocs, addDoc } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBKvPY1Oxu3Tl2pr58WYJG_uYkTHHUIB5E",
  authDomain: "groupplanning-2d3e0.firebaseapp.com",
  projectId: "groupplanning-2d3e0",
  storageBucket: "groupplanning-2d3e0.appspot.com",
  messagingSenderId: "586489896437",
  appId: "1:586489896437:web:1b2e9812ad9a76a551d4bc",
  measurementId: "G-FVDXWR2RNT"
};



const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const UsersCollectionRef = collection(db, "userData");


export async function isUsernameUnique(username) {
  const q = query(UsersCollectionRef, where("userName", "==", username));
  const querySnapshot = await getDocs(q);

  console.log(querySnapshot.docs.map(doc => doc.data())); // Log the documents found

  return querySnapshot.empty; // Returns true if no existing user is found
}

export async function addUserData(userData) {
  
  try {
    const docRef = await addDoc(UsersCollectionRef, userData);
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}


export async function getUserData() {
  try {
    const querySnapshot = await getDocs(UsersCollectionRef);
    const users = [];
    querySnapshot.forEach((doc) => {
      console.log(doc.id, " => ", doc.data());
      users.push(doc.data());
    });
    return users;
  } catch (e) {
    console.error("Error getting documents: ", e);
  }
}


export async function getUserByUsername(username) {
  const q = query(UsersCollectionRef, where("userName", "==", username));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return null; 
  }
  const userData = querySnapshot.docs[0].data();
  return userData;
}

export async function updateUserData(userId, updatedData) {
  try {
    const userDocRef = doc(db, "userData", userId);
    await updateDoc(userDocRef, updatedData);
    console.log("Document updated with ID: ", userId);
  } catch (e) {
    console.error("Error updating document: ", e);
  }
}

