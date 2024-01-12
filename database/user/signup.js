import { getUserEmail, addUser } from "../firebase.js"
import bcrypt from 'bcrypt';

export async function signUp(userData) {
  const unique = await getUserEmail(userData.email);
  if (!unique.empty)
    throw new Error('Email aLready exist')

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(userData.password, saltRounds);   
  const newUser = {
    "email": userData.email,
    "userName": userData.name, 
    "hashPassword": hashedPassword,
    "personalIDs": [],
    "sharedIDs": [],
  }

  await addUser(newUser)

  return newUser
}
