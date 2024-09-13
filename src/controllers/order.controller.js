import { Order, Driver, Hub } from 'your-models'; // Ensure you import necessary models

async function assignCollection(req, res) {
  try {
    // Fetch orders that need to be collected (e.g., 'pending' status)
    const orders = await Order.find({ status: 'pending' });

    if (orders.length === 0) {
      return res.status(200).json({ message: 'No pending orders for today' });
    }

    // Group orders by city
    const groupedOrdersByCity = {};
    orders.forEach(order => {
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
        $expr: { $lt: [{ $size: '$orders' }, 10] } // Ensure driver has less than 10 orders
      });

      if (availableDrivers.length === 0) {
        console.log(`No available drivers in ${city} for orders.`);
        continue;  // Skip to the next city if no available drivers
      }

      // Sort the orders based on proximity to the driver’s location
      for (let driver of availableDrivers) {
        const driverLocation = driver.location.coordinates;

        // Sort orders by distance from driver’s location
        const sortedOrders = cityOrders.sort((a, b) => {
          const distanceA = getDistance(driverLocation, a.sellerAddress.coordinates);
          const distanceB = getDistance(driverLocation, b.sellerAddress.coordinates);
          return distanceA - distanceB;
        });

        

        // Assign up to 10 orders to the driver
        const ordersToAssign = sortedOrders.slice(0, Math.min(10 - driver.orders.length, sortedOrders.length));

        // Update the orders and driver in the database
        for (let order of ordersToAssign) {
          const hub = await Hub.findById(driver.hub); 

          // Assign the order to the driver and update order status
          await Order.findByIdAndUpdate(order._id, {
            driverId: driver._id,
            status: 'assigned',
            hubId: hub._id
          });

          // Update the driver's list of orders
          await Driver.findByIdAndUpdate(driver._id, {
            $push: { orders: order._id }
          });

          console.log(`Order ${order._id} assigned to driver ${driver.fullName}`);
        }

        // Remove the assigned orders from the cityOrders list
        cityOrders.splice(0, ordersToAssign.length);

        // Stop assigning orders to this driver if they reached the max limit of 10
        if (driver.orders.length >= 10) break;
      }
    }

    res.status(200).json({ message: 'Orders have been assigned to drivers' });
  } catch (error) {
    res.status(500).json({ message: 'Error assigning orders to drivers', error: error.message });
  }
}

// Function to calculate the distance between two coordinates
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


   

   export const collectOrder = async (req, res) => {
  try {
    const { orderId, driverId } = req.body;

    // Find the order by its ID
    const order = await Order.findById(orderId).populate("orderDetails.sellerId");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if the order is in a status that allows collection
    if (order.currentStatus !== "pending") {
      return res.status(400).json({ message: "Order has already been collected or is not pending" });
    }

    // Iterate over each seller's items in the orderDetails array
    for (let item of order.orderDetails) {
      // Assuming each seller's item needs to be marked as collected
      const seller = item.sellerId; // Get the seller information
      const productId = item.product; // Get the product information

      // Perform collection logic for this seller's item (e.g., update item status or record collection)
      // Here you could add a flag or update each item's status to indicate it was collected
      item.status = "collected"; // Custom field to indicate collection status for each seller's item
    }

    // Update the order status after collecting from all sellers
    order.currentStatus = "processing"; // Mark the order as 'processing' after collection
    order.collectedBy = driverId; // Optionally, store which driver collected the order

    // Save the updated order
    await order.save();

    res.status(200).json({
      message: "Order collected successfully from all sellers",
      order,
    });
  } catch (error) {
    console.error("Error collecting order:", error);
    res.status(500).json({
      message: "Error collecting order",
      error: error.message,
    });
  }
};
    

    async function deliverOrder(req, res) {
        upload(req, res, async (err) => {
          if (err) {
            return res.status(400).json({ message: 'File upload error', error: err.message });
          }
      
          try {
            const { driverId, orderId } = req.body;
            
            // Check if file is uploaded
            if (!req.file) {
              return res.status(400).json({ message: 'Item photo is required' });
            }
      
            // Check if the driver exists and is active
            const driver = await Driver.findById(driverId);
            if (!driver || !driver.isActive) {
              return res.status(400).json({ message: 'Driver not found or inactive' });
            }
      
            // Check if the order exists and is collected
            const order = await Order.findOne({ _id: orderId, driverId, status: 'collected' });
            if (!order) {
              return res.status(400).json({ message: 'Order not found or already delivered' });
            }
      
            // Upload the photo to S3
            const uploadParams = {
              Bucket: process.env.AWS_S3_BUCKET, // Your S3 bucket name
              Key: `order-delivery/${order._id}-${Date.now()}.jpg`, // Unique filename for the image
              Body: req.file.buffer,  // The image file data
              ContentType: req.file.mimetype, // The MIME type of the file
              ACL: 'public-read',  // Set file to be publicly readable
            };
      
            const s3Data = await s3.upload(uploadParams).promise();  // Uploading to S3
            
            // Save the image URL and mark the order as delivered
            order.status = 'delivered';
            order.deliveryPhotoUrl = s3Data.Location; // S3 URL of the uploaded photo
            await order.save();
      
            // Response with success and order details
            res.status(200).json({
              message: 'Order delivered successfully with photo',
              order,
            });
            
          } catch (error) {
            res.status(500).json({ message: 'Error delivering order', error: error.message });
          }
        });
      }


     async function updateOrderCityReached (req, res)  {
        try {
          const { orderId } = req.params; 
          const { city, currentRouteStage } = req.body; 
      
         
          const validRoutes = ['A', 'B', 'C', 'D'];
          if (!validRoutes.includes(currentRouteStage)) {
            return res.status(400).json({ message: 'Invalid route stage. Must be one of A, B, C, D.' });
          }
      
        
          const order = await Order.findById(orderId);
          if (!order) {
            return res.status(404).json({ message: 'Order not found' });
          }
      
          order.routes[currentRouteStage] = city;
      
          await order.save();
      
          res.status(200).json({
            message: `City ${city} successfully updated at route stage ${currentRouteStage}`,
            order,
          });
        } catch (error) {
          res.status(500).json({
            message: 'Error updating order city reached',
            error: error.message,
          });
        }
      };
    


      export const getOrder = async (req, res) => {
        try {
          const { orderId } = req.params; // Get the orderId from the URL
      
          // Find the order by its ID, and populate the references (Customer, Product, Seller, Hub)
          const order = await Order.findById(orderId)
            .populate('customerId', 'name email') // Populate customer details
            .populate('orderDetails.product', 'name price') // Populate product details
            .populate('orderDetails.sellerId', 'name') // Populate seller details
            .populate('hub', 'name location'); // Populate hub details
      
          if (!order) {
            return res.status(404).json({ message: 'Order not found' });
          }
      
          res.status(200).json({
            message: 'Order retrieved successfully',
            order,
          });
        } catch (error) {
          res.status(500).json({
            message: 'Error retrieving the order',
            error: error.message,
          });
        }
      };
// Export the assignCollection function
export { assignCollection };
