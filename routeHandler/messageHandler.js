const express = require("express");
const router = express.Router();
const Message = require("../schemas/messageSchema");

router.post("/", async(req, res) => {
    const { conversation, senderId, text } = req.body;

    const newMessage = {
        conversation: conversation,
        senderId: senderId,
        text: text
    };
    try {
        let message = await Message.create(newMessage);

            message = await message.populate("conversation");
        res.status(200).json(message);
    } catch(err) {
        res.status(500).json(err);
    }
});

router.get("/:conversationId", async(req, res) => {
    try {
        const message = await Message.find({conversation: req.params.conversationId}).populate("conversation");;
        res.status(200).json(message);
    } catch(err) {
        res.status(500).json(err);
    }
})

module.exports = router;