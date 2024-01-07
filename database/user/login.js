import * as firebase from "../firebase.js"
import bcrypt from 'bcrypt';

export async function login(username, inputPassword) {
  const result = await firebase.getUserByUsername(username);
  if (!result) {
    return { success: false, message: 'User not found' };
  }
  
  const isMatch = await bcrypt.compare(inputPassword, result.hasedPassword);
  if (isMatch) {
    return { success: true, message: 'Login successful', username };
  } else {
    return { success: false, message: 'Incorrect password' };
  }    
}