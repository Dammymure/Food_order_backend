import express from "express";
import App from "./services/ExpressApp";
import dbConnection from "./services/Database";
import { PORT } from "./config";

const StartServer = async () => {
  const app = express();

  await dbConnection();

  await App(app);

  app.listen(process.env.PORT, () => {
    console.log(`Listening to port ${process.env.PORT}`);
  });
};

StartServer();
