import { faker } from "@faker-js/faker";
import DelUser from "../model/delUser.model.js";
import Order from "../model/order.Model.js";
import User from "../model/user.Model.js";
import Hub from "../model/hub.Model.js";
import Delivery from "../model/delivery.Model.js";

const createFakeDelUsers = async (n) => {
  const fakeDelUsers = [];

  for (let i = 0; i < n; i++) {
    const fakeDelUser = new DelUser({
      phone: faker.phone.number("##########"),
      userName: faker.internet.userName(),
      fullName: faker.person.fullName(),
      adharNumber: faker.random.numeric(12),
      accStatus: faker.helpers.randomize(["review", "approved", "rejected"]),
      attachedId: faker.random.numeric(10),
      licenseNumber: faker.random.alphaNumeric(10),
      email: faker.internet.email(),
      isVerified: faker.datatype.boolean(),
      address: {
        streetAddress: faker.location.streetAddress(),
        state: faker.location.state(),
        city: faker.location.city(),
        landmark: faker.location.secondaryAddress(),
        pinCode: faker.location.zipCode(),
        country: faker.location.country(),
        coordinates: {
          latitude: faker.location.latitude(),
          longitude: faker.location.longitude(),
          altitude: faker.datatype.number(),
          provider: faker.company.name(),
          accuracy: faker.datatype.number(),
          speed: faker.datatype.number(),
          bearing: faker.helpers.randomize(["north", "south", "east", "west"]),
        },
      },
      referralId: faker.random.alphaNumeric(10),
      accountType: faker.helpers.randomize(["personal", "business"]),
      vehicleType: faker.helpers.randomize(["bike", "car", "truck"]),
      photos: [
        {
          content: faker.image.avatar(),
          type: faker.system.mimeType(),
          size: faker.datatype.number(),
          awsKey: faker.random.alphaNumeric(20),
        },
      ],
      activeStatus: faker.helpers.randomize(["online", "offline"]),
      notificationToken: faker.random.alphaNumeric(20),
      totalEarnings: faker.datatype.number({ min: 0, max: 10000 }),
      deliveryCount: faker.datatype.number({ min: 0, max: 100 }),
      primaryLoc: faker.location.city(),
      bank: {
        accNo: faker.finance.account(),
        ifscCode: faker.finance.iban(),
        name: faker.finance.accountName(),
      },
    });

    fakeDelUsers.push(fakeDelUser);
  }

  await DelUser.insertMany(fakeDelUsers);
  console.log(`${n} DelUser entries created.`);
};

const createFakeOrders = async (n, buyers, sellers, hubId) => {
  const fakeOrders = [];

  for (let i = 0; i < n; i++) {
    const fakeOrder = new Order({
      buyerId: faker.helpers.randomize(buyers), // Random buyer from users
      productId: [faker.datatype.uuid()], // Placeholder for product IDs
      sellerId: faker.helpers.arrayElements(
        sellers,
        faker.datatype.number({ min: 1, max: 3 })
      ), // Random seller from users
      delivered: faker.datatype.boolean(),
      quantity: faker.datatype.number({ min: 1, max: 10 }),
      volume: faker.datatype.float({ min: 0.1, max: 100 }),
      total: faker.datatype.number({ min: 100, max: 1000 }),
      customername: faker.person.fullName(),
      orderdetails: [
        {
          product: faker.commerce.productName(), // Random product name
          qty: faker.datatype.number({ min: 1, max: 5 }),
          seller: faker.helpers.randomize(sellers),
          price: faker.datatype.number({ min: 100, max: 500 }),
        },
      ],
      currentStatus: faker.helpers.randomize([
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "completed",
      ]),
      orderId: faker.datatype.uuid(),
      onlineorderid: faker.datatype.uuid(),
      deliverycharges: faker.datatype.number({ min: 0, max: 100 }),
      taxes: faker.datatype.number({ min: 0, max: 50 }),
      paymentMode: faker.helpers.randomize(["Cash", "UPI", "Card"]),
      routes: {
        A: faker.location.streetName(),
        B: faker.location.streetName(),
        C: faker.location.streetName(),
        D: faker.location.streetName(),
      },
      discountamount: faker.datatype.number({ min: 0, max: 50 }),
      finalprice: faker.datatype.number({ min: 100, max: 2000 }),
      paymentId: faker.datatype.uuid(),
      topicId: faker.datatype.uuid(),
      timing: faker.date.recent().toISOString(),
      hub: hubId, // Hub where the order is managed
    });

    fakeOrders.push(fakeOrder);
  }

  await Order.insertMany(fakeOrders);
  console.log(`${n} Order entries created.`);
};

