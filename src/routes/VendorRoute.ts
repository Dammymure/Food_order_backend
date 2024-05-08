import express, { Request, Response, NextFunction } from "express";
import {
  AddFood,
  AddOffer,
  EditOffer,
  GetCurrentOrders,
  GetFoods,
  GetOffers,
  GetOrderDetails,
  GetVendorProfile,
  ProcessOrder,
  UpdateVendorCoverImage,
  UpdateVendorProfile,
  UpdateVendorServices,
  VendorLogin,
} from "../controllers";
import { Authenticate } from "../middleware";
import multer from "multer";

const router = express.Router();

const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "images");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      new Date().toISOString().replace(/:/g, "-") + "_" + file.originalname
    );
  },
});

const images = multer({ storage: imageStorage }).array("images", 10);

router.post("/login", VendorLogin);

router.use(Authenticate);

router.get("/profile", GetVendorProfile);
router.patch("/profile", UpdateVendorProfile);
router.patch("/coverimage", images, UpdateVendorCoverImage);
router.patch("/service", UpdateVendorServices);

router.post("/food", images, AddFood);
router.get("/foods", GetFoods);



// ORDER
router.get("/orders", GetCurrentOrders);
router.get("/order/:id/process", ProcessOrder);
router.get("/order/:id", GetOrderDetails);


// Offers
router.get("/offers", GetOffers)
router.post("/offer", AddOffer)
router.put("/offer/:id", EditOffer)
// Delete offers

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.json({ message: "Hello from Vendor" });
});

export { router as VendorRoute };
