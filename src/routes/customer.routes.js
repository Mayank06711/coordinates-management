import { Router } from "express";
import { upload } from "../middlewares/middleware.js";

const router = new Router();

// import controllers
import { createCustomer } from "../controllers/customer.controller.js";


// define routes

router.route("/new").post(createCustomer);

router.route("/uplo" ).post(upload,(req, res)=>{
    console.log(req.file);
    res.status(200).json({success: true});
})




export default router;