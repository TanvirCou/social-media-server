const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const morgan = require("morgan");
const dotenv = require("dotenv");
const userHandler = require("./routeHandler/userHandler");
const authHandler = require("./routeHandler/authHandler");
const postHandler = require("./routeHandler/postHandler");

const app = express();
dotenv.config();
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

mongoose.connect(process.env.MONGO_URL)
.then(() => console.log("Connected to MongoDB"))
.catch((err) => console.log(err.message));

app.use("/api/users", userHandler)
app.use("/api/auth", authHandler);
app.use("/api/posts", postHandler);

app.listen(3000, () => {
    console.log("Server ready");
})