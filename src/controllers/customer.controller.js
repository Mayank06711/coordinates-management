import asyncHandler from "../utils/asysnHandler.js";
import Customer from "../model/customer.Model.js";
import apiError from "../utils/apiError.js";

// POST /api/v1/customer
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

// GET /api/v1/customers
const getCustomers = asyncHandler(async (req, res) => {
    const customers = await Customer.find({});
    
    if (!customers.length) {
      throw new apiError(404, "No customers found");
    }

    res.status(200).json({
      success: true,
      count: customers.length,
      data: customers.map((customer) => ({
        username: customer.username,
        gender: customer.gender,
        fullName: customer.fullName,
        address: {
          country: customer.address.country,
          pinCode: customer.address.pinCode,
          state: customer.address.state,
          city: customer.address.city,
        },
      })),
    });
});

// GET /api/v1/customers/:id
const getCustomerById = asyncHandler(async (req, res) => {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      throw new apiError(404, "Customer not found");
    }
    
    res.status(200).json({
      success: true,
      data: {
        username: customer.username,
        gender: customer.gender,
        fullName: customer.fullName,
        address: {
          country: customer.address.country,
          pinCode: customer.address.pinCode,
          state: customer.address.state,
          city: customer.address.city,
        },
      },
    });
});

export { createCustomer, getCustomerById, getCustomers };
