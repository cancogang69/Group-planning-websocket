import * as firebase from "../firebase.js"

export async function addProject(projectData) {
  const newProject = {
    title: projectData.title,
    createdAt: projectData.createdAt,
    status: projectData.completionStatus,
    description: projectData.description, 
    tasks: [],
    members: [],
    master: projectData.master
  }
  const project = await firebase.addNewProject(newProject)
  await firebase.addUserSharedProj(projectData.master, project.id)
  return project
}

export async function addMember(projectID, master, member) {
  const prjID = await firebase.addMember(projectID, master, member)
  console.log(prjID)
  return prjID
}

export async function getProject(email) {
  const userData = await firebase.getUserData(email)
  const shPrj = await firebase.getProjectByID(userData.sharedIDs)
  let shPrjs = []
  shPrj.forEach((doc) => {
    let data = doc.data()
    data.id = doc.id
    shPrjs.push(data)
  })
  return shPrjs
}

export async function deleteProject(projectId) {
  try {
    firebase.deleteProject(projectId)
  } catch (e) {
    console.error("Error deleting document: ", e);
  }
}


