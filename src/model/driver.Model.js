import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;

const driverSchema = new mongoose.Schema(
  {
    fullname: { type: String, maxLength: 50, required: true },
    password: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    avatar: {
      publicId: { type: String, required: true },
      url: { type: String, required: true },
    },

    // Driver's vehicle details
    vehicle: {
      make: { type: String, required: true }, // Vehicle make/brand (e.g., Toyota, Honda)
      model: { type: String, required: true }, // Vehicle model (e.g., Corolla, Civic)
      registrationNumber: { type: String, required: true }, // Vehicle registration/license number
      chassisNumber: { type: String, required: true }, // Vehicle chassis number
      year: { type: Number, required: true }, // Year of manufacture
      color: { type: String }, // Vehicle color
      insuranceDetails: {
        policyNumber: { type: String }, // Insurance policy number
        expirationDate: { type: Date }, // Expiry date of the insurance policy
        policyProvider: { type: String }, //   provider company of the policy
      },
    },

    // Driver's address details
    address: {
      streetaddress: { type: String },
      state: { type: String },
      city: { type: String },
      landmark: { type: String },
      pincode: { type: Number },
      country: { type: String },
    },

    // Documents containing PAN and Aadhar details
    documents: {
      pan: {
        panNumber: { type: String },
        panHolderName: { type: String },
        dob: { type: Date }, // Date of Birth as per PAN card
      },
      adhar: {
        adharNumber: { type: String },
        address: {
          streetaddress: { type: String },
          state: { type: String },
          city: { type: String },
          pincode: { type: Number },
          country: { type: String },
        },
      },
    },

    // Passbook details
    passbookDetails: {
      accountNumber: { type: String },
      bankName: { type: String },
      ifsc: { type: String },
      passbookHolderName: { type: String },
      cifNumber: { type: String },
    },

    // Reference to the hub the driver is assigned to
    hub: { type: ObjectId, ref: "Hub", required: true },

    // Orders assigned to the driver
    orders: [{ type: ObjectId, ref: "Order" }],
  },
  { timestamps: true }
);

const Driver = mongoose.model("Driver", driverSchema);

export default Driver;
