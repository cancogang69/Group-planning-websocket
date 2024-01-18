// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { query, where, getFirestore, collection, getDocs, addDoc, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
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
const storage = getStorage(app);

//user section
const UsersRef = collection(db, "users");

// Returns false if no existing user is found
export async function getUserEmail(email) {
  const q = query(UsersRef, where("email", "==", email))
  const querySnapshot = await getDocs(q);
  return querySnapshot; 
}

export async function addUser(userData) {
  try {
    const docRef = await addDoc(UsersRef, userData);
    console.log("Document written with ID: ", docRef.id);
  } catch (error) {
    throw new Error("Cannot add user")
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

export async function getUserData(email) {
  const querySnapshot = await getUserEmail(email)
  if(querySnapshot.empty)
    return false

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



// Project section
const project = collection(db, "projects");

//Add new Project
export async function addNewProject(projectData) {
  try {
    const docRef = await addDoc(project, projectData);
    await updateDoc(doc(project,docRef.id), {id: docRef.id});
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

//Get project
export async function getProject() {
  try {
    const querySnapshot = await getDocs(project);
    const projects = [];
    querySnapshot.forEach((doc) => {
      const data = {
        id: doc.id,
        title: doc.data().title,
        createdAt: doc.data().createdAt.toDate(),
        status: doc.data().status,
        description: doc.data().description,
        tasks: doc.data().tasks,
        members: doc.data().members,
        master: doc.data().master,
      }
      console.log(doc.id, " => ", JSON.stringify(data));
      projects.push(data);
    });
    return projects;
  } catch (e) {
    console.error("Error getting documents: ", e);
  }
}

//Delete project
export async function deleteProject(projectId) {
  try {
    await deleteDoc(doc(project, projectId));
    console.log("Document deleted with ID: ", projectId);
  } catch (e) {
    console.error("Error deleting document: ", e);
  }
}

//Task section

const task = collection(db, "tasks");

export async function addTask(taskData) {
  try {
    const docRef = await addDoc(task, taskData);
    await updateDoc(doc(task,docRef.id), {id: docRef.id});
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

export async function getTask() {
  try {
    const querySnapshot = await getDocs(task);
    const tasks = [];
    querySnapshot.forEach((doc) => {
      const data = {
        key: doc.id,
        text: doc.data().description,
        status: doc.data().status,
        asigned_to: doc.data().assignedTo,
      }
      console.log(doc.id, " => ", JSON.stringify(data));
      tasks.push(data);
    });
    return tasks;
  } catch (e) {
    console.error("Error getting documents: ", e);
  }
}

export async function updateTask(taskID, taskData) {
  try {
    const docRef = doc(task, taskID);
    await updateDoc(docRef, {
      id: taskID,
      status: taskData.status,
      description: taskData.text,
      assignedTo: taskData.asigned_to,
    });
    console.log("Document updated with ID: ", taskID);
  } catch (e) {
    console.error("Error updating document: ", e);
  }
}

export async function deleteTask(taskID) {
  try {
    const docRef = doc(task, taskID);
    await deleteDoc(docRef);
    console.log("Document updated with ID: ", taskID);
  } catch (e) {
    console.error("Error updating document: ", e);
  }
}

//Image section
const getBlobFroUri = async (uri) => {
  const blob = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      resolve(xhr.response);
    };
    xhr.onerror = function (e) {
      reject(new TypeError("Network request failed"));
    };
    xhr.responseType = "blob";
    xhr.open("GET", uri, true);
    xhr.send(null);
  });

  return blob;
};

export async function uploadAva(file, id){
  let avaURL;
  const fileBlob = await getBlobFroUri(file);
  const storageRef = ref(storage, `images/avatar/${id}.jpg`);
  console.log("uploading file");
  await uploadBytes(storageRef, fileBlob).then((snapShot) => {
    console.log("Uploaded a file!");
    avaURL = snapShot.ref.fullPath;
  });
  await getDownloadURL(ref(storage, avaURL))
    .then((url) => {
      avaURL = url;
    })
    .catch((err) => {
      console.log(err);
    });
  return avaURL;
};

// Download image from cloud storage
export async function downloadAva(id){
  let avaURL;
  await getDownloadURL(ref(storage, `images/avatar/${id}.jpg`))
    .then((url) => {
      avaURL = url;
    })
    .catch((err) => {
      console.log("No image found");
    });
  return avaURL;
};


