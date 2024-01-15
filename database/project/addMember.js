import { getUserEmail } from "../firebase.js"

export async function addMember(members, newMember) {
  const user = await getUserEmail(newMembers);
  if (!user) 
    return { success: false, message: 'User not found' };
  
  if(members.indexOf(newMember)==-1)
    return { success: false, message: 'User is already in' };
  
  members.push(newMember)
  return { success: true, message: 'Add new member successful', members };   
}