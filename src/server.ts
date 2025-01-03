//Elad Rabinovitch 315409334
//Roie Raz 322713389

import express, { Express } from "express";
import dotenv from "dotenv";
dotenv.config();
import bodyParser from "body-parser";
import postsRoutes from "./routes/postRoutes";
import commentsRoutes from "./routes/commentRoutes";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes";
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/post", postsRoutes);
app.use("/comment", commentsRoutes);
app.use("/auth", authRoutes);

const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to database"));

const initApp = () => {
  return new Promise<Express>((resolve, reject) => {
    if (!process.env.MONGO_URI) {
      reject("DB_CONNECT is not defined in .env file");
    } else {
      mongoose
        .connect(process.env.MONGO_URI)
        .then(() => {
          resolve(app);
        })
        .catch((error) => {
          reject(error);
        });
    }
  });
};

export default initApp;
