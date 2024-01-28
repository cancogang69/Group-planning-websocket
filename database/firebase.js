// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { query, where, getFirestore, collection, getDocs, addDoc, 
        doc, getDoc, updateDoc, deleteDoc, documentId, arrayUnion,
        arrayRemove} from 'firebase/firestore';
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

export async function addUserSharedProj(email, projectID) {
  try {
    const querySnap = await getUserEmail(email)
    if(querySnap.empty)
      return false
    
    const userDocRef = doc(UsersRef, querySnap.docs[0].id)
    await updateDoc(userDocRef, {
      sharedIDs : arrayUnion(projectID)
    })
  } catch(e) {
    throw new Error(e.message)
  }
}


// Project section
const projectCol = collection(db, "projects");

//Add new Project
export async function addNewProject(projectData) {
  try {
    const docRef = await addDoc(projectCol, projectData);
    console.log("Document written with ID: ", docRef.id);
    const querySnap = await getProjectByID([docRef.id])
    let newProject = querySnap.docs[0].data()
    newProject.id = docRef.id
    return newProject
  } catch (e) {
    throw new Error(e.message);
  }
}

export async function getProjectByID(id) {
  try {
    const q = query(projectCol, where(documentId(), "in", id))
    const querySnap = await getDocs(q)
    return querySnap
  } catch(e) {
    throw new Error(e.message)
  }
}

export async function getProjectByMaster(master) {
  try {
    const q = query(projectCol, where("master", "==", master))
    const querySnap = await getDocs(q)
    let projects = []
    querySnap.forEach((doc) => {
      let data = doc.data()
      data.id = doc.id
      projects.push(data)
    })
    return projects
  } catch(e) {
    throw e
  }
}

// Add member 
export async function addMember(projectID, master, member) {
  try {
    const snap = await Promise.all([getProjectByID([projectID])
                ,getUserEmail(master),getUserEmail(member)])
    if(snap[0].empty)
      throw new Error("project doesn't exist")
    if(snap[1].empty)
      throw new Error("master doesn't exist")
    if(snap[2].empty)
      throw new Error("member doesn't exist")

    let mems = snap[0].docs[0].data().members
    if((mems != null && mems.includes(member)) || 
      (snap[1].docs[0].data().email == snap[2].docs[0].data().email))
        throw new Error("member has already been in project")
    
    const projectRef = doc(projectCol, snap[0].docs[0].id)
    await updateDoc(projectRef, {
      members : arrayUnion(member)
    })

    await addUserSharedProj(member, snap[0].docs[0].id)
    return projectID
  } catch(error) {
    throw error
  }
}

//Delete project
export async function deleteProject(projectId) {
  try {
    const prjSnap = await getProjectByID([projectId])
    if(prjSnap.empty)
      throw new Error("Project doesn't exist")
    let prjData = prjSnap.docs[0].data()
    let userDel = prjData.master.concat(prjData.members)
    let taskDel = prjData.tasks

    for (const user of userDel) {
      const userdr = await getUserData(user)
      await updateDoc(doc(UsersRef, userdr.docs[0].id), {
        sharedIDs: arrayRemove([projectId])
      })
    }

    for (const task of taskDel) {
      await deleteDoc(taskRF, task.id)
    }
    
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

export async function uploadAva(file, id){
    let avaURL;
    const storageRef = ref(storage, `images/avatar/${id}.jpg`);
    console.log("uploading file");
    await uploadBytes(storageRef, file).then((snapShot) => {
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
    //return avaURL;
};

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


// Task section
const taskRF = collection(db, "tasks");

export async function addTask(taskData, projectID) {
  try {
    const docRef = await addDoc(taskRF, taskData);
    const prSnap = await getProjectByID([projectID])

    await updateDoc(doc(taskRF, docRef.id), {id: docRef.id});
    const projectRef = doc(projectCol, projectID)
    await updateDoc(projectRef, {
      tasks : arrayUnion(docRef.id)
    })
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

export async function getTask(projectID) {
  try {
    const prSnap = await getProjectByID([projectID])
    if(prSnap.docs[0].data().tasks.length == 0)
      return []

    const q = query(taskRF, where("id", "in", prSnap.docs[0].data().tasks))
    const snap = await getDocs(q)
    let tasks = []
    snap.forEach((doc) => {
      tasks.push(doc.data())
    })
    return tasks
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

export async function uploadAva(file, id){
    let avaURL;
    const storageRef = ref(storage, `images/avatar/${id}.jpg`);
    console.log("uploading file");
    await uploadBytes(storageRef, file).then((snapShot) => {
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
    //return avaURL;
};

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

