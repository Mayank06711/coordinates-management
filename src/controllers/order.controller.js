import { Order } from "../model/order.Model.js";
import Hub from "../model/hub.Model.js";
import Driver from "../model/driver.Model.js";
const assignCollection = async (req, res) => {
  try {
    // Fetch orders that need to be collected (e.g., 'pending' status)
    const orders = await Order.find({ status: "pending" });

    if (orders.length === 0) {
      return res.status(200).json({ message: "No pending orders for today" });
    }

    // Group orders by city
    const groupedOrdersByCity = {};
    orders.forEach((order) => {
      const city = order.sellerAddress.city;
      if (!groupedOrdersByCity[city]) {
        groupedOrdersByCity[city] = [];
      }
      groupedOrdersByCity[city].push(order);
    });

    // Iterate through each city group
    for (const city in groupedOrdersByCity) {
      const cityOrders = groupedOrdersByCity[city];

      // Find available drivers in the same city, who are not already handling 10 orders
      const availableDrivers = await Driver.find({
        isActive: true,
        city: city,
        orders: { $size: { $lt: 10 } }, // Drivers with fewer than 10 orders
      });

      if (availableDrivers.length === 0) {
        console.log(`No available drivers in ${city} for orders.`);
        continue; // Skip to the next city if no available drivers
      }

      // Sort the orders based on proximity to the driver’s location
      for (let driver of availableDrivers) {
        const driverLocation = driver.location.coordinates;

        // Sort orders by distance from driver’s location
        const sortedOrders = cityOrders.sort((a, b) => {
          const distanceA = getDistance(
            driverLocation,
            a.sellerAddress.coordinates
          );
          const distanceB = getDistance(
            driverLocation,
            b.sellerAddress.coordinates
          );
          return distanceA - distanceB;
        });

        // Assign up to 10 orders to the driver
        const ordersToAssign = sortedOrders.slice(0, 10);

        // Update the orders and driver in the database
        for (let order of ordersToAssign) {
          const hub = await Hub.findById(driver.hub); // Find the hub

          // Assign the order to the driver and update order status
          await Order.findByIdAndUpdate(order._id, {
            driverId: driver._id,
            status: "assigned",
            hubId: hub._id,
          });

          // Update the driver's list of orders
          await Driver.findByIdAndUpdate(driver._id, {
            $push: { orders: order._id },
          });

          console.log(
            `Order ${order._id} assigned to driver ${driver.fullName}`
          );
        }

        // Remove the assigned orders from the cityOrders list
        cityOrders.splice(0, ordersToAssign.length);

        // Stop assigning orders to this driver if they reached the max limit of 10
        if (driver.orders.length >= 10) break;
      }
    }

    res.status(200).json({ message: "Orders have been assigned to drivers" });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error assigning orders to drivers",
        error: error.message,
      });
  }
};

function getDistance(coord1, coord2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Radius of Earth in kilometers

  const dLat = toRad(coord2[0] - coord1[0]);
  const dLon = toRad(coord2[1] - coord1[1]);

  const lat1 = toRad(coord1[0]);
  const lat2 = toRad(coord2[0]);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}

const assignmentOfCollection = async (req, res) => {
  try {
    // Fetch orders that need to be collected (e.g., 'pending' status)
    const orders = await Order.find({ status: "pending" });

    if (orders.length === 0) {
      return res.status(200).json({ message: "No pending orders for today" });
    }

    // Group orders by city
    const ordersByCity = new Map();
    const groupedOrdersByCity = {};
    orders.forEach((order) => {
      const city = order.sellerAddress.city;
      if (!groupedOrdersByCity[city]) {
        groupedOrdersByCity[city] = [];
      }
      groupedOrdersByCity[city].push(order);
    });

    // Iterate through each city group
    for (const city in groupedOrdersByCity) {
      const cityOrders = groupedOrdersByCity[city];

      // Find available drivers in the same city, who are not already handling 10 orders
      const availableDrivers = await Driver.find({
        isActive: true,
        city: city,
        orders: { $size: { $lt: 10 } }, // Drivers with fewer than 10 orders
      });

      if (availableDrivers.length === 0) {
        console.log(`No available drivers in ${city} for orders.`);
        continue; // Skip to the next city if no available drivers
      }

      // Sort the orders based on proximity to the driver’s location
      for (let driver of availableDrivers) {
        const driverLocation = driver.location.coordinates;

        // Sort orders by distance from driver’s location
        const sortedOrders = cityOrders.sort((a, b) => {
          const distanceA = getDistance(
            driverLocation,
            a.sellerAddress.coordinates
          );
          const distanceB = getDistance(
            driverLocation,
            b.sellerAddress.coordinates
          );
          return distanceA - distanceB;
        });

        // Assign up to 10 orders to the driver
        const ordersToAssign = sortedOrders.slice(0, 10);

        // Update the orders and driver in the database
        for (let order of ordersToAssign) {
          const hub = await Hub.findById(driver.hub); // Find the hub

          // Assign the order to the driver and update order status
          await Order.findByIdAndUpdate(order._id, {
            driverId: driver._id,
            status: "assigned",
            hubId: hub._id,
          });

          // Update the driver's list of orders
          await Driver.findByIdAndUpdate(driver._id, {
            $push: { orders: order._id },
          });

          console.log(
            `Order ${order._id} assigned to driver ${driver.fullName}`
          );
        }

        // Remove the assigned orders from the cityOrders list
        cityOrders.splice(0, ordersToAssign.length);

        // Stop assigning orders to this driver if they reached the max limit of 10
        if (driver.orders.length >= 10) break;
      }
    }

    res.status(200).json({ message: "Orders have been assigned to drivers" });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error assigning orders to drivers",
        error: error.message,
      });
  }
};
