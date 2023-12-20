const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const morgan = require("morgan");
const dotenv = require("dotenv");
const cors = require("cors");
const userHandler = require("./routeHandler/userHandler");
const authHandler = require("./routeHandler/authHandler");
const postHandler = require("./routeHandler/postHandler");
const conversationHandler = require("./routeHandler/conversationHandler");
const messageHandler = require("./routeHandler/messageHandler");

const app = express();
dotenv.config();
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("common"));

const port = 5000;

mongoose.connect(process.env.MONGO_URL)
.then(() => console.log("Connected to MongoDB"))
.catch((err) => console.log(err.message));

app.use("/api/users", userHandler)
app.use("/api/auth", authHandler);
app.use("/api/posts", postHandler);
app.use("/api/conversations", conversationHandler);
app.use("/api/messages", messageHandler);

const server = app.listen(process.env.PORT || port);

const io = require("socket.io")(server, {
    pingTimeout: 60000,
    cors: {
        origin: "http://127.0.0.1:5173"
    },
});

let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

io.on("connection", (socket) => {
    console.log("connected to socket");

    socket.on("setup", (userData) => {
        socket.join(userData?._id);
        socket.emit("connected");
    });

    socket.on("join chat", (room) => {
        socket.join(room);
        console.log(socket.id);
    });

    socket.on("addUser", (userId) => {
        addUser(userId, socket.id);
        io.emit("getUsers", users);
      });

    socket.on("typing", (room) => {
        socket.in(room).emit("typing");
    });

    socket.on("stop typing", (room) => {
        socket.in(room).emit("stop typing");
    });

    socket.on("new message", (newMessageReceived) => {
        var conversation = newMessageReceived.conversation;

        if (!conversation.members) {
            console.log("chat users not defined");
        } else {
            conversation.members.forEach(memberId => {
                if (memberId === newMessageReceived.senderId) {
                    return;
                } else {
                    socket.in(memberId).emit("message received", newMessageReceived);
                }
            });
        }
    });

    socket.on("disconnect", () => {
        console.log("a user disconnected!");
        removeUser(socket.id);
        io.emit("getUsers", users);
      });
    
});