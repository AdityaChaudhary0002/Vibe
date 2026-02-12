import React, { useEffect, useState } from "react";
import { dummyStoriesData } from "../assets/assets";
import { Plus } from "lucide-react";
import moment from "moment";
import StoryModel from "./StoryModel";
import StoryViewer from "./StoryViewer";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios.js";
import toast from "react-hot-toast";

const StoriesBar = () => {
  const { getToken } = useAuth();

  const [stories, setStories] = useState([]);
  const [showModel, setShowModel] = useState(false);
  const [viewStory, setViewStory] = useState(false);

  const fetchStories = async () => {
    try {
      const token = await getToken();
      const { data } = await api.get("/api/story/get", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setStories(data.stories);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  return (
    <div className="w-screen sm:w-[calc(100vw-240px)] lg:max-w-2xl no-scrollbar overflow-x-auto px-1 py-2">
      <div className="flex gap-3 pb-2">
        {/* Add Story card */}
        <div
          onClick={() => setShowModel(true)}
          className="relative group rounded-2xl shadow-sm min-w-[100px] max-w-[100px] h-[160px] cursor-pointer hover:-translate-y-1 transition-all duration-300 overflow-hidden"
        >
          <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-end p-2 pb-3">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-10 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg shadow-indigo-300 dark:shadow-indigo-900 group-hover:scale-110 transition-transform">
              <Plus className="size-6 text-white" />
            </div>
            <span className="text-xs font-bold text-slate-700 dark:text-white z-10">Create</span>
          </div>
          {/* Gradient Overlay on hover */}
          <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Story Cards */}
        {stories.map((story, index) => (
          <div
            key={index}
            onClick={() => setViewStory(story)}
            className="relative group rounded-2xl shadow-sm min-w-[100px] max-w-[100px] h-[160px] cursor-pointer hover:-translate-y-1 transition-all duration-300 overflow-hidden ring-2 ring-transparent hover:ring-indigo-500/50"
          >
            {/* Background Image/Video Preview */}
            <div className="absolute inset-0 bg-slate-900">
              {story.media_type === "video" ? (
                <video src={story.media_url} className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-700" muted />
              ) : (
                <img src={story.media_url || story.user.profile_picture} className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-700" alt="" />
              )}
              {/* Gradient shade at bottom for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            </div>

            {/* Profile Ring - REMOVED GRADIENT, now just border if needed, or simple */}
            <div className="absolute top-2 left-2">
              <img
                src={story.user.profile_picture}
                className="size-8 rounded-full object-cover border-2 border-white dark:border-slate-900 shadow-md"
                alt=""
              />
            </div>

            {/* Username & Time */}
            <div className="absolute bottom-2 left-2 right-2 text-white">
              <p className="text-xs font-bold truncate drop-shadow-md">
                {story.user.full_name.split(" ")[0]}
              </p>
              <p className="text-[10px] font-medium opacity-80 drop-shadow-md">
                {moment(story.createdAt).fromNow()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Add Story Model */}
      {showModel && (
        <StoryModel setShowModel={setShowModel} fetchStories={fetchStories} />
      )}

      {/* View Story Model */}
      {viewStory && (
        <StoryViewer
          viewStory={viewStory}
          setViewStory={setViewStory}
          fetchStories={fetchStories}
        />
      )}
    </div>
  );
};

export default StoriesBar;
