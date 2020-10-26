const mongoose = require("mongoose");

const CommandeSchema = mongoose.Schema({}, { strict: false });

module.exports = mongoose.model("commandes", CommandeSchema);