const createFakeUsers = async (n) => {
  const buyers = [];
  const sellers = [];

  for (let i = 0; i < n; i++) {
    // Randomly determine if the user is a buyer or seller
    const isSeller = faker.datatype.number({ min: 1, max: 10 }) <= 3; // 30% chance to be a seller

    const fakeUser = {
      email: faker.internet.email(),
      gender: faker.helpers.randomize(["male", "female"]),
      fullname: faker.person.fullName(),
      username: faker.internet.userName(),
      isStoreVerified: faker.datatype.boolean(),
      useDefaultProsite: faker.datatype.boolean(),
      deliverypartners: [],
      membershipHistory: [
        {
          id: faker.datatype.uuid(),
          date: faker.date.past(),
        },
      ],
    };

    // If the user is a seller
    if (isSeller) {
      fakeUser.storeAddress = [
        {
          buildingno: faker.location.buildingNumber(),
          city: faker.location.city(),
          state: faker.location.state(),
          postal: faker.location.zipCode("######"),
          landmark: faker.location.secondaryAddress(),
          gst: faker.random.alphaNumeric(15),
          businesscategory: faker.company.bsNoun(),
          documenttype: faker.helpers.randomize(["ID", "License", "Passport"]),
          documentfile: faker.image.imageUrl(),
          coordinates: {
            latitude: faker.location.latitude(),
            longitude: faker.location.longitude(),
            altitude: faker.datatype.float(),
            provider: faker.company.name(),
            accuracy: faker.datatype.number(),
            bearing: faker.datatype.number(),
          },
        },
      ];
      fakeUser.isStoreVerified = faker.datatype.boolean();
      sellers.push(fakeUser);
    } else {
      // If the user is a buyer
      fakeUser.puchase_history = [];
      (fakeUser.puchase_products = []),
        (fakeUser.cart = []),
        (fakeUser.orders = []),
        (fakeUser.address = {
          streetAddress: faker.location.streetAddress(),
          state: faker.location.state(),
          city: faker.location.city(),
          landmark: faker.location.secondaryAddress(),
          pinCode: faker.datatype.number({ min: 100000, max: 999999 }),
          country: faker.location.country(),
          coordinates: {
            latitude: faker.location.latitude(),
            longitude: faker.location.longitude(),
            altitude: faker.datatype.float(),
            provider: faker.company.name(),
            accuracy: faker.datatype.number(),
            bearing: faker.datatype.number(),
          },
        });
      buyers.push(fakeUser);
    }
  }

  // Save users to the database
  await User.insertMany([...buyers, ...sellers]);
  console.log(`${buyers.length} buyers and ${sellers.length} sellers created.`);
};

const createFakeHubs = async (n, driversArray, ordersArray) => {
  const fakeHubs = [];

  for (let i = 0; i < n; i++) {
    const fakeHub = new Hub({
      hubAdmin: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phoneNumber: faker.phone.number("##########"),
        password: faker.internet.password(),
        adminAvatar: {
          public_Id: faker.random.alphaNumeric(12),
          url: faker.image.avatar(),
        },
      },
      location: {
        city: faker.location.city(),
        state: faker.location.state(),
        country: faker.location.country(),
        coordinates: [faker.location.latitude(), faker.location.longitude()],
      },
      address: {
        street: faker.location.streetAddress(),
        pinCode: faker.location.zipCode("######"),
      },
      capacity: faker.datatype.number({ min: 50, max: 500 }),
      drivers: faker.helpers.arrayElements(
        driversArray,
        faker.datatype.number({ min: 1, max: 10 })
      ),
      orders: faker.helpers.arrayElements(
        ordersArray,
        faker.datatype.number({ min: 1, max: 20 })
      ),
      status: faker.helpers.randomize(["pending", "active", "inactive"]),
    });

    fakeHubs.push(fakeHub);
  }

  await Hub.insertMany(fakeHubs);
  console.log(`${n} Hub entries created.`);
};

const createFakeDeliveries = async (
  n,
  orderIdsArray,
  driverIdsArray,
  hubIdsArray
) => {
  const fakeDeliveries = [];

  for (let i = 0; i < n; i++) {
    const fakeDelivery = new Delivery({
      orderId: faker.helpers.randomize(orderIdsArray),
      deliveryPartner: faker.helpers.randomize(driverIdsArray),
      status: faker.helpers.randomize([
        "pending",
        "picked_up",
        "in_transit",
        "delivered",
        "failed",
        "returned",
      ]),
      pickupTime: faker.date.past(),
      deliveryTime: faker.date.future(),
      hub: faker.helpers.randomize(hubIdsArray),
      routes: {
        A: faker.location.streetName(),
        B: faker.location.streetName(),
        C: faker.location.streetName(),
        D: faker.location.streetName(),
      },
      notes: faker.lorem.sentence(),
      deliveryCharges: faker.datatype.number({ min: 0, max: 500 }),
      deliveryLocation: {
        latitude: faker.location.latitude(),
        longitude: faker.location.longitude(),
        altitude: faker.datatype.float(),
        provider: faker.company.name(),
        accuracy: faker.datatype.number(),
        bearing: faker.datatype.number(),
      },
      deliveryPhoto: {
        publicId: faker.random.alphaNumeric(12),
        url: faker.image.imageUrl(),
      },
    });

    fakeDeliveries.push(fakeDelivery);
  }

  await Delivery.insertMany(fakeDeliveries);
  console.log(`${n} Delivery entries created.`);
};
createFakeDelUsers(50);