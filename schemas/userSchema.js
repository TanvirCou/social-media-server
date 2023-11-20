const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        min: 3,
        max: 20,
        unique: true
    },
    email: {
        type: String,
        required: true,
        max: 50,
        unique: true
    },
    password: {
        type: String,
        required: true,
        min: 6
    },
    profilePicture: {
        type: String,
        default: ""
    },
    coverPicture: {
        type: String,
        default: ""
    },
    followers: {
        type: Array,
         default: []
    },
    following: {
        type: Array,
         default: []
    },
    desc: {
        type: String,
        max: 50
    },
    currentCity: {
        type: String,
        max: 50
    },
    homeTown: {
        type: String,
        max: 50
    },
    relationship: {
        type: Number,
        enum: [1, 2, 3]
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
},
{ timestamps: true });

module.exports = mongoose.model("User", userSchema);