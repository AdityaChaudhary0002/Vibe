import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        recipient: { type: String, ref: "User", required: true },
        sender: { type: String, ref: "User", required: true },
        type: {
            type: String,
            enum: ["like", "comment", "follow", "connection_request"],
            required: true,
        },
        post: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
        text: { type: String },
        read: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
