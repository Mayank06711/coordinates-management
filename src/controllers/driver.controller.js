import Hub from "../model/hub.Model.js";
import Driver from "../models/Driver.js"; // Adjust the path as necessary
import apiError from "../utils/apiError.js";

// Function to create a driver
 const createDriver = async (req, res) => {
  try {
    const driverData = req.body;

    // Ensure the driver is inactive by default until approved
    driverData.isActive = false;

    const newDriver = new Driver(driverData);
    await newDriver.save();

    res.status(201).json({
      message: "Driver created successfully, awaiting hub admin approval.",
      driver: newDriver,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating driver", error: error.message });
  }
};

// Function to approve a driver by the hub admin
 const approveDriver = async (req, res) => {
  try {
    if(req.user.role!="admin"){
        throw new apiError(400 , {msg :"you cannot approve driver" })
    }
    const { driverId } = req.params;



    const updatedHub = Hub.findByIdAndUpdate(req.hubId , {}) 

    // Find the driver by ID and update the isActive field to true (approved)
    const updatedDriver = await Driver.findByIdAndUpdate(
      driverId,
      { isActive: true },
      { new: true }
    );

    if (!updatedDriver) {
      return res.status(404).json({ message: "Driver not found" });
    }

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