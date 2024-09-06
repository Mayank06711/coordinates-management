import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      trim: true,
      maxLength: 50,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      maxLength: 30,
      required: true,
    },
    username: {
      type: String,
      maxLength: 30,
      trim: true,
      unique: true,
      required: true,
    },
    gender: {
      type: String,
      required: function () {
        return this.isSeller === false;
      }, // Required for customers, not for sellers
    },
    address: {
      streetAddress: { type: String },
      state: { type: String, required: true },
      city: { type: String, required: true },
      landmark: { type: String },
      pinCode: { type: Number, required: true },
      country: { type: String, required: true },
      coordinates: {
        latitude: { type: Number },
        longitude: { type: Number },
        altitude: { type: Number },
        provider: { type: String },
        accuracy: { type: Number },
        bearing: { type: Number },
      },
    },
    isSeller: { type: Boolean, default: false },
    isSellerVerified: { type: Boolean, default: false },

    // Seller-specific fields
    storeAddress: [
      {
        buildingNo: { type: String },
        city: { type: String },
        state: { type: String },
        postal: { type: Number },
        landmark: { type: String },
        coordinates: {
          latitude: { type: Number },
          longitude: { type: Number },
          altitude: { type: Number },
          provider: { type: String },
          accuracy: { type: Number },
          bearing: { type: Number },
        },
      },
    ],

    // Customer-specific fields
    purchaseHistory: [{ type: ObjectId, ref: "Order" }],
    purchaseProducts: [{ type: ObjectId, ref: "Product" }],
    orders: [
      {
        type: ObjectId,
        ref: "Order",
        status: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

userSchema.index({email:1, username:1});
const User = mongoose.model("User", userSchema);

export default User;
