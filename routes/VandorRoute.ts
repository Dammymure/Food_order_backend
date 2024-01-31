import express, { Request, Response, NextFunction } from "express";
import { AddFood, GetFoods, GetVandorProfile, UpdateVandorCoverImage, UpdateVandorProfile, UpdateVandorServices, VandorLogin } from "../controllers";
import { Authenticate } from "../middleware";
import multer from 'multer'

const router = express.Router();

const imageStorage = multer.diskStorage({
  
  destination: function(req, file, cb){
    cb(null, 'images')
  },
  filename: function(req, file, cb){
    cb(null, new Date().toISOString().replace(/:/g, "-") + "_" + file.originalname
    );
  }
})

const images = multer( {storage: imageStorage}).array('images', 10)

router.post('/login', VandorLogin)

router.use(Authenticate)

router.get('/profile', GetVandorProfile)
router.patch('/profile', UpdateVandorProfile)
router.patch('/coverimage', images, UpdateVandorCoverImage)
router.patch('/service', UpdateVandorServices)


router.post('/food', images, AddFood)
router.get('/foods', GetFoods)

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.json({ message: "Hello from Vandor" });
});

export { router as VandorRoute };
