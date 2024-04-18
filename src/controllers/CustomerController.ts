import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import express, { Request, Response, NextFunction } from "express";
import {
  CreateCustomerInputs,
  UserLoginInputs,
  EditCustomerProfileInputs,
  OrderInputs,
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
import { Food } from "../models";
import { GetFoods } from "./VendorController";
import { Order } from "../models/Order";

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
    orders: [],
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
    res.status(500).json({ message: "Error in RequestOtp" });
  }
};

// ========================================================================

export const GetCustomerProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;

  if (customer) {
    const profile = await Customer.findById(customer._id);

    if (profile) {
      return res.status(200).json(profile);
    }
  }

  res.status(400).json({ message: "Error with fetch profile" });
};

// ===========================================================================
export const EditCustomerProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;

  const profileInputs = plainToClass(EditCustomerProfileInputs, req.body);

  const profileErrors = await validate(profileInputs, {
    validationError: { target: false },
  });

  if (profileErrors.length > 0) {
    return res.status(400).json(profileErrors);
  }

  const { firstname, lastname, address } = profileInputs;

  if (customer) {
    const profile = await Customer.findById(customer._id);

    if (profile) {
      profile.firstname = firstname;
      profile.lastname = lastname;
      profile.address = address;

      const result = await profile.save();

      res.status(200).json(result);
    }
  }
};

// CART===========================

export const AddToCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;

  if (customer) {
    const profile = await Customer.findById(customer._id).populate("cart.food");

    let cartItems = Array();

    const { _id, unit } = <OrderInputs>req.body;

    const food = await Food.findById(_id);

    if (food) {
      if (profile != null) {
        // check for items
        cartItems = profile.cart;

        if (cartItems.length > 0) {
          // check and update unit
          let existFoodItems = cartItems.filter(
            (item) => item.food._id.toString() === _id
          );

          if (existFoodItems.length > 0) {
            const index = cartItems.indexOf(existFoodItems[0]);

            if (unit > 0) {
              cartItems[index] = { food, unit };
            } else {
              cartItems.splice(index, 1);
            }
          } else {
            cartItems.push({ food, unit });
          }
        } else {
          // add new item to cart
          cartItems.push({ food, unit });
        }

        if (cartItems) {
          profile.cart = cartItems as any;
          const cartresult = await profile.save();
          return res.status(200).json(cartresult.cart);
        }
      }
    }
  }

  return res.status(400).json({ message: "Unable to create Cart!" });
};

export const GetCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;

  if (customer) {
    const profile = await Customer.findById(customer._id).populate("cart.food");
    if (profile) {
      return res.status(200).json(profile.cart);
    }
  }
  return res.status(400).json({ message: "cart is empty!" });
};

export const DeleteCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;

  if (customer) {
    const profile = await Customer.findById(customer._id).populate("cart.food");
    if (profile != null) {
      profile.cart = [] as any;
      const cartResult = await profile.save();
      return res.status(200).json(cartResult);
    }
  }
  return res.status(400).json({ message: "cart is already empty!" });
};

// ORDER======

export const CreateOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // grab curent login Customer
  const customer = req.user;

  if (customer) {
    // create an order ID

    const orderId = `${Math.floor(Math.random() * 89999) + 1000}`;

    const profile = await Customer.findById(customer._id);
    if (!profile) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // GRSB ORDER ITEMS FROM Request
    const cart = <[OrderInputs]>req.body;

    let cartItems = Array();

    let netAmount = 0.0;

    let vendorId;

    // Calculate order amount
    const foods = await Food.find()
      .where("_id")
      .in(cart.map((item) => item._id))
      .exec();

    foods.map((food) => {
      cart.map(({ _id, unit }) => {
        if (food._id == _id) {
          vendorId = food.vendorId;
          netAmount += food.price * unit;
          cartItems.push({ food, unit });
        }
      });
    });

    // create order with item description
    if (cartItems) {
      // create order

      const currentOrder = await Order.create({
        orderID: orderId,
        vendorId: vendorId,
        items: cartItems,
        totalAmount: netAmount,
        orderDate: new Date(),
        paidThrough: "COD",
        paymentResponse: "",
        orderStatus: "Waiting",
        remarks: "",
        deliveryId: "",
        appliedOffer: false,
        offerId: null,
        readyTime: 45,
      });

      profile.cart = [] as any;
      profile.orders.push(currentOrder);

      const profileSaveResponse = await profile.save();

      return res.status(200).json(profileSaveResponse);
    } else {
      return res.status(400).json({ message: "Unable to create Order!" });
    }
  }
};

export const GetOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;

  if (customer) {
    const profile = await Customer.findById(customer._id).populate("orders");

    if (profile) {
      return res.status(200).json(profile.orders);
    }
  }
};

export const GetOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const orderId = req.params.id;

  if (orderId) {
    const order = await Order.findById(orderId).populate("items.food");

    res.status(200).json(order);
  }
};
