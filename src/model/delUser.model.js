import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;

const delUser = new mongoose.Schema({
  phone: { type: Number, unique: true, required: true },
  userName: { type: String },
  fullName: { type: String },
  adharNumber: { type: Number },
  accStatus: { type: String, default: "review" },
  attachedId: { type: Number },
  licenseNumber: { type: String },
  email: { type: String },
  isVerified: { type: Boolean, default: false },
  address: {
    streetAddress: { type: String },
    state: { type: String },
    city: { type: String },
    landmark: { type: String },
    pinCode: { type: Number },
    country: { type: String },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number },
      altitude: { type: Number },
      provider: { type: String },
      accuracy: { type: Number },
      speed: { type: Number },
      bearing: { type: String, required: true }, // like east west north south
    },
  },
  referralId: { type: String },
  accountType: { type: String },
  vehicleType: { type: String },
  photos: [
    {
      content: { type: String },
      type: { type: String },
      size: { type: String },
      awsKey: { type: String },
    },
  ],
  activeStatus: { type: String, default: "online" },
  activity: [
    {
      time: { type: String, default: Date.now().toString() },
      type: { type: String },
      deviceInfo: { type: [Array] },
      location: { type: [Array] },
    },
  ],
  notificationToken: { type: String },
  earnings: [
    {
      timing: { type: String, default: Date.now().toString() },
      amount: { type: String },
      mode: { type: String },
      type: ObjectId,
      ref: "Earnings",
    },
  ],
  currentOtp: {
    otp: { type: Number },
    timing: { type: Number, default: Date.now().toString() },
  },
  bagCap: { type: Number, default: 30 },
  deliveries: [{ type: ObjectId, ref: "DeliveriesSchema" }],
  finishedDeliveries: [{ type: ObjectId, ref: "DeliveriesSchema" }], //completed deliveries
  achievements: [
    {
      time: { type: String, default: Date.now().toString() },
      achievement: { type: String },
      type: ObjectId,
      ref: "Achievements",
    },
  ],
  deliveryPartners: [
    {
      time: { type: String, default: Date.now().toString() },
      id: { type: ObjectId, ref: "User" },
    },
  ],
  pickup: [{ type: ObjectId, ref: "DeliveriesSchema" }],
  earnings: [
    {
      timing: { type: String, default: Date.now().toString() },
      amount: { type: Number },
      mode: { type: String },
      id: { type: ObjectId, ref: "Earnings" },
    },
  ],
  totalEarnings: { type: Number, default: 0 },
  deliveryCount: { type: Number, default: 0 },
  primaryLoc: { type: String },
  bank: {
    accNo: { type: String },
    ifscCode: { type: String },
    name: { type: String },
  },
  reports: [
    {
      text: { type: String },
      timing: { type: Number },
      status: { type: String, default: "pending" },
      id: { type: String },
    },
  ],
  balance: [
    {
      amount: { type: Number },
      time: { type: Number },
      delId: { type: ObjectId, ref: "Delivery" },
      mode: { type: String, default: "Cash" },
    },
  ],
  totalBalance: { type: Number, default: 0 },
  successfulAchievements: [
    {
      time: { type: String, default: Date.now().toString() },
      achievement: { type: String },
      type: ObjectId,
      ref: "Achievements",
    },
  ],
  hub: { type: ObjectId, ref: "Hub" },
  currentDoing: { type: ObjectId, ref: "DeliveriesSchema" }, //is user currently doing any delivery
});


// creating a compound index
delUser.index({ phone: 1, userName: 1, email: 1 }); // 1 for ascending order making compaund index for fast queries
// left field will use indexing if used only but if userName or email is only used for searching it might not use compound indexing in moongoose, so query should follow order, in which fields are passsed in same order as in case of making them index

const DelUser = mongoose.model("DelUser", delUser);

export default DelUser;
