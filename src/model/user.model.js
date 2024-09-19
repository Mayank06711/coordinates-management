const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      trim: true,
      maxLength: 50,
    },
    gender: {
      type: String,
    },
    fullname: {
      type: String,
      maxLength: 30,
    },
    puchase_history: [{ type: ObjectId, ref: "Order" }],
    puchase_products: [{ type: ObjectId, ref: "Product" }],
    cart: [{ type: ObjectId, ref: "Cart" }],
    orders: [
      {
        type: ObjectId,
        ref: "Order",
        status: { type: String },
        timestamp: new Date(),
      },
    ],
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
        bearing: { type: Number },
      },
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
        id: { type: ObjectId, ref: "User" },
      },
    ],
    useDefaultProsite: { type: Boolean, default: false },
    membershipHistory: [
      {
        id: { type: ObjectId, ref: "Membership" },
        date: { type: Date, default: Date.now },
      },
    ],
    // for workspace membership
  },

  { timestamps: false }
);
userSchema.methods.addOrder = async function (orderId, status) {
  this.orders.push({
    _id: orderId,
    status: status,
    timestamp: new Date(),
  });
  await this.save();
};

const User = mongoose.model("User", userSchema);

export default User;
