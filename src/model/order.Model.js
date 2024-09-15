import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;

const OrderSchema = new mongoose.Schema(
  {
    buyerId: { type: ObjectId, ref: "User" },
    productId: [{ type: ObjectId, ref: "Product" }],
    sellerId: [{ type: ObjectId, ref: "User" }],
    delivered: { type: Boolean, default: false },
    quantity: { type: Number, min: 1 },
    total: { type: Number, min: 0 },
    customername: { type: String },
    orderdetails: [
      {
        product: { type: ObjectId, ref: "Product" },
        qty: { type: Number },
        seller: { type: ObjectId, ref: "User" },
        price: { type: Number, default: 0 },
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
    orderId: { type: String, unique: true },
    onlineorderid: { type: String },
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
    },
    discountamount: { type: Number, min: 0 },
    finalprice: { type: Number, min: 0 },
    paymentId: { type: String },
    topicId: { type: String },
    timing: { type: String },
    hub: { type: ObjectId, ref:"Hub" },
    finisheddeliveries: [{ type: ObjectId, ref: "DeliveriesSchema" }],
    orderno: { type: Number, default: 0 },
  },
  { timestamps: true }
);

OrderSchema.index({ customername: 1, orderdetails: 1, hub: 1 });

const Order = mongoose.model("Order", OrderSchema);

export default Order;
