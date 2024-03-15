const Order = require("../models/Order");
const Customer = require("../models/Customer");
const MagentoStore = require("../models/magento/info")
const axios = require('axios');
const getAllOrders = async (req, res) => {
  const { customerName, status, page, limit, day, startDate, endDate, adminId } =
    req.query;

  // day count
  let date = new Date();
  const today = date.toString();
  date.setDate(date.getDate() - Number(day));
  const dateTime = date.toString();

  const beforeToday = new Date();
  beforeToday.setDate(beforeToday.getDate() - 1);
  const before_today = beforeToday.toString();

  const startDateData = new Date(startDate);
  startDateData.setDate(startDateData.getDate());
  const start_date = startDateData.toString();

  const queryObject = {};

  if (!status) {
    queryObject.$or = [
      { status: { $regex: `Pending`, $options: "i" } },
      { status: { $regex: `Processing`, $options: "i" } },
      { status: { $regex: `Delivered`, $options: "i" } },
      { status: { $regex: `Cancel`, $options: "i" } },
      {adminId: adminId}, 
    ];
  }

  if (customerName) {
    queryObject.$or = [
      { "user_info.name": { $regex: `${customerName}`, $options: "i" } },
      { invoice: { $regex: `${customerName}`, $options: "i" } },
    ];
  }

  if (day) {
    queryObject.createdAt = { $gte: dateTime, $lte: today };
  }

  if (status) {
    queryObject.status = { $regex: `${status}`, $options: "i" };
  }

  if (startDate && endDate) {
    queryObject.updatedAt = {
      $gt: start_date,
      $lt: before_today,
    };
  }

  const pages = Number(page) || 1;
  const limits = Number(limit);
  const skip = (pages - 1) * limits;

  try {
    // total orders count
    const totalDoc = await Order.countDocuments(queryObject);
    const orders = await Order.find(queryObject)
      .select(
        "_id invoice paymentMethod subTotal total user_info discount shippingCost status createdAt updatedAt"
      )
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limits);
    console.log(orders)

    res.send({
      orders,
      limits,
      pages,
      totalDoc,
      // orderOverview,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

// const getOrderCustomer = async (req, res) => {
//   try {
//     const orders = await Order.find({ user: req.params.id }).sort({ _id: -1 });
//     res.send(orders);
//   } catch (err) {
//     res.status(500).send({
//       message: err.message,
//     });
//   }
// };

const getOrderCustomer = async (req, res) => {
  try {
    // Assuming req.params.email contains the email of the user
    const userEmail = req.params.id;

    // Find orders where the email in user_info matches the userEmail
    const orders = await Order.find({ "user_info.email": userEmail }).sort({ _id: -1 });

    res.send(orders);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};


const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    res.send(order);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const updateOrder = async (req, res) => {
  const newStatus = req.body.status;
  const orderId = req.params.id; // Assuming this is the Magento order ID
  const adminId = req.body.adminId; // You need to pass this in your request

  // Function to get Magento store configuration
  const getMagentoStoreConfig = async (adminId) => {
    try {
      const storeConfig = await MagentoStore.findOne({ adminId: adminId, isActive: true });
      if (!storeConfig) {
        throw new Error('Magento store configuration not found.');
      }
      return storeConfig;
    } catch (error) {
      console.error('Error fetching Magento store configuration:', error);
      throw new Error('Failed to fetch Magento store configuration');
    }
  };

  // Function to update order status in Magento
  const updateMagentoOrderStatus = async (storeUrl, accessToken, newStatus, orderId) => {
    try {
      await axios.post(`${storeUrl}/rest/V1/orders`, // Adjust this endpoint as necessary
        {
          entity: {
            entity_id: orderId,
            status: newStatus,
            state: newStatus,
          },
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return true;
    } catch (error) {
      console.error('Error updating order status in Magento:', error);
      throw new Error('Failed to update order status in Magento');
    }
  };

  try {
    // Get Magento store configuration
    const { storeUrl, accessToken } = await getMagentoStoreConfig(adminId);
    

    // Update the order status in Magento
    await updateMagentoOrderStatus(storeUrl, accessToken, newStatus, orderId);

    // If the Magento order status update was successful, update the status in your local database
    Order.updateOne(
      { invoice : orderId },
      { $set: { status: newStatus } },
      (err) => {
        if (err) {
          res.status(500).send({ message: err.message });
        } else {
          res.status(200).send({ message: "Order Updated Successfully!" });
        }
      }
    );
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const deleteOrder = (req, res) => {
  Order.deleteOne({ _id: req.params.id }, (err) => {
    if (err) {
      res.status(500).send({
        message: err.message,
      });
    } else {
      res.status(200).send({
        message: "Order Deleted Successfully!",
      });
    }
  });
};

// get dashboard recent order
const getDashboardRecentOrder = async (req, res) => {
  try {
    const { page, limit, adminId } = req.query;

    const pages = Number(page) || 1;
    const limits = Number(limit) || 8;
    const skip = (pages - 1) * limits;
    console.log(adminId)

    const queryObject = {
      // Assuming orders have an adminId field to filter by
    };

    queryObject.$or = [
      { status: { $regex: `Pending`, $options: "i" } },
      { status: { $regex: `Processing`, $options: "i" } },
      { status: { $regex: `Delivered`, $options: "i" } },
      { status: { $regex: `Cancel`, $options: "i" } },
      {adminId: adminId}, 
    ];

    const totalDoc = await Order.countDocuments(queryObject);

    // query for orders
    const orders = await Order.find(queryObject)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limits);

    // console.log('order------------<', orders);

    res.send({
      orders: orders,
      page: page,
      limit: limit,
      totalOrder: totalDoc,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

// get dashboard count
const getDashboardCount = async (req, res) => {
  try {
    const totalDoc = await Order.countDocuments();

    // total padding order count
    const totalPendingOrder = await Order.aggregate([
      {
        $match: {
          status: "Pending",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    // total processing order count
    const totalProcessingOrder = await Order.aggregate([
      {
        $match: {
          status: "Processing",
        },
      },
      {
        $group: {
          _id: null,
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    // total delivered order count
    const totalDeliveredOrder = await Order.aggregate([
      {
        $match: {
          status: "Delivered",
        },
      },
      {
        $group: {
          _id: null,
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    res.send({
      totalOrder: totalDoc,
      totalPendingOrder: totalPendingOrder[0] || 0,
      totalProcessingOrder: totalProcessingOrder[0]?.count || 0,
      totalDeliveredOrder: totalDeliveredOrder[0]?.count || 0,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};




const getDashboardAmount = async (req, res) => {
  // console.log('total')
  let week = new Date();
  week.setDate(week.getDate() - 10);
  try {
    // total order amount
    const totalAmount = await Order.aggregate([
      {
        $group: {
          _id: null,
          tAmount: {
            $sum: "$total",
          },
        },
      },
    ]);
    // console.log('totalAmount',totalAmount)
    const thisMonthlyOrderAmount = await Order.aggregate([
      {
        $match: {
          $or: [{ status: { $regex: "Delivered", $options: "i" } }],
          $expr: {
            $eq: [{ $month: "$updatedAt" }, { $month: new Date() }],
          },
        },
      },
      {
        $group: {
          _id: {
            month: {
              $month: "$updatedAt",
            },
          },
          total: {
            $sum: "$total",
          },
        },
      },
      {
        $sort: { _id: -1 },
      },
      {
        $limit: 1,
      },
    ]);

    // console.log("thisMonthlyOrderAmount ===>", thisMonthlyOrderAmount);

    // order list last 10 days
    const orderFilteringData = await Order.find(
      {
        $or: [{ status: { $regex: `Delivered`, $options: "i" } }],
        updatedAt: {
          $gte: week,
        },
      },

      {
        paymentMethod: 1,
        paymentDetails: 1,
        total: 1,
        createdAt: 1,
        updatedAt: 1,
      }
    );
    // let data = [];
    // orderFilteringData.map((value) => {
    //   return data.push(value._id);
    // });

    res.send({
      totalAmount:
        totalAmount.length === 0
          ? 0
          : parseFloat(totalAmount[0].tAmount).toFixed(2),
      thisMonthlyOrderAmount: thisMonthlyOrderAmount[0]?.total,
      ordersData: orderFilteringData,
    });
  } catch (err) {
    // console.log('err',err)
    res.status(500).send({
      message: err.message,
    });
  }
};

const bestSellerProductChart = async (req, res) => {
  try {
    const totalDoc = await Order.countDocuments({});
    const bestSellingProduct = await Order.aggregate([
      {
        $unwind: "$cart",
      },
      {
        $group: {
          _id: "$cart.title",

          count: {
            $sum: "$cart.quantity",
          },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
      {
        $limit: 4,
      },
    ]);

    res.send({
      totalDoc,
      bestSellingProduct,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const getDashboardOrders = async (req, res) => {
  const { page, limit } = req.query;

  const pages = Number(page) || 1;
  const limits = Number(limit) || 8;
  const skip = (pages - 1) * limits;

  let week = new Date();
  week.setDate(week.getDate() - 10);

  const start = new Date().toDateString();

  // (startDate = '12:00'),
  //   (endDate = '23:59'),
  // console.log("page, limit", page, limit);

  try {
    const totalDoc = await Order.countDocuments({});

    // query for orders
    const orders = await Order.find({})
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limits);

    const totalAmount = await Order.aggregate([
      {
        $group: {
          _id: null,
          tAmount: {
            $sum: "$total",
          },
        },
      },
    ]);

    // total order amount
    const todayOrder = await Order.find({ createdAt: { $gte: start } });

    // this month order amount
    const totalAmountOfThisMonth = await Order.aggregate([
      {
        $group: {
          _id: {
            year: {
              $year: "$createdAt",
            },
            month: {
              $month: "$createdAt",
            },
          },
          total: {
            $sum: "$total",
          },
        },
      },
      {
        $sort: { _id: -1 },
      },
      {
        $limit: 1,
      },
    ]);

    // total padding order count
    const totalPendingOrder = await Order.aggregate([
      {
        $match: {
          status: "Pending",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    // total delivered order count
    const totalProcessingOrder = await Order.aggregate([
      {
        $match: {
          status: "Processing",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    // total delivered order count
    const totalDeliveredOrder = await Order.aggregate([
      {
        $match: {
          status: "Delivered",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    //weekly sale report
    // filter order data
    const weeklySaleReport = await Order.find({
      $or: [{ status: { $regex: `Delivered`, $options: "i" } }],
      createdAt: {
        $gte: week,
      },
    });

    res.send({
      totalOrder: totalDoc,
      totalAmount:
        totalAmount.length === 0
          ? 0
          : parseFloat(totalAmount[0].tAmount).toFixed(2),
      todayOrder: todayOrder,
      totalAmountOfThisMonth:
        totalAmountOfThisMonth.length === 0
          ? 0
          : parseFloat(totalAmountOfThisMonth[0].total).toFixed(2),
      totalPendingOrder:
        totalPendingOrder.length === 0 ? 0 : totalPendingOrder[0],
      totalProcessingOrder:
        totalProcessingOrder.length === 0 ? 0 : totalProcessingOrder[0].count,
      totalDeliveredOrder:
        totalDeliveredOrder.length === 0 ? 0 : totalDeliveredOrder[0].count,
      orders,
      weeklySaleReport,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

// Helper function to transform Magento order to the specified format
function transformOrder(magentoOrder) {
  return {
    shippingOption: magentoOrder.extension_attributes.shipping_assignments[0].shipping.method, // Example path
    paymentMethod: magentoOrder.payment.additional_information[0], // Example path, adjust as needed
    status: magentoOrder.status,
    subTotal: magentoOrder.subtotal,
    shippingCost: magentoOrder.shipping_amount,
    total: magentoOrder.grand_total,
    increment_id : magentoOrder.entity_id,
    user_info: {
      name: magentoOrder.customer_firstname + ' ' + magentoOrder.customer_lastname,
      contact: magentoOrder.billing_address.telephone, // Assuming billing address has a telephone
      email: magentoOrder.customer_email,
      address: magentoOrder.billing_address.street.join(' '), // Assuming 'street' is an array
      country: magentoOrder.billing_address.country_id,
      city: magentoOrder.billing_address.city,
      zipCode: magentoOrder.billing_address.postcode,
    },
    cart: magentoOrder.items.map(item => ({
      sku: item.sku,
      title: item.name,
      price : item.price,
      itemTotal : (item.price * item.qty_ordered),
      quantity: item.qty_ordered,

      // Add more item details as needed
    }))
  };
}

async function fetchAllOrders(storeUrl, accessToken) {
  try {
    let allOrders = [];
    let currentPage = 1;
    let pageSize = 20;
    let totalOrdersFetched = 0;
    console.log(storeUrl + accessToken);

    while (true) {
      const response = await axios.get(`${storeUrl}/rest/V1/orders?searchCriteria[pageSize]=${pageSize}&searchCriteria[currentPage]=${currentPage}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const orders = response.data.items.map(transformOrder);
      const totalCount = response.data.total_count;

      allOrders = allOrders.concat(orders);
      totalOrdersFetched += orders.length;

      if (totalOrdersFetched >= totalCount) {
        break;
      }

      currentPage++;
    }

    console.log('Transformed orders:', allOrders);
    return allOrders;

  } catch (error) {
    console.error('Failed to fetch orders from Magento API:', error);
    throw error;
  }
}


async function saveOrder(magentoOrder, adminId, storeUrl) {
  try {
    let customer = await Customer.findOne({ email: magentoOrder.user_info.email.toLowerCase() });

    // If customer does not exist, create a new one
    if (!customer) {
      customer = new Customer({
        name: magentoOrder.user_info.name,
        email: magentoOrder.user_info.email,
        phone: magentoOrder.user_info.contact, // Assuming 'contact' is the phone number
        address: magentoOrder.user_info.address,
        city: magentoOrder.user_info.city,
        country: magentoOrder.user_info.country,
        zipCode: magentoOrder.user_info.zipCode,
        adminId: adminId, // Assuming this is the ObjectId of the Admin who owns this customer
      });

      await customer.save();
    }
    // Define a unique identifier for the Magento order to check against existing records
    const uniqueOrderId = magentoOrder.increment_id; // Assuming `id` is your Magento order's unique identifier
    // Transform magentoOrder to match your Order schema
    const orderData = {
      adminId: adminId,
      cart: magentoOrder.cart,
      user_info: {
        name: magentoOrder.user_info.name,
        email: magentoOrder.user_info.email,
        contact: magentoOrder.user_info.contact,
        address: magentoOrder.user_info.address,
        city: magentoOrder.user_info.city,
        country: magentoOrder.user_info.country,
        zipCode: magentoOrder.user_info.zipCode,
      },
      subTotal: magentoOrder.subTotal,
      shippingCost: magentoOrder.shippingCost,
      total: magentoOrder.total,
      shippingOption: magentoOrder.shippingOption,
      paymentMethod: magentoOrder.paymentMethod,
      invoice : magentoOrder.increment_id,
      status: magentoOrder.status, // Map Magento status to your enum values as needed
      store: 'magento', // Since this is a Magento order
      // Include any additional fields required by your schema
    };

    // Use findOneAndUpdate with upsert option to update existing records or insert new ones
    const updatedOrder = await Order.findOneAndUpdate(
      { invoice: uniqueOrderId }, // Or another unique identifier for your orders
      orderData,
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    console.log('Order saved or updated successfully:', updatedOrder);
  } catch (error) {
    console.error('Failed to save or update order:', error);
    // Handle error appropriately
  }
}


async function refreshMagentoTokenAndFetchOrders() {
  // Fetch the MagentoStore details
  const stores = await MagentoStore.find({ isActive: true, isSubscribed: true });

  for (const store of stores) {
    // Refresh the access token logic goes here
    // For demonstration, using the existing accessToken from the store

    // Fetch orders using the Magento API and the accessToken
    const orders = await fetchAllOrders(store.storeUrl, store.accessToken); // Implement this function based on your Magento API

    // Save each order into the MongoDB using the Order model
    for (const order of orders) {
      await saveOrder(order, store.adminId, store.storeUrl); // Implement this function
    }
  }
}
const cron = require('node-cron');
cron.schedule('0 */1 * * * *', async () => {
  console.log('Running the fetch and save/update orders task every 10 minutes');
  refreshMagentoTokenAndFetchOrders();
});


module.exports = {
  getAllOrders,
  getOrderById,
  getOrderCustomer,
  updateOrder,
  deleteOrder,
  bestSellerProductChart,
  getDashboardOrders,
  getDashboardRecentOrder,
  getDashboardCount,
  getDashboardAmount,
};
