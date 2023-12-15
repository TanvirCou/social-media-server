const express = require("express");
const router = express.Router();
const Post = require("../schemas/postSchema");
const User = require("../schemas/userSchema");

const dotenv = require("dotenv");
var cloudinary = require("cloudinary").v2;

dotenv.config();

const cloud_name = process.env.CLOUD_NAME;
const api_key = process.env.API_KEY;
const api_secret = process.env.API_SECRET;

cloudinary.config({
  cloud_name: cloud_name,
  api_key: api_key,
  api_secret: api_secret,
});


router.post("/", async(req, res) => {
    const file = req.files.file;
    const userId = req.body.userId;
    const desc = req.body.desc;

    // const newImg = file.data;
    // const encImg = newImg.toString('base64');

    // var img = {
    //   contentType: file.mimetype,
    //   size: file.size,
    //   img: Buffer.from(encImg, 'base64')
    // }
    
    try {
        const result = await cloudinary.uploader.upload(file.tempFilePath);
        const img = result.secure_url;
        const query = {userId, desc, img};
        await Post.create(query);
        res.status(200).json("Post created");
    } catch(err) {
        res.status(500).json(err);
    }
    // const newPost = new Post(query);
    // try {
    //     const post = await newPost.save();
    //     res.status(200).json("Post created");
    // } catch(err) {
    //     res.status(500).json(err);
    // }
});

router.put("/:id", async(req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if(post.userId === req.body.userId) {
            await post.updateOne({ $set: req.body});
            res.status(200).json("Post updated");
        } else {
            res.status(403).json("You can update only your post");
        }
    } catch(err) {
        res.status(500).json(err);
    }
});

router.delete("/:id", async(req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if(post.userId === req.body.userId) {
            await post.deleteOne();
            res.status(200).json("Post deleted");
        } else {
            res.status(403).json("You can deleted only your post");
        }
    } catch(err) {
        res.status(500).json(err);
    }
});

router.put("/:id/like", async(req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if(!post.likes.includes(req.body.userId)) {
            await post.updateOne({ $push: {likes: req.body.userId}});
            res.status(200).json("Post has been liked");
        } else {
            await post.updateOne({ $pull: {likes: req.body.userId}});
            res.status(200).json("Post has been disliked");
        }
    } catch(err) {
        res.status(500).json(err);
    }
});

router.get("/:id", async(req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        res.status(200).json(post);
    } catch(err) {
        res.status(500).json(err);
    }
});

router.get("/timeline/:userId", async(req, res) => {
    try {
        const currentUser = await User.findById(req.params.userId);
        const userPosts = await Post.find({ userId: currentUser._id});
        const friendPosts = await Promise.all(
        currentUser.following.map(friendId => {
            return Post.find({ userId: friendId});
            })
        );
        res.status(200).json(userPosts.concat(...friendPosts));
    } catch(err) {
        res.status(500).json(err);
    }
});

router.get("/profile/:name", async(req, res) => {
    try {
        const user = await User.findOne({name: req.params.name});
        const posts = await Post.find({userId: user._id}); 
        res.status(200).json(posts);
    } catch(err) {
        res.status(500).json(err);
    }
});

module.exports = router;