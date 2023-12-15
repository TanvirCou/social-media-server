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
        type: Object,
        default: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
    },
    coverPicture: {
        type: Object,
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
        type: String,
        enum: ['Single', 'In a relationship', 'Married'],
        default: 'Single'
    },
    birthday: {
        type: Date,
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
},
{ timestamps: true });

module.exports = mongoose.model("User", userSchema);