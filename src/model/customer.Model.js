import mongoose, {Schema} from "mongoose";
import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      trim: true,
      maxLength: 50,
    },
    gender: {
      type: String,
    },
    fullname: {
      type: String,
      maxLength: 30,
    },
    purchase_history: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
    purchase_products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        status: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    address: {
      streetaddress: { type: String },
      state: { type: String },
      city: { type: String },
      landmark: { type: String },
      pincode: { type: Number },
      country: { type: String },
      coordinates: {
        latitude: { type: Number },
        longitude: { type: Number },
        altitude: { type: Number },
        provider: { type: String },
        accuracy: { type: Number },
        bearing: { type: Number },
      },
    },
    username: {
      type: String,
      maxLength: 30,
      trim: true,
      unique: true,
    },
  },
  { timestamps: false }
);

const Customer = mongoose.model("Customer", customerSchema);

export default Customer;
