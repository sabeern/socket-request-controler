const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const ChargePoint = require("./model/charge_pont");
const app = express();
require("dotenv").config();
app.use(cors());
app.use(express.json());
const Redis = require("ioredis");
const redis = new Redis();
const { io } = require("socket.io-client");
const socket = io("http://localhost:3001");
const uri = process.env.MONGO_DEV_URI;
mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useCreateIndex: true
  })
  .then(() => console.log("Database connected!"))
  .catch((err) => console.log(err));
socket.on("connect", () => {
  console.log("you are connected with " + socket.id);
});
const identityHandler = async (identity) => {
  console.log("came here");
  await redis.set(identity, true);
};
app.post("/charge-point/add", async (req, res) => {
  try {
    let { identity } = req.body;
    if (identity) {
      identity = identity.trim();
    }
    let cpExist = await ChargePoint.findOne({ identity });
    if (cpExist) {
      return res.status(400).send({ errMsg: "Charge point already exist" });
    }
    const newcp = new ChargePoint({ identity });
    try {
      await newcp.save();
      return res.status(201).json({
        msg: "Created ChargePoint",
      });
    } catch (err) {
      return res.status(404).send({ errMsg: "Could not create" });
    }
  } catch (err) {
    res.status(500).send({ errMsg: err.message });
  }
});
app.post("/:identity/:command", async (req, res) => {
  const { identity, command } = req.params;
  const resultHandler = (response) => {
    console.log(response);
    socket.off("add-identity", identityHandler);
    res.status(response.status).send(response.result);
    socket.off("response", resultHandler); // Remove the event listener
  };

  const redisStatus = await redis.get(identity, (err, data) => {
    if (err) {
      console.log(err.message);
    }
    if (data == null || data == "false") {
      socket.off("response", resultHandler);
      socket.off("add-identity", identityHandler);
      return res.status(404).send({ status: "identity not found" });
    }
  });
  if (!redisStatus) {
    return;
  }
  console.log(req.body);
  socket.emit("send-request", identity, command, req.body);
  socket.on("response", resultHandler);
});
socket.on("add-identity", identityHandler);

app.listen(3030);
