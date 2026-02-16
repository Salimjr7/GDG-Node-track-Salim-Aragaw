const Order = require("../models/order");
const Cart = require("../models/cart");
const Product = require("../models/product");

// CREATE order from cart
exports.createOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne().populate("items.product");
    if (!cart || cart.items.length === 0)
      return res.status(400).json({ message: "Cart is empty" });

    let total = 0;
    const orderItems = [];

    for (const item of cart.items) {
      if (item.quantity > item.product.stock) {
        return res.status(400).json({
          message: `Not enough stock for ${item.product.name}`
        });
      }

      item.product.stock -= item.quantity;
      await item.product.save();

      total += item.quantity * item.product.price;
      orderItems.push({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price
      });
    }

    const order = await Order.create({
      items: orderItems,
      total,
      customerInfo: req.body.customerInfo
    });

    cart.items = [];
    await cart.save();

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET all orders
exports.getOrders = async (req, res) => {
  const orders = await Order.find().populate("items.product");
  res.json(orders);
};

// GET single order
exports.getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id).populate("items.product");
  if (!order)
    return res.status(404).json({ message: "Order not found" });
  res.json(order);
};
