import mongoose from "mongoose";
import { MONGO_URI } from "../config";

export default async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      // useNewUrlParser: true,
      // useUnifiedTopography:true,
      // useCreateIndex: true
    });

    console.log("DB connected.....");
  } catch (ex) {
    console.log(ex);
  }
};
