import * as firebase from "../firebase.js"

export async function addTask(taskData, projectID) {
  try {
    const newTask = {
        "status": taskData.status,
        "description": taskData.text, 
    }
    firebase.addTask(newTask, projectID)
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

export async function getTask(projectID) {
  try {
      const tasks = await firebase.getTask(projectID)
      return tasks
  } catch (e) {
      console.error("Error getting documents: ", e);
  }
}

export async function updateTask(taskID, task) {
  try {
    firebase.updateTask(taskID, task)
  } catch (e) {
    console.error("Error updating document: ", e);
  }
}

export async function deleteTask(taskID) {
  try {
    firebase.deleteTask(taskID)
  } catch (e) {
    console.error("Error updating document: ", e);
  }
}