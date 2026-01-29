const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");

module.exports = model(
  "InventoryClerks",
  new Schema({
    fullName: { type: String, trim: true, required: true },
    phoneNumber: { type: Number, required: true, unique: true },
    // Default password is 'inventoryclerk' (hashed). This matches the
    // development scripts (set_password_all/add_user_roles) and gives a
    // known initial login for new InventoryClerk users.
    password: {
      type: String,
      default: () => bcrypt.hashSync("inventoryclerk", 10),
    },
    deactivated: { type: Boolean, default: false },
    otpId: { type: Schema.Types.ObjectId, ref: "Otp" },
    addedBy: { type: Schema.Types.ObjectId, ref: "SuperAdmins", required: true },
  })
);