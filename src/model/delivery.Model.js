import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;

const DeliveriesSchema = new mongoose.Schema(
  {
    orderId: { type: ObjectId, ref: "Order" }, // Reference to the associated order
    deliveryPartner: { type: ObjectId, ref: "Driver" }, // Reference to the delivery partner
    status: {
      type: String,
      enum: [
        "pending",
        "picked_up",
        "in_transit",
        "delivered",
        "failed",
        "returned",
      ],
      default: "pending",
    },
    pickupTime: { type: Date },
    deliveryTime: { type: Date },
    hub: { type: ObjectId, ref: "Hub" }, // Reference to the hub managing the delivery
    routes: {
      A: { type: String },
      B: { type: String },
      C: { type: String },
      D: { type: String },
    }, // The potential routes or checkpoints during delivery
    notes: { type: String }, // Additional notes or instructions for the delivery
    deliveryCharges: { type: Number, min: 0 }, // Delivery charges specific to this delivery
    deliveryLocation: {
      latitude: { type: Number },
      longitude: { type: Number },

    }, // Geo-location details of the delivery
  },
  { timestamps: true }
);

const Delivery = mongoose.model("Delivery", DeliveriesSchema);

export default Delivery;
