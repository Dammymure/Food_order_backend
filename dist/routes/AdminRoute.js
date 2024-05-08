"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminRoute = void 0;
const express_1 = __importDefault(require("express"));
const AdminController_1 = require("../controllers/AdminController");
const router = express_1.default.Router();
exports.AdminRoute = router;
router.post("/vendor", AdminController_1.CreateVendor);
router.get("/vendors", AdminController_1.GetVendors);
router.get("/vendor/:id", AdminController_1.GetVendorByID);
router.get("/", (req, res, next) => {
    res.json({ message: "Hello from Admin" });
});
