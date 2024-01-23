import { Request, Response, NextFunction } from "express";
import { VandorLoginInputs } from "../dto";
import { FindVandor } from "./AdminController";
import { ValidatePassword } from "../utility";

export const VandorLogin = async (req:Request, res: Response, next: NextFunction) =>{
 const {email, password} = <VandorLoginInputs>req.body

 const existingVandor = await FindVandor( '', email )

 if(existingVandor !== null){

  // Validate Password
  const validation = await ValidatePassword(password, existingVandor.password, existingVandor.salt)

  if(validation){

   return res.json(existingVandor)

  }else{
   return res.json({"message":"Password is not valid"})

  }

 }
 return res.json({"message":"Login credential not valid"})
}