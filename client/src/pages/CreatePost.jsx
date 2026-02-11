import React, { useState } from "react";
import { Image, X, Wand2 } from "lucide-react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios.js";
import { useNavigate } from "react-router-dom";

const CreatePost = () => {
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAiPrompt, setShowAiPrompt] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");

  const user = useSelector((state) => state.user.value);
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const handleAiGenerate = async () => {
    if (!aiPrompt) return toast.error("Please enter a prompt");
    try {
      setLoading(true);
      const token = await getToken();
      const { data } = await api.post(
        "/api/post/generate-caption",
        { prompt: aiPrompt },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setContent(data.caption);
        setShowAiPrompt(false);
        setAiPrompt("");
        toast.success("AI Caption Generated");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!images.length && !content) {
      return toast.error("Please add at least one image or text");
    }
    setLoading(true);

    const postType =
      images.length && content
        ? "text_with_image"
        : images.length
          ? "image"
          : "text";

    try {
      const formData = new FormData();
      formData.append("content", content);
      formData.append("post_type", postType);
      images.map((image) => {
        formData.append("images", image);
      });

      const token = await getToken();
      const { data } = await api.post("/api/post/add", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        navigate("/");
      } else {
        console.log(data.message);
        throw new Error(data.message);
      }
    } catch (error) {
      console.log(error.message);
      throw new Error(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-6xl mx-auto p-6">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Create Post
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Share your thoughts with the world
          </p>
        </div>

        {/* Form */}
        <div className="max-w-xl bg-white dark:bg-slate-900 p-4 sm:p-8 rounded-xl shadow-md space-y-4 border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="flex items-center gap-3">
            <img
              src={user.profile_picture}
              className="aspect-square object-cover size-12 rounded-full shadow"
              alt=""
            />
            <div>
              <h2 className="font-semibold dark:text-white">
                {user.full_name}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                @{user.username}
              </p>
            </div>
          </div>

          {/* Text Area */}
          <textarea
            onChange={(e) => setContent(e.target.value)}
            value={content}
            className="w-full resize-none max-h-20 mt-4 text-sm outline-none placeholder-gray-400 dark:bg-slate-900 dark:text-white"
            placeholder="What's happening?"
          />

          {/* Image */}
          {images.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {images.map((image, i) => (
                <div key={i} className=" relative group">
                  <img
                    src={URL.createObjectURL(image)}
                    className="h-20 rounded-md"
                    alt=""
                  />
                  <div
                    onClick={() =>
                      setImages(images.filter((_, index) => index !== i))
                    }
                    className=" absolute hidden group-hover:flex justify-center items-center top-0 right-0 bottom-0 left-0 bg-black/40 rounded-md cursor-pointer"
                  >
                    <X className="size-6 text-white" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bootom Bar */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-300 dark:border-gray-700">
            <div className="flex gap-4">
              <label
                htmlFor="images"
                className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition cursor-pointer"
              >
                <Image className="size-6" />
              </label>

              <button
                onClick={() => setShowAiPrompt(!showAiPrompt)}
                className="flex items-center gap-2 text-sm bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-full hover:bg-indigo-100 dark:hover:bg-slate-700 transition-all active:scale-95 cursor-pointer border border-indigo-200 dark:border-indigo-900 shadow-sm"
              >
                <Wand2 className="size-4" />
                <span className="hidden sm:block font-medium">
                  AI Caption
                </span>
              </button>
            </div>

            <input
              type="file"
              id="images"
              accept="image/*"
              hidden
              multiple
              onChange={(e) => setImages([...images, ...e.target.files])}
            />

            <button
              disabled={loading}
              onClick={() =>
                toast.promise(handleSubmit(), {
                  loading: "uploading...",
                  success: <p>Post Uploaded</p>,
                  error: <p>Post Not Uploaded</p>,
                })
              }
              className="text-sm bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition text-white font-medium px-8 py-2 rounded-md cursor-pointer"
            >
              Publish Post
            </button>
          </div>

          {showAiPrompt && (
            <div className="flex items-center gap-2 mt-4 p-3 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-800 border border-indigo-100 dark:border-indigo-900 animate-fadeInUp">
              <Wand2 className="size-5 text-indigo-500 animate-pulse" />
              <input
                type="text"
                placeholder="Describe your vibe for AI magic..."
                className="w-full text-sm bg-transparent border-none outline-none text-slate-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAiGenerate()}
                autoFocus
              />
              <button
                onClick={handleAiGenerate}
                disabled={loading}
                className="bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 font-medium px-4 py-1.5 rounded-lg text-xs shadow-sm hover:shadow-md transition-all active:scale-95"
              >
                {loading ? "Magic..." : "Generate"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
