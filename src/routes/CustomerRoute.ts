import express, { Request, Response, NextFunction } from "express";
import {
  AddToCart,
  CreateOrder,
  CreatePayment,
  CustomerLogin,
  CustomerSignUp,
  CustomerVerify,
  DeleteCart,
  EditCustomerProfile,
  GetCart,
  GetCustomerProfile,
  GetOrderById,
  GetOrders,
  RequestOtp,
  VerifyOffer
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
router.post('/cart', AddToCart)
router.get('/cart', GetCart)
router.delete('/cart', DeleteCart)

// Apply Offers
router.get('/offer/verify/:id', VerifyOffer)

// Payment
router.post("/create-payment", CreatePayment)


// Order
router.post('/create-order', CreateOrder);
router.get('/orders', GetOrders)
router.get('/order/:id', GetOrderById)


export { router as CustomerRoute };
