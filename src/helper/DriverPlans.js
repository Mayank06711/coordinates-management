import Hub from "../model/hub.Model.js";
import Order from "../model/order.Model.js";
import Driver from "../model/driver.Model.js";
import Delivery from "../model/delivery.Model.js";
import User from "../model/user.Model.js";
import * as geolib from "geolib"; // import whole library
import DelUser from "../model/delUser.model.js";

const getDriverAssignments = async (hubId, dist = 5) => {
  try {
    // hub details
    const hub = await Hub.findById(hubId);
    if (!hub) throw new Error("Hub not found");

    // Find orders in the vicinity of 20 km from the hub
    const orders = await Order.find({
      // This method returns an array of documents (even if the array contains just one document or no documents at all). If no documents are found, it returns an empty array.
      hub: hubId,
      delivered: false,
      currentStatus: "pending",
    }).populate(
      "buyerId",
      "address.coordinates.latitude address.coordinates.longitude address.streetAddress address.pinCode address.landmark address.city address.state"
    ); //  return array of orders, with all the details populated in buyerId

    if (!orders || orders.length === 0) {
      throw new Error("No pending orders available");
    }

    // active drivers
    const activeDrivers = await DelUser.find({
      activeStatus: "online",
      hub: hubId,
      isVerified: true,
    });

    if (activeDrivers.length === 0)
      throw new Error("No active drivers available");

    const areaWiseArrayOfObjectOfDriver = CategorizeAndSortedDriversAreaWise(
      hub,
      activeDrivers,
      "north",
      dist
    );

    console.log(areaWiseArrayOfObjectOfDriver);
 
    // orders 
    const areaWiseArrayOfObjectOfOrder = filterAndCategorizeOrdersAreaWise(
      orders,
      hub,
      dist
    );
    console.log(areaWiseArrayObject);
    // Assign orders to drivers based on their bag capacity and proximity
    const assignments = assignOrdersToDriversAccToBagCap(
      areaWiseArrayOfObjectOfOrder,
      areaWiseArrayOfObjectOfDriver
    );

    console.log("assignments:", assignments);
    return {
      success: true,
      message: "Orders assigned to drivers successfully",
      assignments,
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: error.message };
  }
};

// calculate distance between two points (latitude, longitude)
const calculateDistanceInMeter = (start, end) => {
  const distance = geolib.getPreciseDistance(
    { latitude: start.latitude, longitude: start.longitude },
    { latitude: end.latitude, longitude: end.longitude },
    (accuracy = 1)
  ); // accuracy is 1meter
  return distance;
};




// Order Funtion
const filterAndCategorizeOrdersAreaWise = (orders, hub, dist = 5) => {
  const hubLocation = {
    latitude: hub.location.coordinates[0],
    longitude: hub.location.coordinates[1],
  };

  // Categorize customer coordinates into East, West, North, South based on compass direction
  const categorizedOrders = {
    east: [],
    west: [],
    north: [],
    south: [],
  };

  orders.forEach((order) => {
    // Check if order has buyer coordinates
    if (
      !order.buyerId ||
      !order.buyerId.address.coordinates.latitude ||
      !order.buyerId.address.coordinates.longitude
    )
      return;

    const customerLocation = {
      latitude: order.buyerId.address.coordinates.latitude,
      longitude: order.buyerId.address.coordinates.longitude,
    };

    // getGreatCircleBearing for more accurate bearing
    const compassDirection = geolib.getCompassDirection(
      hubLocation,
      customerLocation,
      geolib.getGreatCircleBearing // getGreatCircleBearing instead of the default RhumbLine
    );

    // Categorize based on compass direction
    if (["N", "NNE", "NE", "NNW"].includes(compassDirection)) {
      categorizedOrders.north.push(order); // North
    } else if (["E", "ENE", "ESE"].includes(compassDirection)) {
      categorizedOrders.east.push(order); // East
    } else if (["S", "SSE", "SSW", "SE", "SW"].includes(compassDirection)) {
      categorizedOrders.south.push(order); // South
    } else if (["W", "WNW", "WSW"].includes(compassDirection)) {
      categorizedOrders.west.push(order); // West
    }
  });

  // Sort each direction's orders by distance
  const sortedEast = sortByDistanceFromHub(hubLocation, categorizedOrders.east, dist);
  const sortedWest = sortByDistanceFromHub(hubLocation, categorizedOrders.west, dist);
  const sortedNorth = sortByDistanceFromHub(hubLocation, categorizedOrders.north, dist);
  const sortedSouth = sortByDistanceFromHub(hubLocation, categorizedOrders.south, dist);

  // Return the categorized and sorted orders
  return {
    east: sortedEast,
    west: sortedWest,
    north: sortedNorth,
    south: sortedSouth,
  };
};

