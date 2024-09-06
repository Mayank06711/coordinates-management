import mongoose, {Schema} from "mongoose";

const customerSchema = new mongoose.Schema(
  { 
    email: {
      type: String,
      trim: true,
      maxLength: 50,
      required: true,
      unique: true,
    },
    gender: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      maxLength: 30,
      required: true,
    },
    purchaseHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
    purchaseProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        status: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    address: {
      streetAddress: { type: String },
      state: { type: String , required: true},
      city: { type: String, required: true},
      landmark: { type: String },
      pinCode: { type: Number, required: true},
      country: { type: String, required: true},
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
      required:true,
    },
  },
  { timestamps: false }
);

const Customer = mongoose.model("Customer", customerSchema);

export default Customer;
