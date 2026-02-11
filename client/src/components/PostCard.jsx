
import { BadgeCheck, Heart, MessageCircle, Share2 } from "lucide-react";
import React, { useState } from "react";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios.js";
import toast from "react-hot-toast";

const PostCard = ({ post }) => {
  const postWithHashtags = post.content.replace(
    /(#\w+)/g,
    '<span class="text-blue-600 dark:text-blue-400 font-medium">$1</span>'
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

  return (
    <div className="bg-white dark:bg-slate-900 border border-transparent dark:border-gray-700 rounded-xl shadow p-4 space-y-4 w-full max-w-2xl animate-fadeInUp">
      {/* User Info */}
      <div
        onClick={() => navigate(`/profile/${post.user._id}`)}
        className="inline-flex items-center gap-3 cursor-pointer"
      >
        <img
          src={post.user.profile_picture}
          alt=""
          className="aspect-square object-cover w-10 h-10 rounded-full shadow"
        />
        <div>
          <div className="flex items-center space-x-1">
            <span className="dark:text-white">{post.user.full_name}</span>
            <BadgeCheck className="size-4 text-blue-500" />
          </div>
          <div className="text-gray-500 text-sm">
            @{post.user.username} • {moment(post.createdAt).fromNow()}
          </div>
        </div>
      </div>

      {/* Content */}
      {post.content && (
        <div
          className="text-gray-800 dark:text-gray-100 text-sm whitespace-pre-line"
          dangerouslySetInnerHTML={{ __html: postWithHashtags }}
        />
      )}

      {/* Images */}
      <div className="grid grid-cols-2 gap-2">
        {post.image_urls.map((img, index) => (
          <img
            src={img}
            key={index}
            className={`w-full h-48 object-cover rounded-lg ${post.image_urls.length === 1 && "col-span-2 h-auto"}`}
            alt=""
          />
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400 text-sm pt-2 border-t border-gray-300 dark:border-gray-700">
        <div className="flex items-center gap-1 cursor-pointer hover:text-red-500 transition-transform active:scale-110 duration-200" onClick={handleLike}>
          <Heart
            className={`size-5 ${likes.includes(currentUser._id) && "text-red-500 fill-red-500"}`}
          />
          <span>{likes.length}</span>
        </div>
        <div
          className="flex items-center gap-1 cursor-pointer hover:text-blue-500 transition"
          onClick={() => setShowComments(!showComments)}
        >
          <MessageCircle className="size-5" />
          <span>{comments.length}</span>
        </div>
        <div className="flex items-center gap-1 cursor-pointer hover:text-green-500 transition" onClick={handleShare}>
          <Share2 className="size-5" />
          <span>{shares.length}</span>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="pt-2">
          {/* Comment Input */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 border border-gray-300 dark:border-gray-700 bg-transparent dark:text-white rounded-full px-4 py-2 text-sm focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={handleAddComment}
              className="text-indigo-600 font-semibold text-sm disabled:opacity-50"
              disabled={!commentText.trim()}
            >
              Post
            </button>
          </div>

          {/* Comments List */}
          <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
            {comments.map((comment, index) => (
              <div key={index} className="flex gap-2">
                <img
                  src={comment.user.profile_picture}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-2 px-3 flex-1">
                  <p className="font-semibold text-xs dark:text-white">
                    {comment.user.full_name}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {comment.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
