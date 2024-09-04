import dotenv from "dotenv"
import app from "./app.js";
import conncetDb from "./db/index.js"
import {createFakeCustomer} from "./helper/faker.js"
dotenv.config({
    path: "./.env",
})



conncetDb(process.env.MONGODB_URI)
.then(()=>{
  // for(let i = 0; i< 5; i++){
  //   createFakeCustomer()
  //    .then((customer)=>{
  //       console.log(`Customer ${i+1} created successfully`)
  //     })
  //    .catch((err)=>{
  //       console.log(`Error creating customer ${i+1} : ${err}`)
  //     })
  //    .finally(()=>{
  //      console.log(`Customer ${i+1} created successfully and exiting`)
  //       process.exit(1);
  //     })
  // }
  
  app.listen(process.env.PORT||9991, ()=>{
  console.log(`Server is running on port: ${process.env.PORT}`)
  });
})
.catch(
  (err)=>{console.log("Mongo DB connection failed !! " + err)}
)