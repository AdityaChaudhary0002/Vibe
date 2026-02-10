import { BadgeCheck, Trash2, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios.js";
import toast from "react-hot-toast";

const StoryViewer = ({ viewStory, setViewStory, fetchStories }) => {
  const [progress, setProgress] = useState(0);
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

  return (
    <div
      className="fixed inset-0 h-screen bg-black bg-opacity-90 z-110 flex items-center justify-center"
      style={{
        backgroundColor:
          viewStory.media_type === "text"
            ? viewStory.background_color
            : "#000000",
      }}
    >
      {/* Process Bar */}
      <div className=" absolute top-0 left-0 w-full h-1 bg-gray-700">
        <div
          className="h-full bg-white transition-all duration-100 linear"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* User info - top left */}
      <div className=" absolute top-4 left-4 flex items-center space-x-3 p-2 px-4 sm:p-4 sm:px-8 backdrop-blur-2xl rounded bg-black/50">
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

      <div className=" absolute top-4 right-4 flex gap-4">
        {/* Delete Button (Only for owner) */}
        <button
          onClick={handleDelete}
          className="text-white text-3xl font-bold focus:outline-none bg-red-500/80 p-2 rounded-full hover:bg-red-600 transition cursor-pointer"
        >
          <Trash2 className="size-5" />
        </button>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="text-white text-3xl font-bold focus:outline-none"
        >
          <X className="size-8 hover:scale-110 transition cursor-pointer" />
        </button>
      </div>

      {/* Content Wrapper */}
      <div className="max-w-[90vw] max-h-[90vh] flex items-center justify-center">
        {renderContent()}
      </div>
    </div>
  );
};

export default StoryViewer;
