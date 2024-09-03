import dotenv from "dotenv"
import app from "./app.js";
import conncetDb from "./db/index.js"

dotenv.config({
    path: "./.env",
})



conncetDb(process.env.MONGODB_URI)
.then(()=>{
  app.listen(process.env.PORT||9991, ()=>{
  console.log(`Server is running on port: ${process.env.PORT}`)
  });
})
.catch(
  (err)=>{console.log("Mongo DB connection failed !! " + err)}
)