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
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUI from "swagger-ui-express";

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/post", postsRoutes);
app.use("/comment", commentsRoutes);
app.use("/auth", authRoutes);

const options = {
  definition: {
  openapi: "3.0.0",
  info: {
  title: "Web Dev 2025 REST API",
  version: "1.0.0",
  description: "REST server including authentication using JWT",
  },
  servers: [{url: "http://localhost:3000",},],
  },
  apis: ["./src/routes/*.ts"],
  };
  const specs = swaggerJsDoc(options);
  app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));
 
 

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

export const closeConnection = () => {
  mongoose.connection.close();
};

export default initApp;
