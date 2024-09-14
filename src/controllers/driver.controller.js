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

export { createDriver, approveDriver };
