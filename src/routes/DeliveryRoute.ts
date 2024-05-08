import express, { Request, Response, NextFunction } from "express";
import { DeliveryUserLogin, DeliveryUserSignUp, EditDeliveryUserProfile, GetDeliveryUserProfile, UpdateDeliveryUserStatus } from "../controllers";
import { Authenticate } from "../middleware";

const router = express.Router();

/**----------------------Signup / Create Customer---------------------**/
router.post("/signup", DeliveryUserSignUp);

/**----------------------Login---------------------**/

router.post("/login", DeliveryUserLogin);

// Authenticate
router.use(Authenticate);

// ----------------------change service status-----------------
router.put('/change-status', UpdateDeliveryUserStatus);



/**----------------------Profile---------------------**/
router.get("/profile", GetDeliveryUserProfile);

router.patch("/profile", EditDeliveryUserProfile);


export { router as DeliveryRoute };
