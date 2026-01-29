const { Schema, model } = require("mongoose");

module.exports = model(
  "SuperAdmins",
  new Schema({
    fullName: { type: String, trim: true, required: true },
    phoneNumber: { type: Number, required: true },
    password: {
      type: String,
      default: "$2b$10$PZ.0dhQ/pHUXQigROicNPeihUFjSGaSagWZhwloXpu8APZYyXrko6",
    },
    otpId: { type: Schema.Types.ObjectId, ref: "Otp" },
    deactivated: { type: Boolean, default: false },
  })
);
