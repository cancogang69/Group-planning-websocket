import { getUserData } from '../firebase.js';
import bcrypt from 'bcrypt';

export async function login(email, password) {
  const user = await getUserData(email)
  if (!user) 
    throw new Error('User not found')
  
  const isMatch = await bcrypt.compare(password, user.hashPassword)
  if(!isMatch)
    throw new Error('Incorrect password')
  
  return user;   
}