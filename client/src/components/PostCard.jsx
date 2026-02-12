

import { BadgeCheck, Heart, MessageCircle, Share2, Trash2, MoreHorizontal, Send } from "lucide-react";
import React, { useState } from "react";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios.js";
import toast from "react-hot-toast";

const PostCard = ({ post, index }) => {
  const postWithHashtags = (post.content || "").replace(
    /(#\w+)/g,
    '<span class="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer">$1</span>'
  );
  const [likes, setLikes] = useState(post.likes_count);
  const [comments, setComments] = useState(post.comments || []);
  const [shares, setShares] = useState(post.shares || []);
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const currentUser = useSelector((state) => state.user.value);

  const navigate = useNavigate();
  const { getToken } = useAuth();

  const handleShare = async () => {
    try {
      const token = await getToken();
      // Copy link to clipboard (simulated share)
      const postLink = `${window.location.origin}/post/${post._id}`;
      navigator.clipboard.writeText(postLink);
      toast.success("Link copied! Share it now 🚀");

      // Call API to increment share count
      const { data } = await api.post(
        "/api/post/share",
        { postId: post._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        if (!shares.includes(currentUser._id)) {
          setShares([...shares, currentUser._id]);
        }
      }
    } catch (error) {
      toast.error("Failed to share");
    }
  };

  const handleLike = async () => {
    try {
      const token = await getToken();
      const { data } = await api.post(
        "/api/post/like",
        { postId: post._id },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.success) {
        toast.success(data.message);
        setLikes((prev) => {
          if (prev.includes(currentUser._id)) {
            return prev.filter((id) => id !== currentUser._id);
          } else {
            return [...prev, currentUser._id];
          }
        });
      } else {
        toast(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    try {
      const token = await getToken();
      const { data } = await api.post(
        "/api/post/comment",
        { postId: post._id, text: commentText },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.success) {
        toast.success(data.message);
        setComments([
          ...comments,
          {
            user: currentUser,
            text: commentText,
            createdAt: new Date(),
          },
        ]);
        setCommentText("");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      const token = await getToken();
      const { data } = await api.post(
        "/api/post/delete",
        { postId: post._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success("Post deleted successfully");
        // Ideally remove from state, but for now reload is safest for consistency across feeds
        window.location.reload();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to delete post");
    }
  };

  const isLiked = likes.includes(currentUser._id);

  return (
    <div className="group bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500 p-5 space-y-4 w-full max-w-2xl animate-fade-in-up">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div
          onClick={() => navigate(`/profile/${post.user._id}`)}
          className="flex items-center gap-3 cursor-pointer"
        >
          <div className="relative">
            <img
              src={post.user.profile_picture}
              alt=""
              className="size-12 rounded-full object-cover ring-2 ring-white dark:ring-slate-800 shadow-md transition-transform group-hover:scale-105"
            />
            {/* Online indicator could go here */}
          </div>
          <div>
            <div className="flex items-center gap-1">
              <h3 className="font-bold text-slate-900 dark:text-white text-base hover:text-indigo-500 transition-colors">
                {post.user.full_name}
              </h3>
              <BadgeCheck className="size-4 text-indigo-500 filled-current" />
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-gray-400">
              @{post.user.username} • {moment(post.createdAt).fromNow()}
            </p>
          </div>
        </div>

        {currentUser._id === post.user._id && (
          <button
            onClick={handleDelete}
            className="p-2 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
            title="Delete Post"
          >
            <Trash2 className="size-4" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="space-y-3">
        {post.content && (
          <div
            className="text-slate-800 dark:text-gray-200 text-base leading-relaxed whitespace-pre-line px-1"
            dangerouslySetInnerHTML={{ __html: postWithHashtags }}
          />
        )}

        {/* Images */}
        {post.image_urls && post.image_urls.length > 0 && (
          <div className={`overflow-hidden rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 mt-2 ${post.image_urls.length > 1 ? "grid grid-cols-2 gap-0.5" : ""}`}>
            {post.image_urls.map((img, idx) => (
              <div
                key={idx}
                className={`relative overflow-hidden ${post.image_urls.length === 1 ? "bg-gray-100 dark:bg-slate-900 flex items-center justify-center max-h-[800px]" : "h-full"
                  }`}
              >
                <img
                  src={img}
                  alt={`Post ${idx + 1}`}
                  onClick={() => {/* Maybe open lightbox */ }}
                  loading={index < 2 ? "eager" : "lazy"}
                  className={`w-full cursor-pointer hover:opacity-95 transition ${post.image_urls.length === 1
                      ? "object-contain h-auto max-h-[800px]"
                      : "object-cover aspect-square h-full"
                    }`}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="pt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 text-sm font-semibold transition-all group/like ${isLiked ? "text-red-500" : "text-slate-500 dark:text-gray-400 hover:text-red-500"
              }`}
          >
            <div className={`p-2 rounded-full transition-all ${isLiked ? "bg-red-50 dark:bg-red-900/20" : "group-hover/like:bg-red-50 dark:group-hover/like:bg-red-900/10"}`}>
              <Heart className={`size-5 transition-transform ${isLiked ? "fill-current scale-110" : "group-hover/like:scale-110"}`} />
            </div>
            <span>{likes.length || "Like"}</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-2 text-sm font-semibold transition-all group/comment text-slate-500 dark:text-gray-400 hover:text-indigo-500`}
          >
            <div className="p-2 rounded-full group-hover/comment:bg-indigo-50 dark:group-hover/comment:bg-indigo-900/10 transition-all">
              <MessageCircle className="size-5 transition-transform group-hover/comment:scale-110" />
            </div>
            <span>{comments.length || "Comment"}</span>
          </button>

          <button
            onClick={handleShare}
            className={`flex items-center gap-2 text-sm font-semibold transition-all group/share text-slate-500 dark:text-gray-400 hover:text-green-500`}
          >
            <div className="p-2 rounded-full group-hover/share:bg-green-50 dark:group-hover/share:bg-green-900/10 transition-all">
              <Share2 className="size-5 transition-transform group-hover/share:scale-110" />
            </div>
            <span>{shares.length || "Share"}</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="pt-4 animate-fade-in space-y-4">

          <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
            {comments.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-2">No comments yet. Be the first!</p>
            ) : (
              comments.map((comment, index) => (
                <div key={index} className="flex gap-3 items-start group/comment-item">
                  <img
                    src={comment.user.profile_picture}
                    alt=""
                    className="size-8 rounded-full object-cover mt-1"
                  />
                  <div className="flex-1 bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-3 px-4">
                    <div className="flex items-baseline justify-between">
                      <h4 className="font-bold text-sm text-slate-800 dark:text-white">
                        {comment.user.full_name}
                      </h4>
                      <span className="text-[10px] text-gray-400">{moment(comment.createdAt).fromNow(true)}</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-gray-300 mt-0.5">
                      {comment.text}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Comment Input */}
          <div className="flex items-center gap-2 relative">
            <img
              src={currentUser.profile_picture}
              className="size-8 rounded-full object-cover absolute left-2"
              alt=""
            />
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
              placeholder="Write a comment..."
              className="w-full pl-12 pr-12 py-3 bg-gray-100 dark:bg-slate-800 border-none rounded-full text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all dark:text-white"
            />
            <button
              onClick={handleAddComment}
              disabled={!commentText.trim()}
              className="absolute right-2 p-2 bg-indigo-500 rounded-full text-white hover:bg-indigo-600 disabled:opacity-50 disabled:hover:bg-indigo-500 transition-all active:scale-95"
            >
              <Send className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
