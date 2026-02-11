import { useAuth } from "@clerk/clerk-react";
import { X, Type, Image as ImageIcon, Sparkles, Palette, Send } from "lucide-react";
import React, { useState } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import api from "../api/axios.js";

const StoryModel = ({ setShowModel, fetchStories }) => {
  const gradients = [
    "linear-gradient(to bottom right, #0F172A, #1E293B)", // Slate Midnight (Default)
    "linear-gradient(to bottom right, #000000, #434343)", // Pure Black
    "linear-gradient(to bottom right, #232526, #414345)", // Charcoal
    "linear-gradient(to bottom right, #1a2a6c, #b21f1f)", // Deep Red/Blue
    "linear-gradient(to bottom right, #141E30, #243B55)", // Deep Navy
    "linear-gradient(to bottom right, #0f0c29, #302b63, #24243e)", // Deep Purple Night
    "linear-gradient(to bottom right, #134E5E, #71B280)", // Dark Green
    "linear-gradient(to bottom right, #200122, #6f0000)", // Dark Red
  ];

  const [mode, setMode] = useState("text");
  const [background, setBackground] = useState(gradients[0]);
  const [text, setText] = useState("");
  const [media, setMedia] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const { getToken } = useAuth();

  const MAX_VIDEO_DURATION = 60; // seconds
  const MAX_VIDEO_SIZE_MB = 50; // MB

  const handleMediaUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith("video")) {
        if (file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
          toast.error(`Video file size cannot exceed ${MAX_VIDEO_SIZE_MB} MB.`);
          resetMedia();
          return;
        }
        const video = document.createElement("video");
        video.preload = "metadata";
        video.onloadedmetadata = () => {
          window.URL.revokeObjectURL(video.src);
          if (video.duration > MAX_VIDEO_DURATION) {
            toast.error("Video duration cannot exceed 1 minute.");
            resetMedia();
          } else {
            setMedia(file);
            setPreviewUrl(URL.createObjectURL(file));
            setText("");
            setMode("media");
          }
        };
        video.src = URL.createObjectURL(file);
      } else if (file.type.startsWith("image")) {
        setMedia(file);
        setPreviewUrl(URL.createObjectURL(file));
        setText("");
        setMode("media");
      }
    }
  };

  const resetMedia = () => {
    setMedia(null);
    setPreviewUrl(null);
  };

  const handleCreateStory = async () => {
    const media_type =
      mode === "media"
        ? media?.type.startsWith("image")
          ? "image"
          : "video"
        : "text";

    if (media_type === "text" && !text.trim()) {
      return toast.error("Please enter some text");
    }
    if (media_type !== "text" && !media) {
      return toast.error("Please upload media");
    }

    setLoading(true);
    let formData = new FormData();
    formData.append("content", text);
    formData.append("media_type", media_type);
    formData.append("media", media);
    formData.append("background_color", background);

    try {
      const token = await getToken();
      const { data } = await api.post("/api/story/create", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setShowModel(false);
        toast.success("Story shared! 🚀");
        fetchStories();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md h-[85vh] flex flex-col items-center">
        {/* Header / Tabs */}
        <div className="w-full flex justify-between items-center mb-6 px-4">
          <button
            onClick={() => setShowModel(false)}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition text-white"
          >
            <X size={24} />
          </button>

          <div className="flex bg-black/40 backdrop-blur-md rounded-full p-1 border border-white/10">
            <button
              onClick={() => {
                setMode("text");
                resetMedia();
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${mode === "text"
                ? "bg-white text-black shadow-lg"
                : "text-gray-400 hover:text-white"
                }`}
            >
              <Type size={16} /> Text
            </button>
            <label
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${mode === "media"
                ? "bg-white text-black shadow-lg"
                : "text-gray-400 hover:text-white"
                }`}
            >
              <input
                onChange={handleMediaUpload}
                type="file"
                accept="image/*, video/*"
                className="hidden"
              />
              <ImageIcon size={16} /> Media
            </label>
          </div>

          <div className="w-10"></div> {/* Spacer */}
        </div>

        {/* Story Preview Card (9:16 Aspect Ratio) */}
        <div
          className="relative w-full max-w-[360px] aspect-[9/16] rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col transition-all duration-300 transform"
          style={{ background: background }}
        >
          {mode === "text" ? (
            <textarea
              className="w-full h-full bg-transparent text-white text-3xl font-bold p-8 text-center resize-none outline-none placeholder-white/50 flex flex-col justify-center items-center"
              placeholder="Tap to type..."
              onChange={(e) => setText(e.target.value)}
              value={text}
              autoFocus
            />
          ) : (
            media && previewUrl ? (
              media.type.startsWith("image") ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <video
                  src={previewUrl}
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                />
              )
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-white/50 gap-4">
                <ImageIcon size={48} className="opacity-50" />
                <p>Select media to preview</p>
              </div>
            )
          )}
        </div>

        {/* Bottom Controls */}
        <div className="w-full max-w-[360px] mt-6 flex flex-col gap-4">
          {/* Color Picker (Only for Text Mode) */}
          {mode === "text" && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar px-2">
              <div className="p-2 bg-white/10 rounded-full">
                <Palette size={20} className="text-white" />
              </div>
              {gradients.map((gradient, index) => (
                <button
                  key={index}
                  className={`size-8 rounded-full border-2 transition-transform hover:scale-110 shrink-0 ${background === gradient ? "border-white scale-110" : "border-transparent"
                    }`}
                  style={{ background: gradient }}
                  onClick={() => setBackground(gradient)}
                />
              ))}
            </div>
          )}

          {/* Create Button */}
          <button
            onClick={handleCreateStory}
            disabled={loading}
            className="w-full py-4 rounded-xl bg-white text-black font-bold text-lg shadow-lg hover:bg-gray-100 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="animate-pulse">Sharing...</span>
            ) : (
              <>
                <Send size={20} className="fill-black" /> Share Story
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default StoryModel;
