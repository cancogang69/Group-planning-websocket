import * as firebase from "../firebase.js"

export async function addProject(projectData) {
    const date = new Date(projectData.createdAt);
  try {
    const newProject = {
        "id": projectData.id, 
        "description": projectData.description, 
        "title": projectData.title,
        "status":projectData.completionStatus,
        "start": date,
    }
    firebase.addNewProject(newProject)
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

export async function getProject() {
  try {
    const projects = await firebase.getProject()
    // console.log(projects)
    return projects
  } catch (e) {
    console.error("Error getting documents: ", e);
  }
}

export async function deleteProject(projectId) {
  try {
    firebase.deleteProject(projectId)
  } catch (e) {
    console.error("Error deleting document: ", e);
  }
}


