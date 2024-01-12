import { getUserEmail } from '../firebase.js';
import bcrypt from 'bcrypt';

export async function login(email, password) {
  const user = await getUserEmail(email);
  if (!user) 
    return { success: false, message: 'User not found' };
  
  const isMatch = await bcrypt.compare(password, user.hashPassword);
  if(!isMatch)
    return { success: false, message: 'Incorrect password' };
  
  return { success: true, message: 'Login successful', user };   
}