
import { Calendar, MapPin, PenBox, Verified, MapPin as LocationIcon } from "lucide-react";
import moment from "moment";
import React from "react";

const UserProfileInfo = ({ user, posts, isOwnProfile, setShowEdit, checkVibe, vibeLoading, onFollowersClick, onFollowingClick }) => {
  return (
    <div className="relative">
      <div className="flex flex-col md:flex-row items-end md:items-end gap-6 mb-4">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="size-32 md:size-40 rounded-full border-4 border-white dark:border-slate-950 bg-white dark:bg-slate-900 shadow-lg overflow-hidden">
            <img
              src={user.profile_picture}
              className="w-full h-full object-cover"
              alt=""
            />
          </div>
        </div>

        {/* Action Buttons (Right side on Desktop) */}
        <div className="flex-1 w-full md:w-auto flex justify-end mb-4 md:mb-8">
          {isOwnProfile ? (
            <button
              onClick={() => setShowEdit(true)}
              className="flex items-center gap-2 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-slate-800 text-slate-700 dark:text-white px-4 py-2 font-semibold transition-all rounded-full shadow-sm"
            >
              Edit Profile
            </button>
          ) : (
            <button
              onClick={checkVibe}
              disabled={vibeLoading}
              className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2 font-bold transition-all rounded-full shadow hover:opacity-90 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {vibeLoading ? (
                <span className="animate-spin text-lg">⚡</span>
              ) : (
                <>
                  Check Vibe ⚡
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* User Info Text */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
            {user.full_name}
          </h1>
          <Verified className="size-6 text-blue-500 fill-blue-50 dark:fill-slate-900" />
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-base">
          {user.username ? `@${user.username}` : ""}
        </p>
      </div>

      {/* Bio */}
      {user.bio && (
        <p className="text-slate-800 dark:text-gray-200 text-base leading-relaxed max-w-2xl mb-5">
          {user.bio}
        </p>
      )}

      {/* Meta Info */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500 dark:text-gray-400 mb-6">
        {user.location && (
          <span className="flex items-center gap-1.5">
            <LocationIcon className="size-4" />
            {user.location}
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <Calendar className="size-4" />
          Joined {moment(user.createdAt).format("MMMM YYYY")}
        </span>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 md:gap-8">
        <div className="flex items-center gap-1.5 cursor-pointer hover:underline decoration-slate-400">
          <span className="text-lg font-bold text-slate-900 dark:text-white">
            {posts.length}
          </span>
          <span className="text-slate-600 dark:text-gray-400">
            Posts
          </span>
        </div>
        <div className="flex items-center gap-1.5 cursor-pointer hover:underline decoration-slate-400" onClick={onFollowersClick}>
          <span className="text-lg font-bold text-slate-900 dark:text-white">
            {user.followers.length}
          </span>
          <span className="text-slate-600 dark:text-gray-400">
            Followers
          </span>
        </div>
        <div className="flex items-center gap-1.5 cursor-pointer hover:underline decoration-slate-400" onClick={onFollowingClick}>
          <span className="text-lg font-bold text-slate-900 dark:text-white">
            {user.following.length}
          </span>
          <span className="text-slate-600 dark:text-gray-400">
            Following
          </span>
        </div>
      </div>
    </div>
  );
};

export default UserProfileInfo;
