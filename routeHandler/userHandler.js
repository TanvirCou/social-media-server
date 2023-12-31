const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const User = require("../schemas/userSchema");


router.put('/:id', async(req, res) => {
    if(req.body.userId === req.params.id || req.body.isAdmin) {
        if(req.body.password) {
            try {
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(req.body.password, salt);
            } catch(err) {
                return res.status(500).json(err);
            }
        }
        
        try {
            const user = await User.findByIdAndUpdate(req.params.id, { $set: req.body });
            res.status(200).json("Account updated successfully");
        } catch(err) {
            res.status(500).json(err);
        }
    } else {
        res.status(403).json("You can only update your account");
    }
});

router.delete('/:id', async(req, res) => {
    if(req.body.userId === req.params.id || req.body.isAdmin) {
        try {
            const user = await User.findByIdAndDelete(req.params.id);
            res.status(200).json("Account deleted successfully");
        } catch(err) {
            res.status(500).json(err);
        }
    } else {
        res.status(403).json("You can only delete your account");
    }
});

router.get('/', async(req, res) => {
    const userId = req.query.userId;
    const name = req.query.name;
    try {
        const user = userId ? 
        await User.findById(userId).select({
            password: 0,
            updatedAt: 0,
            createdAt: 0,
            __v: 0
        })
        : await User.findOne({ name: name}).select({
            password: 0,
            updatedAt: 0,
            createdAt: 0,
            __v: 0
        });
        res.status(200).json(user);
    } catch(err) {
        res.status(500).json(err);
    }
});

router.post("/friends", async(req, res) => {
    try {
    const user = await User.findById(req.body.userId);

    const friends = await Promise.all(
        user.following.map(followingId => {
            return User.findById(followingId);
        })
    )
    let friendList = [];
    friends.map(friend => {
        const {_id, name, profilePicture} = friend;
        friendList.push({_id, name, profilePicture});
    })
        res.status(200).json(friendList);
    } catch(err) {
        res.status(500).json(err);
    }
})

router.put('/:id/follow', async(req, res) => {
    if(req.body.userId !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);
            if(!user.followers.includes(req.body.userId)) {
                await user.updateOne({ $push: { followers: req.body.userId}});
                await currentUser.updateOne({ $push: { following: req.params.id}});
                res.status(200).json("user has been followed");
            } else {
                res.status(403).json("You are already follow this user");
            }
        } catch(err) {
            res.status(500).json(err);
        }
    } else {
        res.status(403).json("You cannot follow yourself");
    }
});

router.put('/:id/unfollow', async(req, res) => {
    if(req.body.userId !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);
            if(user.followers.includes(req.body.userId)) {
                await user.updateOne({ $pull: { followers: req.body.userId}});
                await currentUser.updateOne({ $pull: { following: req.params.id}});
                res.status(200).json("user has been unfollowed");
            } else {
                res.status(403).json("You don't follow this user");
            }
        } catch(err) {
            res.status(500).json(err);
        }
    } else {
        res.status(403).json("You cannot unfollow yourself");
    }
});

router.post("/search", async (req, res) => {
    const keyWord = req.query.search ?
        { $or: [{ name: { $regex: req.query.search, $options: "i" } }, { email: { $regex: req.query.search, $options: "i" } }], }
        : {};

    try {
        const users = await User.find(keyWord).find({ _id: { $ne: req.body.userId } });
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;