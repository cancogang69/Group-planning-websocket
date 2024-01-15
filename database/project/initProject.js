import * as firebase from "../firebase.js"

export async function initProject(email, password) {
  const user = await firebase.getUserEmail(email);
  if (!user) 
    return { success: false, message: 'User not found' };
  
  const isMatch = await bcrypt.compare(password, user.hashPassword);
  if(!isMatch)
  return { success: false, message: 'Incorrect password' };
  
  return { success: true, message: 'Login successful', user };   
}