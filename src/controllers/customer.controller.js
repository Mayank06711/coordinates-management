import asyncHandler from "../utils/asysnHandler.js";
import Customer from "../model/customer.Model.js";
import apiError from "../utils/apiError.js";
const createCustomer = asyncHandler(async (req, res) => {
    const { email, gender, fullName, address, username } = req.body;
    
    // Check if all fields are provided
    if (![email, gender, fullName, address, username].every(Boolean)) {
      throw new apiError(400, "All fields are required");
    }
    
    // Check if the email already exists
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      throw new apiError(400, "Email already exists"); // Corrected the parameter order
    }
    
    // Create a new customer
    const newCustomer = await Customer.create({
      email,
      gender,
      fullName,
      address,
      username,
    });
    
    res.status(201).json({
      success: true,
      data: {
        username: newCustomer.username,
        gender: newCustomer.gender,
        fullName: newCustomer.fullName,
        address: {
          country: newCustomer.address.country,
          pinCode: newCustomer.address.pinCode,
          state: newCustomer.address.state,
          city: newCustomer.address.city,
        },
      },
    });
});
  

export { createCustomer };
