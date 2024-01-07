import * as firebase from "../firebase.js"
import bcrypt from 'bcrypt';

export async function signUp(userName, email, password) {
  const unique = await firebase.isEmailUnique(email); 
  if (!unique) { 
    throw new Error('Email aLready exist')
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);   
  const newUser = {
    "userName": userName, 
    "email": email, 
    "hashPassword": hashedPassword
  }
  firebase.addUser(newUser)
}