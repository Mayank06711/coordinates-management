import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;

const OrderSchema = new mongoose.Schema(
  {
    customerId: { type: ObjectId, ref: "Customer" },
    delivered: { type: Boolean, default: false },
    quantity: { type: Number, min: 1 },
    total: { type: Number, min: 0 },
    customername: { type: String },
    orderDetails: [
      {
        product: { type: ObjectId, ref: "Product" },
        qty: { type: Number },
        sellerId: { type: ObjectId, ref: "Seller" },
        price: { type: Number, default: 0 }
      },
    ],
    currentStatus: {
      type: String,
      enum: [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "completed",
        "failed",
        "returned",
        "damaged",
        "success",
      ],
      default: "pending",
    },
    deliverycharges: { type: Number, min: 0 },
    taxes: { type: Number, min: 0 },
    paymentMode: {
      type: String,
      enum: ["Cash", "UPI", "Card"],
      default: "Cash",
    },

    routes: {
      A: { type: String },
      B: { type: String },
      C: { type: String },
      D: { type: String },
    },//confusion on whic cities it will take
    discountamount: { type: Number, min: 0 },
    finalprice: { type: Number, min: 0 },
    paymentId: { type: String },
    topicId: { type: String },
    timing: { type: String },
    hub: { type: ObjectId, ref: "Hub" }, // Reference to the hub processing the order
    finisheddeliveries: [{ type: ObjectId, ref: "Delivery" }],
    orderno: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Order = mongoose.model('Order',OrderSchema);

export default Order;