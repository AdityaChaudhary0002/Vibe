
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
    <div className="relative min-h-screen bg-gray-50 dark:bg-slate-950 p-6 pb-24">
      <div className="max-w-3xl mx-auto">
        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-900 border border-transparent dark:border-gray-700 rounded-2xl shadow overflow-hidden">
          {/* Cover Photo */}
          <div className="h-40 md:h-56 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900">
            {user.cover_photo && (
              <img
                src={user.cover_photo}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* User Info */}
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
            <UserListModal
              title={userListModal.title}
              users={userListModal.users}
              onClose={() => setUserListModal({ ...userListModal, isOpen: false })}
            />
          </div>
        )}

        {/* Vibe Check Modal */}
        {vibeResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setVibeResult(null)}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center transform transition-all scale-100" onClick={(e) => e.stopPropagation()}>
              <div className="size-20 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-full mx-auto flex items-center justify-center mb-4 shadow-lg shadow-purple-500/30">
                <span className="text-3xl font-bold text-white">{vibeResult.score}%</span>
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent mb-2">Vibe Match!</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6 italic">"{vibeResult.reason}"</p>
              <button
                onClick={() => setVibeResult(null)}
                className="w-full py-3 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-white font-medium hover:bg-gray-200 dark:hover:bg-slate-700 transition"
              >
                Awesome! 🚀
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mt-6">
          <div className="bg-white dark:bg-slate-900 border border-transparent dark:border-gray-700 rounded-lg shadow p-1 flex max-w-md mx-auto">
            {["posts", "media", "likes"].map((tab) => (
              <button
                onClick={() => setActiveTab(tab)}
                key={tab}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${activeTab === tab
                  ? "bg-indigo-600 text-white"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Posts */}
          {activeTab === "posts" && (
            <div className="mt-6 flex flex-col items-center gap-6">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          )}

          {/* Media */}
          {activeTab === "media" && (
            <div className="flex flex-wrap mt-6 max-w-6xl">
              {posts
                .filter((post) => post.image_urls.length > 0)
                .map((post) => (
                  <React.Fragment key={post._id}>
                    {post.image_urls.map((image, index) => (
                      <Link
                        target="_blank"
                        to={image}
                        key={index}
                        className=" relative group"
                      >
                        <img
                          src={image}
                          key={index}
                          loading="lazy"
                          className="w-64 aspect-video object-cover"
                          alt=""
                        />
                        <p className=" absolute bottom-0 right-0 text-xs p-1 px-3 backdrop-blur-xl text-white opacity-0 group-hover:opacity-100 transition duration-300">
                          Posted {moment(post.createdAt).fromNow()}
                        </p>
                      </Link>
                    ))}
                  </React.Fragment>
                ))}
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
