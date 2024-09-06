import { Router } from "express";
import { upload } from "../middlewares/middleware.js";
import {uploadOnS3, getObjectS3, delObjectS3, getListObjectS3} from "../controllers/aws.controller.js"
const router = new Router();

router.route("/upload").post(upload,uploadOnS3);
router.route("/object/:keyName").get(getObjectS3);
router.route("/objects/list").get(getListObjectS3);
router.route("/object/del").delete(delObjectS3);
export default router