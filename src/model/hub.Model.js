import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;

const HubSchema = new mongoose.Schema(
  {
    hubAdmin: { 
        name:{type:String,required:true},
        email: {type:String,required:true},
        phoneNumber: {type:String,required:true},
        password: {type:String,required:true}, // Password for admin or manager,
        adminAvatar:{
            public_Id:{type:String,required:true},
            url: {type:String,required:true}
        }
     }, // The admin or manager of the hub
    location: {
      city: { type: String, required:true },
      state: { type: String, required:true },
      country: { type: String, required:true },
      coordinates: {
        latitude: { type: Number },
        longitude: { type: Number },
        altitude: { type: Number },
      },
    },
    address: {
      street: { type: String, required:true },
      pinCode: { type: String, required:true , maxlength:6},
    },
    capacity: { type: Number }, // The capacity of the hub in terms of number of orders it can handle
  },
  { timestamps: true }
);

const Hub = mongoose.model("Hub", HubSchema);


export default Hub;
