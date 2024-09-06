import { Router } from "express";
import { upload } from "../middlewares/middleware.js";
import {uploadOnS3} from "../controllers/aws.controller.js"
const router = new Router();

router.route("/upload").post(upload,uploadOnS3);


export default router