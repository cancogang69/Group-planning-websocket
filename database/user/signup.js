import { getUserEmail, addUser } from "../firebase.js"
import bcrypt from 'bcrypt';

export async function signUp(userData) {
  const unique = await getUserEmail(userData.email);
  if (!unique.empty)
    throw new Error('Email has already been taken')

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(userData.password, saltRounds);   
  const newUser = {
    email: userData.email,
    name: userData.name, 
    hashPassword: hashedPassword,
    sharedIDs: [],
  }

  await addUser(newUser)

  return newUser
}
