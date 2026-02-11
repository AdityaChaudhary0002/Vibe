import { BadgeCheck, Trash2, X, Send, Heart, Flame, Laugh, ThumbsUp } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios.js";
import toast from "react-hot-toast";
import { createPortal } from "react-dom";

const StoryViewer = ({ viewStory, setViewStory, fetchStories }) => {
  const [progress, setProgress] = useState(0);
  const [reply, setReply] = useState("");
  const { getToken, userId } = useAuth();

  useEffect(() => {
    let timer, progressInterval;

    if (viewStory && viewStory.media_type !== "video") {
      setProgress(0);

      const duration = 10000;
      const setTime = 50;
      let elapsed = 0;

      progressInterval = setInterval(() => {
        elapsed += setTime;
        setProgress((elapsed / duration) * 100);
      }, setTime);

      // Close story after duration(10sec)
      timer = setTimeout(() => {
        setViewStory(null);
      }, duration);
    }

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [viewStory, setViewStory]);

  const handleClose = () => {
    setViewStory(null);
  };

  const handleSendReply = async (textToSend = reply) => {
    if (!textToSend || !textToSend.trim()) return;

    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append("to_user_id", viewStory.user._id);
      formData.append("text", `Replied to story: ${textToSend}`);

      await api.post("/api/message/send", formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success("Reply sent! 🚀");
      setReply("");
    } catch (error) {
      toast.error("Failed to send reply");
    }
  };

  const handleDelete = async () => {
    try {
      const token = await getToken();
      const { data } = await api.post(
        "/api/story/delete",
        { storyId: viewStory._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success(data.message);
        setViewStory(null);
        fetchStories();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (!viewStory) return null;

  const renderContent = () => {
    switch (viewStory.media_type) {
      case "image":
        return (
          <img
            src={viewStory.media_url}
            alt=""
            className="max-w-full max-h-screen object-contain"
          />
        );

      case "video":
        return (
          <video
            controls
            autoPlay
            onEnded={() => setViewStory(null)}
            src={viewStory.media_url}
            className="max-h-screen"
          />
        );

      case "text":
        return (
          <div className="w-full h-full flex items-center justify-center p-8 text-white text-2xl text-center">
            {viewStory.content}
          </div>
        );

      default:
        return null;
    }
  };

  const isOwner = userId === viewStory.user?._id;

  return createPortal(
    <div
      className="fixed inset-0 h-screen bg-black bg-opacity-90 z-[110] flex items-center justify-center"
      style={{
        backgroundColor:
          viewStory.media_type === "text"
            ? viewStory.background_color
            : "#000000",
      }}
    >
      {/* Process Bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gray-700 z-[120]">
        <div
          className="h-full bg-white transition-all duration-100 linear"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* User info - top left */}
      <div className="absolute top-4 left-4 flex items-center space-x-3 p-2 px-4 sm:p-4 sm:px-8 backdrop-blur-2xl rounded bg-black/50 z-[120]">
        <img
          src={viewStory.user?.profile_picture}
          alt=""
          className="size-7 sm:size-8 rounded-full object-cover border border-white"
        />
        <div className="text-white font-medium flex items-center gap-1.5">
          <span>{viewStory.user?.full_name}</span>
          <BadgeCheck size={18} />
        </div>
      </div>

      {/* Controls (Delete / Close) */}
      <div className="absolute top-4 right-4 flex gap-4 z-[120]">
        {isOwner && (
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(); }}
            className="text-white text-3xl font-bold focus:outline-none bg-red-500/80 p-2 rounded-full hover:bg-red-600 transition cursor-pointer"
          >
            <Trash2 className="size-5" />
          </button>
        )}

        <button
          onClick={(e) => { e.stopPropagation(); handleClose(); }}
          className="text-white text-3xl font-bold focus:outline-none bg-black/20 p-2 rounded-full hover:bg-black/40 transition cursor-pointer backdrop-blur-md"
        >
          <X className="size-6" />
        </button>
      </div>

      {/* Content Wrapper */}
      <div className="max-w-[100vw] max-h-[80vh] flex items-center justify-center p-4">
        {renderContent()}
      </div>

      {/* Reply Section (Bottom) */}
      {!isOwner && (
        <div
          className="absolute bottom-4 left-0 w-full px-4 flex flex-col gap-3 z-[120]"
          onClick={(e) => e.stopPropagation()} // Prevent close on click
        >
          {/* Quick Reactions */}
          <div className="flex gap-4 justify-center">
            {["❤️", "🔥", "😂", "😮", "👍"].map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleSendReply(emoji)}
                className="text-2xl hover:scale-125 transition active:scale-95 cursor-pointer p-2 bg-black/20 hover:bg-black/40 rounded-full backdrop-blur-sm"
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 max-w-lg mx-auto w-full">
            <input
              type="text"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendReply()}
              placeholder="Send a message..."
              className="flex-1 bg-black/40 backdrop-blur-md border border-white/20 rounded-full px-6 py-3 text-white placeholder-white/60 focus:outline-none focus:border-white/50 transition"
            />
            <button
              onClick={() => handleSendReply()}
              disabled={!reply.trim()}
              className="p-3 bg-white text-black rounded-full hover:bg-gray-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <Send size={20} className="ml-0.5" />
            </button>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
};

export default StoryViewer;
