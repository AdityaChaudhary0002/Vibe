import imagekit from "../configs/imageKit.js";
import Notification from "../models/Notification.js";
import Connection from "../models/Connection.js";
import User from "../models/User.js";
import fs from "fs";
import Post from "../models/Post.js";
import { inngest } from "../inngest/index.js";
import sendEmail from "../configs/nodeMailer.js";
import groq from "../configs/groq.js";

// Get user data using userId
export const getUserData = async (req, res) => {
  try {
    const { userId } = req.auth();
    const user = await User.findById(userId);
    if (!user) return res.json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Update user data
export const updateUserData = async (req, res) => {
  try {
    const { userId } = req.auth();
    let { username, bio, location, full_name } = req.body;

    const tempUser = await User.findById(userId);

    !username && (username = tempUser.username);

    if (tempUser.username !== username) {
      const user = await User.findOne({ username });

      if (user) {
        // we will not change the username if it is already taken
        username = tempUser.username;
      }
    }

    const updatedData = {
      username,
      bio,
      location,
      full_name,
    };

    const profile = req.files.profile && req.files.profile[0];
    const cover = req.files.cover && req.files.cover[0];

    if (profile) {
      const buffer = fs.readFileSync(profile.path);
      const response = await imagekit.upload({
        file: buffer,
        fileName: profile.originalname,
      });

      const url = imagekit.url({
        path: response.filePath,
        transformation: [
          { quality: "auto" },
          { format: "webp" },
          { width: "512" },
        ],
      });

      updatedData.profile_picture = url;
    }

    if (cover) {
      const buffer = fs.readFileSync(cover.path);
      const response = await imagekit.upload({
        file: buffer,
        fileName: cover.originalname,
      });

      const url = imagekit.url({
        path: response.filePath,
        transformation: [
          { quality: "auto" },
          { format: "webp" },
          { width: "1280" },
        ],
      });

      updatedData.cover_photo = url;
    }

    const user = await User.findByIdAndUpdate(userId, updatedData, {
      new: true,
    });

    res.json({ success: true, user, message: "Profile updated successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Find users using username, email, location, name
export const discoverUsers = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { input } = req.body;

    const allUsers = await User.find({
      $or: [
        { username: new RegExp(input, "i") },
        { email: new RegExp(input, "i") },
        { full_name: new RegExp(input, "i") },
        { location: new RegExp(input, "i") },
      ],
    });

    const filteredUsers = allUsers.filter((user) => user._id !== userId);

    res.json({ success: true, users: filteredUsers });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Follow User
export const followUser = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id } = req.body;

    const user = await User.findById(userId);

    if (user.following.includes(id)) {
      return res.json({
        success: false,
        message: "You are already following this user",
      });
    }

    user.following.push(id);
    await user.save();

    const toUser = await User.findById(id);
    toUser.followers.push(userId);
    await toUser.save();

    // Create Notification
    await Notification.create({
      recipient: id,
      sender: userId,
      type: "follow",
    });

    res.json({ success: true, message: "Now you are following this user" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Unfollow User
export const unfollowUser = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id } = req.body;

    const user = await User.findById(userId);
    user.following = user.following.filter((user) => user !== id);
    await user.save();

    const toUser = await User.findById(id);
    toUser.followers = toUser.followers.filter((user) => user !== userId);
    await toUser.save();

    res.json({
      success: true,
      message: "You are no longer following this user",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Send Connection Request
export const sendConnectionReqest = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id } = req.body;

    // Check if user has sent more than 20 connection requests in the last 24 hours
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const connectionRequests = await Connection.find({
      from_user_id: userId,
      createdAt: { $gt: last24Hours },
    });
    if (connectionRequests.length > 20) {
      return res.json({
        success: false,
        message:
          "You have sent more than 20 connection requests in the last 24 hours",
      });
    }

    // Check if users are already connected
    const connection = await Connection.findOne({
      $or: [
        { from_user_id: userId, to_user_id: id },
        { from_user_id: id, to_user_id: userId },
      ],
    });

    if (!connection) {
      const newConnection = await Connection.create({
        from_user_id: userId,
        to_user_id: id,
      });

      // Send Email Notification
      const sender = await User.findById(userId);
      const receiver = await User.findById(id);

      const subject = `New Connection Request`;
      const body = `<div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Hi ${receiver.full_name},</h2>
                    <p>You have a new connection request from ${sender.full_name} . @${sender.username}</p>
                    <p>Click <a href="${process.env.FRONTEND_URL}/connections" style="color: #10b981;">here</a> to accept or reject the request</p>
                    <br />
                    <p>Thanks,<br />Vibe . Stay Connected</p>
                  </div>`;

      try {
        await sendEmail({
          to: receiver.email,
          subject,
          body,
        });
      } catch (emailError) {
        console.error("Error sending connection request email:", emailError);
      }

      await inngest.send({
        name: "app/conection-request",
        data: { connectionId: newConnection._id },
      });

      // Create Notification
      await Notification.create({
        recipient: id,
        sender: userId,
        type: "connection_request",
      });

      return res.json({
        success: true,
        message: "Connection request sent successfully",
      });
    } else if (connection && connection.status === "accepted") {
      return res.json({
        success: false,
        message: "You are already connected with this user",
      });
    }

    return res.json({ success: false, message: "Connection request pending" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Get user Connections
export const acceptConnectionRequest = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id } = req.body;

    const connection = await Connection.findOne({
      from_user_id: id,
      to_user_id: userId,
    });

    if (!connection) {
      return res.json({ success: false, message: "Connection not found" });
    }

    const user = await User.findById(userId);
    user.connections.push(id);
    await user.save();

    const toUser = await User.findById(id);
    toUser.connections.push(userId);
    await toUser.save();

    connection.status = "accepted";
    await connection.save();

    res.json({ success: true, message: "Connection accepted successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Accept Connection Request
export const getUserConnections = async (req, res) => {
  try {
    const { userId } = req.auth();
    const user = await User.findById(userId).populate(
      "connections followers following"
    );

    const connections = user.connections.filter((u) => u);
    const followers = user.followers.filter((u) => u);
    const following = user.following.filter((u) => u);

    const pendingConnections = (
      await Connection.find({ to_user_id: userId, status: "pending" }).populate(
        "from_user_id"
      )
    )
      .filter((c) => c.from_user_id)
      .map((connection) => connection.from_user_id);

    res.json({
      success: true,
      connections,
      followers,
      following,
      pendingConnections,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Get User Profiles
export const getUserProfiles = async (req, res) => {
  try {
    const { profileId } = req.body;
    const profile = await User.findById(profileId)
      .populate("followers", "full_name username profile_picture")
      .populate("following", "full_name username profile_picture");
    if (!profile) {
      return res.json({ success: false, message: "Profile not found" });
    }
    const posts = await Post.find({ user: profileId }).populate("user");
    res.json({ success: true, profile, posts });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Get Notifications
export const getNotifications = async (req, res) => {
  try {
    const { userId } = req.auth();

    const notifications = await Notification.find({ recipient: userId })
      .populate("sender", "full_name profile_picture")
      .populate("post", "image_urls")
      .sort({ createdAt: -1 });

    await Notification.updateMany({ recipient: userId, read: false }, { read: true });

    res.json({ success: true, notifications });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Check Vibe Match (AI)
export const checkVibeMatch = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { profileId } = req.body;

    const user1 = await User.findById(userId);
    const user2 = await User.findById(profileId);

    if (!user1 || !user2) {
      return res.json({ success: false, message: "User not found" });
    }

    // Fetch last 3 posts for context
    const posts1 = await Post.find({ user: userId }).limit(3).select("content");
    const posts2 = await Post.find({ user: profileId }).limit(3).select("content");

    const content1 = posts1.map((p) => p.content).join(" ");
    const content2 = posts2.map((p) => p.content).join(" ");

    const prompt = `
      Analyze the "vibe" compatibility between two users based on their profiles.
      
      User 1: ${user1.full_name}, Bio: ${user1.bio}, Posts: ${content1}
      User 2: ${user2.full_name}, Bio: ${user2.bio}, Posts: ${content2}
      
      Return a JSON object ONLY: { "score": number (0-100), "reason": "short funny 1-sentence reason" }.
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(chatCompletion.choices[0]?.message?.content || "{}");

    res.json({ success: true, ...result });
  } catch (error) {
    console.log("Vibe Match Error:", error);
    res.json({ success: false, message: "AI Vibe Check Failed" });
  }
};
