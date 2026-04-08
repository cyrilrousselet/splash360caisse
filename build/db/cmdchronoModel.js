const mongoose = require("mongoose");

const CmdchronoSchema = mongoose.Schema(
  {
    ticketId: String,
    careTime: {
      firstCare: Number
    },
    endTime: Number,
    createdAt: Number,
    updatedAt: Number
  },
  { strict: false }
);

module.exports = mongoose.model("cmdchrono", CmdchronoSchema);
