import { isEmailExist, addUser } from "../firebase.js"
import bcrypt from 'bcrypt';

export async function signUp(userName, email, password) {
  const unique = await isEmailExist(email); 
  if (unique)
    throw new Error('Email aLready exist')

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);   
  const newUser = {
    "email": email,
    "userName": userName, 
    "hashPassword": hashedPassword,
    "personalIDs": [],
    "sharedIDs": [],
  }
  
  await addUser(newUser)
  return newUser
}