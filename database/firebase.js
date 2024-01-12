// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { query, where, getFirestore, collection, getDocs, addDoc, doc, getDoc } from 'firebase/firestore';
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

//user section
const UsersRef = collection(db, "users");

export async function isEmailExist(email) {
  const q = query(UsersRef, where("email", "==", email))
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty; // Returns true if no existing user is found
}

export async function addUser(userData) {
  try {
    const docRef = await addDoc(UsersRef, userData);
    console.log("Document written with ID: ", docRef.id);
  } catch (error) {
    console.log("Cannot add user")
  }
}

export async function getUser() {
  try {
    const querySnapshot = await getDocs(UsersRef);
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

export async function getUserEmail(email) {
  const q = query(UsersRef, where("email", "==", email));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty)
    return false; 
  
  const userData = querySnapshot.docs[0].data();
  return userData;
}

export async function updateUserData(userId, updatedData) {
  try {
    const userDocRef = doc(db, "users", userId);
    await updateDoc(userDocRef, updatedData);
    console.log("Document updated with ID: ", userId);
  } catch (e) {
    console.error("Error updating document: ", e);
  }
}


//project section
const ProjectsCollectionRef = collection(db, "projects");

export async function createProject(userId, updatedData) {
  try {
    return true
  } catch (e) {
    console.error("Error updating document: ", e);
  }
}

