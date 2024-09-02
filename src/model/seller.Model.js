import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      trim: true,
      maxLength: 50,
    },
    fullName: {
      type: String,
      maxLength: 30,
    },
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
    username: {
      type: String,
      maxLength: 30,
      trim: true,
      unique: true,
    },
    isSellerVerified: { type: Boolean, default: false },
    // useDefaultProsite: { type: Boolean, default: false },
  },
  { timestamps: false }
);

const Seller = mongoose.model("Seller", sellerSchema);

export default Seller;
