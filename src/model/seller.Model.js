import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      trim: true,
      maxLength: 50,
    },
    fullname: {
      type: String,
      maxLength: 30,
    },
    storeAddress: [
      {
        buildingno: { type: String },
        city: { type: String },
        state: { type: String },
        postal: { type: Number },
        landmark: { type: String },
        gst: { type: String },
        businesscategory: { type: String },
        documenttype: { type: String },
        documentfile: { type: String },
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
    username: {
      type: String,
      maxLength: 30,
      trim: true,
      unique: true,
    },
    isStoreVerified: { type: Boolean, default: false },
    deliverypartners: [
      {
        time: { type: String, default: Date.now().toString() },
        id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
    useDefaultProsite: { type: Boolean, default: false },
    membershipHistory: [
      {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "Membership" },
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: false }
);

const Seller = mongoose.model("Seller", sellerSchema);

export default Seller;
