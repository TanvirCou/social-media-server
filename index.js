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
app.use(helmet());
app.use(morgan("common"));
app.use(fileUpload());
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

app.listen(3000, () => {
    console.log("Server ready");
})