const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    setting: {},
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true, // Set to true if every product must be linked to an admin, else set to false
    },
  },
  {
    timestamps: true,
  }
);

// module.exports = settingSchema;

const Setting = mongoose.model("Setting", settingSchema);

module.exports = Setting;
