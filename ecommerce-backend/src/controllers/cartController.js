const Cart = require("../models/cart");
const Product = require("../models/product");

// Get current cart
const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne().populate("items.product");
    if (!cart) return res.json({ items: [] });
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add item to cart
const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (quantity > product.stock)
      return res.status(400).json({ message: "Quantity exceeds stock" });

    let cart = await Cart.findOne();
    if (!cart) cart = new Cart({ items: [] });

    // Check if product already in cart
    const itemIndex = cart.items.findIndex(item => item.product.equals(productId));
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    const populatedCart = await cart.populate("items.product");
    res.status(201).json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update cart items
const updateCart = async (req, res) => {
  try {
    const { items } = req.body; // [{ productId, quantity }]

    const cart = await Cart.findOne();
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = []; // reset items

    for (const i of items) {
      const product = await Product.findById(i.productId);
      if (!product) continue;
      if (i.quantity > product.stock) continue;

      cart.items.push({ product: i.productId, quantity: i.quantity });
    }

    await cart.save();
    const populatedCart = await cart.populate("items.product");
    res.json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne();
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(item => !item.product.equals(productId));
    await cart.save();
    const populatedCart = await cart.populate("items.product");
    res.json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCart,
  removeFromCart
};
