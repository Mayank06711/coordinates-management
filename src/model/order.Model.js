import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;

const OrderSchema = new mongoose.Schema(
  {
    customerId: { type: ObjectId, ref: "Customer" },
    delivered: { type: Boolean, default: false },
    quantity: { type: Number, min: 1 },
    total: { type: Number, min: 0 },
    customerName: { type: String , required: true },
    orderDetails: [
      {
        product: { type: ObjectId, ref: "Product" },
        qty: { type: Number },
        sellerId: { type: ObjectId, ref: "Seller" },
        price: { type: Number, default: 0 },
        status: { type: String, default: "pending" },
      }],
    colletedBy: { type: ObjectId, ref: "Driver" },  
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
    deliveryCharges: { type: Number, min: 0 },
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
    discountAmount: { type: Number, min: 0 },
    finalPrice: { type: Number, min: 0 },
    paymentId: { type: String },
    topicId: { type: String },
    timing: { type: String },
    hub: { type: ObjectId, ref: "Hub" }, 
    finishedDeliveries: [{ type: ObjectId, ref: "Delivery" }],
    orderNo: { type: Number, default: 0 },
  },
  { timestamps: true }
);

OrderSchema.index({customerName:1, orderDetails: 1, hub:1})

const Order = mongoose.model('Order', OrderSchema);

export default Order;