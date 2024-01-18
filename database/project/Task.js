import * as firebase from "../firebase.js"

export async function addTask(taskData) {
  try {
    const newTask = {
        "id": taskData.key, 
        "status":taskData.status,
        "description": taskData.text, 
        "assignedTo": taskData.asigned_to,
    }
    firebase.addTask(newTask)
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

export async function getTask() {
    try {
        const tasks = await firebase.getTask()
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
