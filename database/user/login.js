import { getUserData, getProjectByID } from '../firebase.js';
import bcrypt from 'bcrypt';

export async function login(email, password) {
  let user = await getUserData(email)
  if (!user) 
    throw new Error('User not found')
  
  const isMatch = await bcrypt.compare(password, user.hashPassword)
  if(!isMatch)
    throw new Error('Incorrect password')
  
  let projects = []
  if(user.sharedIDs.length != 0) {
    const projSnap = await getProjectByID(user.sharedIDs)
    projSnap.forEach((doc) => {
      let project = doc.data()
      project.id = doc.id
      projects.push(project)
    })
    
  }
  let {hashPassword, ...rest} = user
  rest.projects = projects
  return rest   
}