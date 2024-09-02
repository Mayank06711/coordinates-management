import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;

const HubSchema = new mongoose.Schema(
  {
    hubAdmin: { type: ObjectId, ref: "User" }, // The admin or manager of the hub
    location: {
      city: { type: String },
      state: { type: String },
      country: { type: String },
      coordinates: {
        latitude: { type: Number },
        longitude: { type: Number },
        altitude: { type: Number },
      },
    },
    address: {
      street: { type: String },
      postalCode: { type: String },
    },
    capacity: { type: Number }, // The capacity of the hub in terms of number of orders it can handle
  },
  { timestamps: true }
);

const Hub = mongoose.model("Hub", HubSchema);

export default Hub;
