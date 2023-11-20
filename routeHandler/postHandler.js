const express = require("express");
const router = express.Router();
const Post = require("../schemas/postSchema");
const User = require("../schemas/userSchema");

router.post("/", async(req, res) => {
    const newPost = new Post(req.body);
    try {
        const post = await newPost.save();
        res.status(200).json("Post created");
    } catch(err) {
        res.status(500).json(err);
    }
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

router.get("/timeline/allPost", async(req, res) => {
    try {
        const currentUser = await User.findById(req.body.userId);
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

module.exports = router;