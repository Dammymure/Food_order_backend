import express, { Request, Response, NextFunction } from "express";
import {
  CreateOrder,
  CustomerLogin,
  CustomerSignUp,
  CustomerVerify,
  EditCustomerProfile,
  GetCustomerProfile,
  GetOrderById,
  GetOrders,
  RequestOtp,
} from "../controllers";
import { Authenticate } from "../middleware";

const router = express.Router();

/**----------------------Signup / Create Customer---------------------**/
router.post("/signup", CustomerSignUp);

/**----------------------Login---------------------**/

router.post("/login", CustomerLogin);

// Authenticate
router.use(Authenticate);

/**----------------------Verify Customer Account---------------------**/
router.patch("/verify", CustomerVerify);

/**----------------------GTP / Requesting OTP---------------------**/
router.get("/otp", RequestOtp);

/**----------------------Profile---------------------**/
router.get("/profile", GetCustomerProfile);

router.patch("/profile", EditCustomerProfile);

// Cart
// Payment

// Order
router.post('/create-order', CreateOrder);
router.get('/orders', GetOrders)
router.get('/order/:id', GetOrderById)


export { router as CustomerRoute };
