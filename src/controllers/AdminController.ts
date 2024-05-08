import { Request, Response, NextFunction } from "express";
import { CreateVendorInput } from "../dto";
import { DeliveryUser, Transaction, Vendor } from "../models";
import { GeneratePassword, GenerateSalt } from "../utility";

export const FindVendor = async (id: string | undefined, email?: string) => {
  if (email) {
    return await Vendor.findOne({ email: email });
  } else {
    return await Vendor.findById(id);
  }
};

export const CreateVendor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    name,
    address,
    pincode,
    foodType,
    email,
    password,
    ownerName,
    phone,
  } = <CreateVendorInput>req.body;

  const existingVendor = await FindVendor("", email);

  if (existingVendor !== null) {
    return res.json({ message: "A Vendor already exists with this email" });
  }

  // Generate salt
  const salt = await GenerateSalt();
  const userPassword = await GeneratePassword(password, salt);

  // encryptthe password using salt

  const CreateVendor = await Vendor.create({
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
    foods: [],
    lat:0,
    lng:0
  });

  return res.json(CreateVendor);
};

export const GetVendors = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const vendors = await Vendor.find();

  if (vendors !== null) {
    return res.json(vendors);
  }

  return res.json({ message: "Vendor data not available" });
};

export const GetVendorByID = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const vendorId = req.params.id;

  const vendor = await FindVendor(vendorId);

  if (vendor !== null) {
    return res.json(vendor);
  }

  return res.json({ message: "Vendor data not available" });
};


export const GetTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const transactions = await Transaction.find();

  if(transactions){
    return res.status(200).json(transactions)
  }

  return res.json({"messasge":"Transactions not available!"})

};


export const GetTransactionById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  const id = req.params.id;

  const transaction = await Transaction.findById(id);

  if(transaction){
    return res.status(200).json(transaction)
  }

  return res.json({"messasge":"Transaction not available!"})

};

export const VerifyDeliveryUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => { 
  const { _id, status } = req.body;

  if(_id){
    const profile = await DeliveryUser.findById(_id);

    if(profile){
      profile.verified = status;

      const result = await profile.save()

      return res.status(200).json(result);
    }
  }

    return res.json({ messasge: "Unable to verify Delivery User" });

}


export const GetDeliveryUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => { 

    const deliveryUsers = await DeliveryUser.find();

    if (deliveryUsers) {

      return res.status(200).json(deliveryUsers);
    }
  

    return res.json({ messasge: "Unable to get Delivery Users" });

}