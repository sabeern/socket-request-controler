const mongoose = require("mongoose");

const ChargePointSchema = new mongoose.Schema(
  {
    identity: {
      type: String,
      require: true,
      unique: true,
    },
    chargePointModel: String,
    chargePointSerialNumber: String,
    chargePointVendor: String,
    firmwareVersion: String,
    chargePointConnectionProtocol: {
      type: String,
      enum: ["OCPP", "MQTT"],
    },
  },
  { timestamps: true }
);

//const ChargePoint = mongoose.model("chargepoint", ChargePointSchema);

module.exports = mongoose.connection
  .useDb("console")
  .model("chargepoint", ChargePointSchema);

// module.exports.connectors = mongoose.connection.useDb('console').model("chargepointconnectors", ChargePointConnectorSchema);
