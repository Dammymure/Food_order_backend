import express, { Request, Response, NextFunction } from "express";
import { GetVandorProfile, UpdateVandorProfile, UpdateVandorServices, VandorLogin } from "../controllers";
import { Authenticate } from "../middleware";

const router = express.Router();

router.post('/login', VandorLogin)

router.use(Authenticate)

router.get('/profile', GetVandorProfile)
router.patch('/profile', UpdateVandorProfile)
router.patch('/service', UpdateVandorServices)

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.json({ message: "Hello from Vandor" });
});

export { router as VandorRoute };