const sortByDistanceFromHub = (hubLocation, ordersArray, maxDistanceKm) => {
  //  sort the orders by buyer's distance from the hub
  const sortedOrders = geolib.orderByDistance(
    { latitude: hubLocation.latitude, longitude: hubLocation.longitude },
    ordersArray.map(order => ({
      latitude: order.buyerId.address.coordinates.latitude,
      longitude: order.buyerId.address.coordinates.longitude,
      orderData: order, // Preserve the original order data
    }))
  );

  //  Filter the orders within the specified distance (if maxDistanceKm is provided)
  const filteredAndSortedOrders = sortedOrders.filter((location) => {
    const distance = calculateDistanceInMeter(
      { latitude: hubLocation.latitude, longitude: hubLocation.longitude },
      { latitude: location.latitude, longitude: location.longitude }
    );
    return distance / 1000 <= maxDistanceKm; // Filter by distance in kilometers
  }).map(location => location.orderData); // Map back to the original order data

  // Return the sorted and filtered array of orders as it was
  return filteredAndSortedOrders;
};


// Driver function
const sortByDistanceFromOriginDirectlyPreservingDriverDataAsItWasBefore = (origin, driversArray, dist) => {
  // sort the drivers by distance from the origin keeping original array as it was
  const sortedArray = geolib.orderByDistance(
    { latitude: origin.latitude, longitude: origin.longitude },
    driversArray.map(driver => ({
      latitude: driver.address.coordinates.latitude,
      longitude: driver.address.coordinates.longitude,
      driverData: driver, // Preserve the original driver data
    }))
  );

  // Filter the drivers based on the specified distance
  const filteredAndSortedArray = sortedArray.filter((location) => {
    const distance = calculateDistanceInMeter(
      origin,
      { latitude: location.latitude, longitude: location.longitude }
    );
    return distance / 1000 <= dist; // Check if the driver is within the specified distance in kilometers
  }).map(location => location.driverData); // Map back to original driver data

  // Return the sorted and filtered array of drivers which sorted based on dist from origin and has same structure as beore
  return filteredAndSortedArray;
};


const CategorizeAndSortedDriversAreaWise = (
  hub,
  activeDriversArray,
  defaultArea = "north",
  dist = 5
) => {
  const orginLocationCoords = {
    latitude: hub.location.coordinates[0],
    longitude: hub.location.coordinates[1],
  };
  
  const categorizedDrivers = {
    east: [],
    west: [],
    north: [],
    south: [],
  };

  activeDriversArray.forEach((driver) => {
    const direction = driver.address.coordinates.bearing || defaultArea; // north if no bearing
    categorizedDrivers[direction].push(driver); // this syntax of object is used because we do not know direction in advance it is dyanamic
  });

  // Sort each direction's drivers by distance
  const sortedEast = sortByDistanceFromOriginDirectlyPreservingDriverDataAsItWasBefore(
    orginLocationCoords,
    categorizedDrivers.east,
    dist
  );

  const sortedWest = sortByDistanceFromOriginDirectlyPreservingDriverDataAsItWasBefore(
    orginLocationCoords,
    categorizedDrivers.west,
    dist
  );

  const sortedNorth = sortByDistanceFromOriginDirectlyPreservingDriverDataAsItWasBefore(
    orginLocationCoords,
    categorizedDrivers.north,
    dist
  );

  const sortedSouth = sortByDistanceFromOriginDirectlyPreservingDriverDataAsItWasBefore(
    orginLocationCoords,
    categorizedDrivers.south,
    dist
  );
  
  return {
    east: sortedEast,
    west: sortedWest,
    north: sortedNorth,
    south: sortedSouth,
  };
};


// assignment acc   to bag cap  
const assignOrdersToDriversAccToBagCap = (categorizedOrders, categorizedDrivers) => {
  const assignments = [];

  // Iterate through each area (north, east, west, south)
  ["north", "east", "west", "south"].forEach((area) => {
    const ordersInArea = categorizedOrders[area];
    const driversInArea = categorizedDrivers[area];

    if (ordersInArea.length === 0 || driversInArea.length === 0) return;

    // Assign orders to each driver based on their bag capacity
    driversInArea.forEach((driver) => {
      let currentBagVolume = 0;
      let driverOrders = [];

      // Iterate through the sorted orders in this area
      for (let i = 0; i < ordersInArea.length; i++) {
        const order = ordersInArea[i];

        if (currentBagVolume + order.volume <= driver.bagCap) {
          driverOrders.push(order);
          currentBagVolume += order.volume;

          // Remove assigned order from the orders array
          ordersInArea.splice(i, 1);
          i--; // Adjust index after removing order
        }
      }

      // Record driver assignments if they have orders
      if (driverOrders.length > 0) {
        assignments.push({
          driver: driver._id,
          orders: driverOrders.map((order) => order._id),
        });
      }
    });
  });

  return assignments;
};

const optimiseCost = async (base, arr2d) => {};

export default getDriverAssignments;
