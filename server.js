const io = require("socket.io")(3001, {
  cors: {
    origin: ["http://localhost:8180"],
  },
});
io.on("connection", (socket) => {
  console.log(socket.id);
  socket.on("send-request", (identity, command, body) => {
    console.log("body is", body);
    socket.broadcast.emit(command, identity, body);
  });
  socket.on("result", (status) => {
    socket.broadcast.emit("response", status);
  });
  socket.on("new-connected", (identity) => {
    socket.broadcast.emit("add-identity", identity);
  });
});
