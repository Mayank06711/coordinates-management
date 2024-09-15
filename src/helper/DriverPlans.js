import Hub from "../model/hub.Model.js";
import Order from "../model/order.Model.js";
import Driver from "../model/driver.Model.js";
import Delivery from "../model/delivery.Model.js";
import * as geolib from 'geolib' // import whole library
const getDriverAssignments = async (hubId, dist) => {
  try {
    // hub details
    const hub = await Hub.findById(hubId);
    if (!hub) throw new Error("Hub not found");

    // active drivers
    const activeDrivers = await Driver.find({ isActive: true, hub: hubId });

    if (activeDrivers.length === 0)
      throw new Error("No active drivers available");

    // Find orders in the vicinity of 20 km from the hub
    const orders = await Order.find({ // This method returns an array of documents (even if the array contains just one document or no documents at all). If no documents are found, it returns an empty array.
      hub: hubId,
      delivered: false,
      currentStatus: "pending",
    }).populate(
      "customerId",
      "address.coordinates.latitude address.coordinates.longitude address.streetAddress address.pinCode address.landmark address.city address.state"
    ); //  return array of orders, with all the details populated in customerId

    if (!orders || orders.length === 0) {
      throw new Error("No pending orders available");
    }

    const customerAddressArray = orders.map((order) => {
      const address = order.customerId?.address || {};
      return {
        latitude: address.coordinates?.latitude || null,
        longitude: address.coordinates?.longitude || null,
        // streetAddress: address.streetAddress || "",
        // pinCode: address.pinCode || "",
        // landmark: address.landmark || "",
        // city: address.city || "",
        // state: address.state || "",
      };
    });
    
    const sortedArrayFromHub =  geolib.orderByDistance({ latitude: hub.location.coordinates[0], longitude: hub.location.coordinates[1] }, customerAddressArray)// array of points ordered by their distance to the reference point hub
    const customerIds = orders.map((order) => order.customerId._id); // return an array of mongoose customer _id
    console.log(customerIds, customerAddressArray);
    console.log(orders.customerId);
    console.log(hub);




    // Filter orders based on 20 km radius from the hub location
    const ordersInVicinity = customerAddressArray.filter((order) => {
      const orderLocation = [
        order.deliveryLocation.latitude,
        order.deliveryLocation.longitude,
      ];
      const hubLocation = [
        hub.location.coordinates[1],
        hub.location.coordinates[0],
      ]; // [latitude, longitude]

      // Calculate distance (using Haversine formula or a similar approach)
      const distance = calculateDistance(orderLocation, hubLocation);
      return distance <= dist; // within 20 km
    });






    // Sort orders by proximity to the hub
    ordersInVicinity.sort((a, b) => {
      const distanceA = calculateDistance(
        [a.deliveryLocation.latitude, a.deliveryLocation.longitude],
        hub.location.coordinates
      );
      const distanceB = calculateDistance(
        [b.deliveryLocation.latitude, b.deliveryLocation.longitude],
        hub.location.coordinates
      );
      return distanceA - distanceB;
    });

    // Assign orders to the active driver
    for (let order of ordersInVicinity) {
      for (let driver of activeDrivers) {
        if (driver.isActive) {
          // Check if the driver is currently doing another delivery
          continue;
        }

        // Create a new delivery entry
        const delivery = new Delivery({
          orderId: order._id,
          deliveryPartner: driver._id,
          status: "picked_up",
          hub: hubId,
          deliveryLocation: {
            latitude: driver.currentLocation.latitude,
            longitude: driver.currentLocation.longitude,
          },
          pickupTime: new Date(),
        });

        await delivery.save();

        // Update driver status
        driver.currentDoing = delivery._id;
        driver.deliveryCount += 1;
        await driver.save();

        // Update order status
        order.currentStatus = "in_transit";
        order.colletedBy = driver._id;
        await order.save();

        break; // Exit loop after assigning to a driver
      }
    }

    return {
      success: true,
      message: "Orders assigned to drivers successfully",
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: error.message };
  }
};

// calculate distance between two points (latitude, longitude)
const calculateDistance = (loc1, loc2) => {
  const [lat1, lon1] = loc1;
  const [lat2, lon2] = loc2;

  // Use Haversine formula to calculate distance between two points in km
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default getDriverAssignments;
