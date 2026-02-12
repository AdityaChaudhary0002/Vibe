
import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import Loading from "../components/Loading";
import UserProfileInfo from "../components/UserProfileInfo";
import PostCard from "../components/PostCard";
import moment from "moment";
import ProfileModel from "../components/ProfileModel";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios.js";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import UserListModal from "../components/UserListModal";
import { Grid, Image, Heart } from "lucide-react";

const Profile = () => {
  const currentUser = useSelector((state) => state.user.value);

  const { getToken } = useAuth();
  const { profileId } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("posts");
  const [showEdit, setShowEdit] = useState(false);

  // Vibe & List Modal States
  const [vibeResult, setVibeResult] = useState(null);
  const [vibeLoading, setVibeLoading] = useState(false);
  const [userListModal, setUserListModal] = useState({ isOpen: false, title: "", users: [] });

  const fetchUser = async (profileId) => {
    const token = await getToken();
    try {
      const { data } = await api.post(
        `/api/user/profiles`,
        { profileId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (data.success) {
        setUser(data.profile);
        setPosts(data.posts);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (profileId) {
      fetchUser(profileId);
    } else {
      fetchUser(currentUser._id);
    }
  }, [profileId, currentUser]);

  const isOwnProfile = !profileId || profileId === currentUser._id;

  const checkVibe = async () => {
    if (vibeLoading) return;
    setVibeLoading(true);
    const token = await getToken();
    try {
      const { data } = await api.post(
        "/api/user/vibe-match",
        { profileId: user._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setVibeResult(data);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to check vibe");
    }
    setVibeLoading(false);
  };

  const openFollowers = () => {
    setUserListModal({ isOpen: true, title: "Followers", users: user.followers });
  };

  const openFollowing = () => {
    setUserListModal({ isOpen: true, title: "Following", users: user.following });
  };


  return user ? (
    <div className="relative min-h-screen bg-white dark:bg-slate-950 pb-20">

      {/* Cover Photo */}
      <div className="relative h-48 md:h-64 w-full bg-slate-200 dark:bg-slate-800">
        {user.cover_photo ? (
          <img src={user.cover_photo} className="w-full h-full object-cover" alt="Cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500" />
        )}
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Profile Header Content */}
        <div className="relative -mt-16 md:-mt-20 mb-6">
          <UserProfileInfo
            user={user}
            posts={posts}
            isOwnProfile={isOwnProfile}
            setShowEdit={setShowEdit}
            checkVibe={checkVibe}
            vibeLoading={vibeLoading}
            onFollowersClick={openFollowers}
            onFollowingClick={openFollowing}
          />
        </div>

        {/* User List Modal */}
        {userListModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setUserListModal({ ...userListModal, isOpen: false })}>
            <div onClick={(e) => e.stopPropagation()}>
              <UserListModal
                title={userListModal.title}
                users={userListModal.users}
                onClose={() => setUserListModal({ ...userListModal, isOpen: false })}
              />
            </div>
          </div>
        )}

        {/* Vibe Check Modal */}
        {vibeResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-300" onClick={() => setVibeResult(null)}>
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center border border-white/10 relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-3xl pointer-events-none" />

              <div className="relative z-10">
                <div className="size-24 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-full mx-auto flex items-center justify-center mb-6 shadow-xl shadow-indigo-500/40 ring-4 ring-white dark:ring-slate-800">
                  <span className="text-4xl font-extrabold text-white">{vibeResult.score}%</span>
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent mb-3">Vibe Match!</h2>
                <p className="text-slate-600 dark:text-gray-300 mb-8 text-lg leading-relaxed">"{vibeResult.reason}"</p>
                <button
                  onClick={() => setVibeResult(null)}
                  className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:scale-[1.02] active:scale-95"
                >
                  Awesome! 🚀
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Simple Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 mb-6 sticky top-0 bg-white dark:bg-slate-950 z-20 pt-2">
          {[
            { id: "posts", label: "Posts", icon: Grid },
            { id: "media", label: "Media", icon: Image },
            { id: "likes", label: "Liked", icon: Heart }
          ].map((tab) => (
            <button
              onClick={() => setActiveTab(tab.id)}
              key={tab.id}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-all relative ${activeTab === tab.id
                ? "text-slate-900 dark:text-white"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                }`}
            >
              <tab.icon className={`size-4 ${activeTab === tab.id ? "text-slate-900 dark:text-white" : ""}`} />
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 w-12 h-1 bg-indigo-600 rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="animate-fade-in min-h-[300px]">
          {activeTab === "posts" && (
            <div className="flex flex-col items-center gap-6">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))
              ) : (
                <div className="text-center py-20 opacity-60">
                  <Grid className="size-12 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
                  <p className="text-lg font-medium text-gray-500">No posts yet</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "media" && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
              {posts
                .filter((post) => post.image_urls.length > 0)
                .map((post) => (
                  <React.Fragment key={post._id}>
                    {post.image_urls.map((image, index) => (
                      <Link
                        target="_blank"
                        to={image}
                        key={`${post._id}-${index}`}
                        className="block relative group aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden"
                      >
                        <img
                          src={image}
                          loading="lazy"
                          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                          alt=""
                        />
                      </Link>
                    ))}
                  </React.Fragment>
                ))}
              {posts.filter(p => p.image_urls.length > 0).length === 0 && (
                <div className="text-center py-20 opacity-60 col-span-full w-full">
                  <Image className="size-12 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
                  <p className="text-lg font-medium text-gray-500">No media shared</p>
                </div>
              )}
            </div>
          )}
          {activeTab === "likes" && (
            <div className="text-center py-20 opacity-60">
              <Heart className="size-12 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
              <p className="text-lg font-medium text-gray-500">Liked posts</p>
            </div>
          )}
        </div>

      </div>
      {/* Edit Profile Model */}
      {showEdit && <ProfileModel setShowEdit={setShowEdit} />}
    </div>
  ) : (
    <Loading />
  );
};

export default Profile;
