
import React, { useState } from "react";
import { Pencil, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "../features/user/userSlice.js";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";

const ProfileModel = ({ setShowEdit }) => {
  const dispatch = useDispatch();
  const { getToken } = useAuth();
  const user = useSelector((state) => state.user.value);

  const [editForm, setEditForm] = useState({
    username: user.username,
    bio: user.bio,
    location: user.location,
    profile_picture: null,
    full_name: user.full_name,
    cover_photo: null,
  });

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const userData = new FormData();
      const {
        full_name,
        username,
        bio,
        location,
        profile_picture,
        cover_photo,
      } = editForm;

      userData.append("username", username);
      userData.append("bio", bio);
      userData.append("location", location);
      userData.append("full_name", full_name);
      profile_picture && userData.append("profile", profile_picture);
      cover_photo && userData.append("cover", cover_photo);

      const token = await getToken();
      dispatch(updateUser({ userData, token }));

      setShowEdit(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-900/50">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Edit Profile
          </h1>
          <button
            onClick={() => setShowEdit(false)}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-slate-800 text-gray-500 dark:text-gray-400 transition"
          >
            <X size={20} />
          </button>
        </div>

        <form
          className="p-6 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar"
          onSubmit={(e) =>
            toast.promise(handleSaveProfile(e), { loading: "Saving..." })
          }
        >
          {/* Images Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profile Picture */}
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Profile Picture
              </span>
              <label
                htmlFor="profile_picture"
                className="relative cursor-pointer group w-24 h-24"
              >
                <img
                  src={
                    editForm.profile_picture
                      ? URL.createObjectURL(editForm.profile_picture)
                      : user.profile_picture
                  }
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover ring-2 ring-gray-100 dark:ring-slate-700 group-hover:opacity-75 transition"
                />
                <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <Pencil className="size-5 text-white" />
                </div>
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  id="profile_picture"
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      profile_picture: e.target.files[0],
                    })
                  }
                />
              </label>
            </div>

            {/* Cover Photo */}
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Cover Photo
              </span>
              <label
                htmlFor="cover_photo"
                className="relative cursor-pointer group w-full h-24"
              >
                <div className="w-full h-24 rounded-lg overflow-hidden ring-1 ring-gray-100 dark:ring-slate-700 bg-gray-100 dark:bg-slate-800">
                  <img
                    src={
                      editForm.cover_photo
                        ? URL.createObjectURL(editForm.cover_photo)
                        : user.cover_photo
                    }
                    className="w-full h-full object-cover group-hover:opacity-75 transition"
                    alt="Cover"
                  />
                </div>

                <div className="absolute inset-0 bg-black/30 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <Pencil className="size-5 text-white" />
                </div>

                <input
                  hidden
                  type="file"
                  accept="image/*"
                  id="cover_photo"
                  onChange={(e) =>
                    setEditForm({ ...editForm, cover_photo: e.target.files[0] })
                  }
                />
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition outline-none"
                placeholder="Your full name"
                onChange={(e) =>
                  setEditForm({ ...editForm, full_name: e.target.value })
                }
                value={editForm.full_name}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Username
              </label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition outline-none"
                placeholder="username"
                onChange={(e) =>
                  setEditForm({ ...editForm, username: e.target.value })
                }
                value={editForm.username}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Bio
              </label>
              <textarea
                rows={3}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition outline-none resize-none"
                placeholder="Tell us about yourself..."
                onChange={(e) =>
                  setEditForm({ ...editForm, bio: e.target.value })
                }
                value={editForm.bio}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Location
              </label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition outline-none"
                placeholder="City, Country"
                onChange={(e) =>
                  setEditForm({ ...editForm, location: e.target.value })
                }
                value={editForm.location}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowEdit(false)}
              className="px-5 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition font-medium shadow-lg shadow-indigo-500/25"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModel;
