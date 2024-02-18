"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerRoute = void 0;
const express_1 = __importDefault(require("express"));
const controllers_1 = require("../controllers");
const middleware_1 = require("../middleware");
const router = express_1.default.Router();
exports.CustomerRoute = router;
/**----------------------Signup / Create Customer---------------------**/
router.post("/signup", controllers_1.CustomerSignUp);
/**----------------------Login---------------------**/
router.post("/login", controllers_1.CustomerLogin);
// Authenticate
router.use(middleware_1.Authenticate);
/**----------------------Verify Customer Account---------------------**/
router.patch("/verify", controllers_1.CustomerVerify);
/**----------------------GTP / Requesting OTP---------------------**/
router.get("/otp", controllers_1.RequestOtp);
/**----------------------Profile---------------------**/
router.get("/profile", controllers_1.GetCustomerProfile);
router.patch("/profile", controllers_1.EditCustomerProfile);
