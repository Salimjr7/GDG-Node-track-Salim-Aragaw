const express = require("express");
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCart,
  removeFromCart
} = require("../controllers/cartController");

router.get("/cart", getCart);
router.post("/cart", addToCart);
router.put("/cart", updateCart);
router.delete("/cart/:productId", removeFromCart);

module.exports = router;
