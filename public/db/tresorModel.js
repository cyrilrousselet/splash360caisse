const mongoose = require('mongoose');

const TresorSchema = mongoose.Schema(
  {
    id: String,
    tresorId: String,
    createdAt: Number,
    updatedAt: Number,
    user: String,
    caisse: {
      id: String,
      nom: String
    },
    origine: String,
    destination: String,
    credit: Number,
    debit: Number,
    montant: Number,
    type: String,
    detail: String
  },
  { strict: false}
);

module.exports = mongoose.model("tresorerie", TresorSchema);