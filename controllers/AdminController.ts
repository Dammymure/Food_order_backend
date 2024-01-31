import { Request, Response, NextFunction } from "express";
import { CreateVandorInput } from "../dto";
import { Vandor } from "../models";
import { GeneratePassword, GenerateSalt } from "../utility";


export const FindVandor = async(id: string | undefined, email?: string)=>{

  if(email){
    return await Vandor.findOne({ email: email})
  }else{
    return await Vandor.findById(id)
  }
}

export const CreateVandor = async (req: Request, res: Response, next: NextFunction) =>{
 const {name, address, pincode, foodType, email, password, ownerName, phone} = <CreateVandorInput>req.body

  const existingVandor = await FindVandor("", email)

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
    foods: []
  });



 return res.json(CreateVandor);
}

export const GetVandors = async (req: Request, res: Response, next: NextFunction) =>{
  const vandors = await Vandor.find()

  if(vandors !== null){
    return res.json(vandors)
  }

  return res.json({"message":"Vandor data not available"})
}

export const GetVandorByID = async (req: Request, res: Response, next: NextFunction) =>{
  const vandorId = req.params.id;

  const vandor = await FindVandor(vandorId)

  if(vandor !== null){
    return res.json(vandor)
  }

  return res.json({ message: "Vandor data not available" });
}