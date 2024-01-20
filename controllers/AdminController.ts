import { Request, Response, NextFunction } from "express";
import { CreateVandorInput } from "../dto";
import { Vandor } from "../models";
import { GeneratePassword, GenerateSalt } from "../utility";

export const CreateVandor = async (req: Request, res: Response, next: NextFunction) =>{
 const {name, address, pincode, foodType, email, password, ownerName, phone} = <CreateVandorInput>req.body

  const existingVandor = await Vandor.findOne({email:email})

  if(existingVandor !== null){
    return res.json({"message":"A Vandor already exists with this email"})
  }

  // Generate salt
  const salt = await GenerateSalt()
  const userPassword = await GeneratePassword(password, salt)

  // encryptthe password using salt

  const CreateVandor = await Vandor.create({
    name: name,
    address: address,
    ownerName: ownerName,
    pincode: pincode,
    foodType: foodType,
    phone: phone,
    email: email,
    password: userPassword,
    salt: salt,
    serviceAvailable: false,
    coverImage: [],
    rating: 0,
  });



 return res.json(CreateVandor);
}

export const GetVandors = async (req: Request, res: Response, next: NextFunction) =>{

}

export const GetVandorByID = async (req: Request, res: Response, next: NextFunction) =>{

}