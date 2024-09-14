import Hub from "../model/hub.Model.js";
import Driver from "../models/Driver.js"; // Adjust the path as necessary
import apiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
// Function to create a driver
const createDriver = asyncHandler(async (req, res) => {
  const driverData = req.body;

  // Ensure the driver is inactive by default until approved
  driverData.isActive = false;

  const newDriver = new Driver(driverData);
  await newDriver.save();

  const driver = await Driver.findById(newDriver._id);
  if (!driver) {
    throw new apiError(
      500,
      "Something went wrong while creating saving driver data"
    );
  }
  res.status(201).json({
    message: "Driver created successfully, awaiting hub admin approval.",
    driver: newDriver,
  });
});

// Function to approve a driver by the hub admin
const approveDriver = asyncHandler(async (req, res) => {
  if (req.user.role != "admin") {
    throw new apiError(400, { msg: "you cannot approve driver" });
  }
  const { driverId } = req.params;

  const updatedHub = Hub.findByIdAndUpdate(req.hubId, {
    drivers: { $push: { _id: driverId, isActive: true } },
  });

  // Find the driver by ID and update the isActive field to true (approved)
  const updatedDriver = await Driver.findByIdAndUpdate(
    driverId,
    { isActive: true },
    { new: true }
  );

  if (!updatedDriver) {
    throw new apiError(500, "Couldn't approve driver, Something went wrong ");
  }

  res.status(200).json({
    message: "Driver approved successfully and is now active.",
    driver: updatedDriver,
  });
});

// Function to get all drivers in a hub

<<<<<<< HEAD
export { createDriver, approveDriver };
=======
    res.status(200).json({
      message: "Driver approved successfully and is now active.",
      driver: updatedDriver,
    });
  } catch (error) {
throw new Error(error.message) 
     }
};



export const getDriverOrders = async (req, res) => {
  try {
    const { driverId } = req.params; // Get the driverId from the URL

    // Find the driver by their ID and populate the orders array
    const driver = await Driver.findById(driverId)
      .populate({
        path: 'orders',
        populate: {
          path: 'orderDetails.product', // Populate product details in each order
          select: 'name price'
        }
      })
      .populate('hub', 'name location'); // Populate the hub the driver is assigned to

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    res.status(200).json({
      message: `Orders for driver ${driver.fullName} retrieved successfully`,
      driver: {
        name: driver.fullName,
        hub: driver.hub,
        orders: driver.orders,
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error retrieving driver orders',
      error: error.message
    });
  }
};



export { createDriver , approveDriver};
>>>>>>> a425018b5204f72666fffc3efe1e9449b465e7e3
