import * as firebase from "./firebase.js"
import bcrypt from 'bcrypt';

export async function SignUpUser(UserName, Email, password) {
    
  
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);   
    const newUser = {
      "userName": UserName, 
      "email": Email, 
      "password": password, 
      "hasedPassword": hashedPassword
  }
    firebase.addUserData(newUser)
    
  }

export async function loginUser(username, inputPassword) {
    
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