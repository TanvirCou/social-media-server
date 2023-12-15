const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const morgan = require("morgan");
const dotenv = require("dotenv");
const cors = require("cors");
const multer  = require('multer');
const path = require('path');
const fileUpload = require('express-fileupload');
const userHandler = require("./routeHandler/userHandler");
const authHandler = require("./routeHandler/authHandler");
const postHandler = require("./routeHandler/postHandler");
const conversationHandler = require("./routeHandler/conversationHandler");
const messageHandler = require("./routeHandler/messageHandler");

const app = express();
dotenv.config();
app.use(express.json());
app.use(cors());
// app.use(helmet());
// app.use(morgan("common"));
app.use(fileUpload({
    useTempFiles: true
}));
// app.use(express.static('api/posts/'));

mongoose.connect(process.env.MONGO_URL)
.then(() => console.log("Connected to MongoDB"))
.catch((err) => console.log(err.message));

app.use("/api/users", userHandler)
app.use("/api/auth", authHandler);
app.use("/api/posts", postHandler);
app.use("/api/conversations", conversationHandler);
app.use("/api/messages", messageHandler);

// app.use("/images", express.static(path.join(__dirname, "public/images")));

// const UPLOADS_FOLDER = './uploads/';

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, UPLOADS_FOLDER);
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + file.originalname);
//     console.log(req);
//   },
// });

// const upload = multer({ storage: storage });

// app.post("/api/upload", upload.single("file"), (req, res) => {
//   try {
//     return res.status(200).json("File uploded successfully");
//   } catch (error) {
//     console.error(error);
//   }
// });

const server = app.listen(3000);

const io = require("socket.io")(server, {
    pingTimeout: 60000,
    cors: {
        origin: "http://127.0.0.1:5173"
    },
});

io.on("connection", (socket) => {
    console.log("connected to socket");

    socket.on("setup", (userData) => {
        socket.join(userData?._id);
        socket.emit("connected");
    });

    socket.on("join chat", (room) => {
        socket.join(room);
        console.log(room);
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
    
});