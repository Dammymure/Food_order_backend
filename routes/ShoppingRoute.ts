import express, { Request, Response, NextFunction} from 'express'
import { GetFoodAvailability, GetFoodIn30Min, GetTopRestaurants, RestaurantById, SearchFoods } from '../controllers'

const router = express.Router()

/**-------------Food Availability----------**/
router.get('/:pincode', GetFoodAvailability)

/**-------------Top Restaurant----------**/
router.get('/top-restaurants/:pincode', GetTopRestaurants)

/**--Foods Available in 30 Minutes----------**/
router.get('/foods-in-30-min/:pincode', GetFoodIn30Min)

/**-------------Search Foods----------**/
router.get('/search/:pincode', SearchFoods)

/**-----------Find Restaurant by Id---------**/
router.get('/restaurant/:id', RestaurantById)



export { router as ShoppingRoute}