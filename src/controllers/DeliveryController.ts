import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import express, { Request, Response, NextFunction } from "express";
import {
  CreateCustomerInputs,
  UserLoginInputs,
  EditCustomerProfileInputs,
  OrderInputs,
  CartItem,
  CreateDeliveryUserInputs,
} from "../dto/Customer.dto";
import {
  GenerateOtp,
  GeneratePassword,
  GenerateSalt,
  GenerateSignature,
  ValidatePassword,
  onRequestOTP,
} from "../utility";
import { Customer } from "../models/Customer";
import { DeliveryUser } from "../models/DeliveryUser";
import { Food, Offer, Transaction, Vendor } from "../models";
import { GetFoods } from "./VendorController";
import { Order } from "../models/Order";

export const DeliveryUserSignUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const deliveryUserInputs = plainToClass(CreateDeliveryUserInputs, req.body);

  const inputErrors = await validate(deliveryUserInputs, {
    validationError: { target: true },
  });

  if (inputErrors.length > 0) {
    return res.status(400).json(inputErrors);
  }
  const { email, phone, password, address, firstName, lastName, pincode } = deliveryUserInputs;

  const salt = await GenerateSalt();
  const userPassword = await GeneratePassword(password, salt);


  const existingDeliveryUser = await DeliveryUser.findOne({ email: email });

  if (existingDeliveryUser !== null) {
    return res.status(400).json({ message: "A Delivery User exists with the provided email" });
  }

  const result = await DeliveryUser.create({
    email: email,
    password: userPassword,
    salt: salt,
    phone: phone,
    firstname: firstName,
    lastname: lastName,
    address: address,
    pincode: pincode,
    verified: false,
    lat: 0,
    log: 0,
    isAvailable : false
  });

  if (result) {
    // generate the signature
    const signature = GenerateSignature({
      _id: result._id,
      email: result.email,
      verified: result.verified,
    });

    // send the result to client
    return res.status(201).json({
      signature: signature,
      verified: result.verified,
      email: result.email,
    });
  }

  return res.status(400).json({ message: "Error with SignUp" });
};

// ---------------------------------------------------------------------------------------

export const DeliveryUserLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const loginInputs = plainToClass(UserLoginInputs, req.body);

  const loginErrors = await validate(loginInputs, {
    validationError: { target: false },
  });

  if (loginErrors.length > 0) {
    return res.status(400).json(loginErrors);
  }

  const { email, password } = loginInputs;

  const deliveryUser = await DeliveryUser.findOne({ email: email });

  if (deliveryUser) {
    const validation = await ValidatePassword(
      password,
      deliveryUser.password,
      deliveryUser.salt
    );

    if (validation) {
      // generate the signature
      const signature = GenerateSignature({
        _id: deliveryUser._id,
        email: deliveryUser.email,
        verified: deliveryUser.verified,
      });
      // send the result to client
      return res.status(201).json({
        signature: signature,
        verified: deliveryUser.verified,
        email: deliveryUser.email,
      });
    }
  }

  return res.status(404).json({ message: "Login Error" });
};

// -------------------------------------------------------------------------------


export const GetDeliveryUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const deliveryUser = req.user;

  if (deliveryUser) {
    const profile = await DeliveryUser.findById(deliveryUser._id);

    if (profile) {
      return res.status(200).json(profile);
    }
  }

  return res.status(400).json({ message: "Error with fetch profile" });
};

// ===========================================================================
export const EditDeliveryUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const deliveryUser = req.user;

  const profileInputs = plainToClass(EditCustomerProfileInputs, req.body);

  const profileErrors = await validate(profileInputs, {
    validationError: { target: false },
  });

  if (profileErrors.length > 0) {
    return res.status(400).json(profileErrors);
  }

  const { firstname, lastname, address } = profileInputs;

  if (deliveryUser) {
    const profile = await DeliveryUser.findById(deliveryUser._id);

    if (profile) {
      profile.firstname = firstname;
      profile.lastname = lastname;
      profile.address = address;

      const result = await profile.save();

      res.status(200).json(result);
    }
  }

    return res.status(400).json({ message: "Error with fetch profile" });

};

export const UpdateDeliveryUserStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  const deliveryUser = req.user;

  if (deliveryUser) {

    const { lat, lng } = req.body;

    const profile = await DeliveryUser.findById(deliveryUser._id);

    if(profile){

     if(lat & lng){
      profile.lat;
      profile.lng;
     }

     profile.isAvailable = !profile.isAvailable;

     const result = await profile.save();

     return res.status(200).json(result)
     
    }
  }

  return res.status(400).json({ message: "Error with Update Status" });

}