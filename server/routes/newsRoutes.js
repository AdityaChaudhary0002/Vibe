
import express from "express";
import { getNews } from "../controllers/newsController.js";

const newsRouter = express.Router();

newsRouter.get("/", getNews);

export default newsRouter;
