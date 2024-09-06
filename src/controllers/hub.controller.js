import Hub from "../models/Hub.js"; // Adjust the path as necessary
import apiError from "../utils/apiError.js";

export const createHub = async (req, res) => {
  try {
    const hubData = req.body;

    hubData.status = "pending";

    const newHub = new Hub(hubData);
    await newHub.save();

    res.status(201).json({
      message: "Hub created successfully, awaiting founder approval.",
      hub: newHub,
    });
  } catch (error) {
    throw new apiError(500, err.message);
  }
};


export const approveHub = async (req, res) => {
  try {
    const { hubId } = req.params;
    if (req.user.role != "fouder") {
      throw new apiError(400, "you cannot approve");
    }
    // Assuming there's a check to ensure the requester is a founder
    const updatedHub = await Hub.findByIdAndUpdate(
      hubId,
      { status: "approved" },
      { new: true }
    );

    if (!updatedHub) {
      return res.status(404).json({ message: "Hub not found" });
    }

    res.status(200).json({
      message: "Hub approved successfully.",
      hub: updatedHub,
    });
  } catch (error) {
    throw new apiError(400, error.message);
  }
};


export const getHubsInRange = async (req, res) => {
  try {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      return res
        .status(400)
        .json({ message: "Latitude and longitude are required" });
    }

    // Convert the distance in kilometers to radians (required for MongoDB $centerSphere)
    const distanceInRadians = 20 / 6378.1; // Earth's radius is approximately 6378.1 km

    // Find hubs within the 20 km radius
    const hubs = await Hub.find({
      "location.coordinates": {
        $geoWithin: {
          $centerSphere: [[longitude, latitude], distanceInRadians],
        },
      },
    });

    if (!hubs) {
      throw new apiError(400, "no hub is 20 km range try for another location");
    }

    res.status(200).json({
      message: `Found ${hubs.length} hubs within 20 km range`,
      hubs,
    });
  } catch (error) {
    throw new apiError(401, error.message);
  }
};
