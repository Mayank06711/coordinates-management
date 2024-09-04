import Hub from "../models/Hub.js"; // Adjust the path as necessary


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
    res.status(500).json({ message: "Error creating hub", error: error.message });
  }
};


export const approveHub = async (req, res) => {
  try {
    const { hubId } = req.params;
    if (req.user.role != "fouder") {
        throw new  apiError(400 , "you cannot approve");
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
    res.status(500).json({ message: "Error approving hub", error: error.message });
  }
};
