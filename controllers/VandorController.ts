import { Request, Response, NextFunction } from "express";
import { EditVandorInputs, VandorLoginInputs } from "../dto";
import { FindVandor } from "./AdminController";
import { GenerateSignature, ValidatePassword } from "../utility";

export const VandorLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = <VandorLoginInputs>req.body;

  const existingVandor = await FindVandor("", email);

  if (existingVandor !== null) {
    // Validate Password
    const validation = await ValidatePassword(
      password,
      existingVandor.password,
      existingVandor.salt
    );

    if (validation) {
      const signature = GenerateSignature({
        _id: existingVandor.id,
        email: existingVandor.email,
        foodTypes: existingVandor.foodType,
        name: existingVandor.name,
      });

      return res.json(signature);
    } else {
      return res.json({ message: "Password is not valid" });
    }
  }
  return res.json({ message: "Login credential not valid" });
};

// ---------------------------------------------------------------

export const GetVandorProfile = async (req: Request, res: Response, next: NextFunction
) => {

 const user = req.user

 if(user){
  
  const existingVandor = await FindVandor(user._id)

  return res.json(existingVandor)
 } 

 return res.json({"message":"Vandor information Not Found"})

};

// --------------------------------------------------------------------------

export const UpdateVandorProfile = async (req: Request, res: Response, next: NextFunction
) => {

  const { foodTypes, name, address, phone } = <EditVandorInputs>req.body
   const user = req.user;

   if (user) {
     const existingVandor = await FindVandor(user._id);

    if(existingVandor !== null){

      existingVandor.name = name;
      existingVandor.address = address;
      existingVandor.phone = phone;
      existingVandor.foodType = foodTypes

      const savedResult = await existingVandor.save();
      return res.json(savedResult);
    }

     return res.json(existingVandor);
   }

   return res.json({ message: "Vandor information Not Found" });
};

// ------------------------------------------------------------------------

export const UpdateVandorServices = async (req: Request, res: Response, next: NextFunction
) => {
    const user = req.user;

   if (user) {
     const existingVandor = await FindVandor(user._id);

    if(existingVandor !== null){

      existingVandor.serviceAvailable = !existingVandor.serviceAvailable;
      const savedResult = await existingVandor.save()

      return res.json(savedResult);
    }

     return res.json(existingVandor);
   }

   return res.json({ message: "Vandor information Not Found" });
};
