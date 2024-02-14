import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import express, { Request, Response, NextFunction } from "express";
import { CreateCustomerInputs, UserLoginInputs } from "../dto/Customer.dto";
import {
  GenerateOtp,
  GeneratePassword,
  GenerateSalt,
  GenerateSignature,
  ValidatePassword,
  onRequestOTP,
} from "../utility";
import { Customer } from "../models/Customer";

export const CustomerSignUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customerInputs = plainToClass(CreateCustomerInputs, req.body);

  const inputErrors = await validate(customerInputs, {
    validationError: { target: true },
  });

  if (inputErrors.length > 0) {
    return res.status(400).json(inputErrors);
  }
  const { email, phone, password } = customerInputs;

  const salt = await GenerateSalt();
  const userPassword = await GeneratePassword(password, salt);

  const { otp, expiry } = GenerateOtp();

  const existingCustomer = await Customer.findOne({ email: email });

  if (existingCustomer !== null) {
    return res.status(400).json({ message: "User Already exists" });
  }

  const result = await Customer.create({
    email: email,

    password: userPassword,
    salt: salt,
    phone: phone,
    firstname: "",
    lastname: "",
    address: "",
    otp: otp,
    otp_expiry: expiry,
    verified: false,
    lat: 0,
    log: 0,
  });

  if (result) {
    // send the OTP to customer
    await onRequestOTP(otp, phone);
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

export const CustomerLogin = async (
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

  const customer = await Customer.findOne({ email: email });

  if (customer) {
    const validation = await ValidatePassword(
      password,
      customer.password,
      customer.salt
    );

    if (validation) {
      // generate the signature
      const signature = GenerateSignature({
        _id: customer._id,
        email: customer.email,
        verified: customer.verified,
      });
      // send the result to client
      return res.status(201).json({
        signature: signature,
        verified: customer.verified,
        email: customer.email,
      });
    }
  }

  return res.status(404).json({ message: "Login Error" });
};

// -------------------------------------------------------------------------------

export const CustomerVerify = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { otp } = req.body;
  const customer = req.user;

  if (customer) {
    const profile = await Customer.findById(customer._id);

    if (profile) {
      if (profile.otp === parseInt(otp) && profile.otp_expiry >= new Date()) {
        profile.verified = true;

        const updateCustomerResponse = await profile.save();

        // Generate the signature
        const signature = GenerateSignature({
          _id: updateCustomerResponse._id,
          email: updateCustomerResponse.email,
          verified: updateCustomerResponse.verified,
        });

        return res.status(201).json({
          signature: signature,
          verified: updateCustomerResponse.verified,
          email: updateCustomerResponse.email,
        });
      }
    }
  }

  return res.status(400).json({ message: "Error with OTP Validation" });
};

// =============================================================================

// export const RequestOtp = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const customer = req.user;

//   if (customer) {
//     const profile = await Customer.findById(customer._id);

//     if (profile) {
//       const { otp, expiry } = GenerateOtp();

//       profile.otp = otp;
//       profile.otp_expiry = expiry;

//       await profile.save();
//       await onRequestOTP(otp, profile.phone);

//       res.status(200).json({ message: "OTP Sent to your registered number!" });
//     }

//     res.status(400).json({ message: "Error with Request OTP" });
//   }
// };

export const RequestOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;

  if (!customer) {
    return res.status(400).json({ message: "Error with Request OTP" });
  }

  try {
    const profile = await Customer.findById(customer._id);

    if (!profile) {
      return res.status(400).json({ message: "Error with Request OTP" });
    }

    const { otp, expiry } = GenerateOtp();

    profile.otp = otp;
    profile.otp_expiry = expiry;

    await profile.save();
    await onRequestOTP(otp, profile.phone);

    res.status(200).json({ message: "OTP Sent to your registered number!" });
  } catch (error) {
    console.error("Error in RequestOtp:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


// ========================================================================

export const GetCustomerProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {};

export const EditCustomerProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {};
