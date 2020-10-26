const mongoose = require("mongoose");

const ProductSchema = mongoose.Schema(
  {
    id: Number,
    name: String,
    price: Number,
  },
  { strict: false }
);

module.exports = mongoose.model("Product", ProductSchema);
