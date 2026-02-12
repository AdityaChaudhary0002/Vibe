import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageSquare,
  User,
  UserCheck,
  UserPlus,
  UserRoundPen,
  Search,
  Filter
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useAuth } from "@clerk/clerk-react";
import { fetchConnections } from "../features/connections/connectionSlice.js";
import api from "../api/axios.js";
import toast from "react-hot-toast";

const Connections = () => {
  const { connections, pendingConnections, followers, following } = useSelector(
    (state) => state.connections
  );
  const { getToken } = useAuth();
  const dispatch = useDispatch();

  const [currentTab, setCurrentTab] = useState("Followers");
  const navigate = useNavigate();

  const dataArray = [
    { label: "Followers", value: followers, icon: User, color: "from-blue-500 to-cyan-400" },
    { label: "Following", value: following, icon: UserCheck, color: "from-purple-500 to-pink-500" },
    { label: "Pending", value: pendingConnections, icon: UserRoundPen, color: "from-amber-400 to-orange-500" },
    { label: "Connections", value: connections, icon: UserPlus, color: "from-emerald-400 to-green-500" },
  ];

  const handleUnfollow = async (userId) => {
    try {
      const token = await getToken();
      const { data } = await api.post(
        "/api/user/unfollow",
        { id: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success(data.message);
        dispatch(fetchConnections(token));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const acceptConnection = async (userId) => {
    try {
      const token = await getToken();
      const { data } = await api.post(
        "/api/user/accept",
        { id: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success(data.message);
        dispatch(fetchConnections(token));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    getToken().then((token) => {
      dispatch(fetchConnections(token));
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-6xl mx-auto p-4 md:p-8">

        {/* Header Section */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter drop-shadow-sm">
            Networking Hub
          </h1>
          <p className="text-slate-600 dark:text-gray-400 text-lg">
            Manage your network and discover new opportunities.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
          {dataArray.map((item, index) => (
            <div
              key={index}
              onClick={() => setCurrentTab(item.label)}
              className={`relative overflow-hidden cursor-pointer group p-6 rounded-2xl border transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl
                ${currentTab === item.label
                  ? "bg-white dark:bg-slate-900 border-indigo-500 dark:border-indigo-500/50 shadow-lg ring-2 ring-indigo-500/20"
                  : "bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 shadow-sm hover:border-gray-200 dark:hover:border-slate-700"
                }`}
            >
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${item.color} opacity-10 rounded-bl-full transition-opacity group-hover:opacity-20`} />

              <div className="relative z-10 flex flex-col items-start">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${item.color} text-white mb-3 shadow-md`}>
                  <item.icon size={20} />
                </div>
                <h3 className="text-3xl font-bold text-slate-800 dark:text-gray-100">
                  {item.value.length}
                </h3>
                <p className="text-sm font-medium text-slate-500 dark:text-gray-400 mt-1">
                  {item.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters/Tabs Toolbar (Hidden on mobile if using grid above as tabs, but keeping for clarity) */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1.5 rounded-xl border border-gray-200 dark:border-slate-800">
            {dataArray.map((tab) => (
              <button
                key={tab.label}
                onClick={() => setCurrentTab(tab.label)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${currentTab === tab.label
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Placeholder */}
          {/* <div className="relative w-full md:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-4" />
                <input type="text" placeholder="Search connections..." className="pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg text-sm outline-none focus:ring-2 ring-indigo-500/20 w-full" />
            </div> */}
        </div>


        {/* Grid List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dataArray
            .find((item) => item.label === currentTab)
            .value.map((user) => (
              <div key={user._id} className="group bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 hover:border-indigo-100 dark:hover:border-indigo-900/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className="flex items-start justify-between mb-4">
                  <img
                    src={user.profile_picture}
                    alt=""
                    className="size-16 rounded-full object-cover border-4 border-slate-50 dark:border-slate-950 shadow-sm group-hover:scale-105 transition-transform duration-300"
                  />
                  {currentTab === "Connections" && (
                    <button
                      onClick={() => navigate(`/messages/${user._id}`)}
                      className="p-2 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-slate-700 transition"
                    >
                      <MessageSquare size={18} />
                    </button>
                  )}
                </div>

                <div>
                  <h4 className="text-lg font-bold text-slate-800 dark:text-gray-100 mb-1 leading-tight">
                    {user.full_name}
                  </h4>
                  <p className="text-sm text-indigo-500 dark:text-indigo-400 font-medium mb-3">
                    @{user.username}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-gray-400 line-clamp-2 h-10 mb-5">
                    {user.bio || "No bio available"}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-slate-800 flex gap-3">
                  <button
                    onClick={() => navigate(`/profile/${user._id}`)}
                    className="flex-1 py-2 px-4 rounded-xl text-sm font-semibold bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                  >
                    Profile
                  </button>

                  {currentTab === "Following" && (
                    <button
                      onClick={() => handleUnfollow(user._id)}
                      className="flex-1 py-2 px-4 rounded-xl text-sm font-semibold bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 transition"
                    >
                      Unfollow
                    </button>
                  )}
                  {currentTab === "Pending" && (
                    <button
                      onClick={() => acceptConnection(user._id)}
                      className="flex-1 py-2 px-4 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 dark:shadow-none transition"
                    >
                      Accept
                    </button>
                  )}
                  {currentTab === "Connections" && (
                    <button
                      onClick={() => navigate(`/messages/${user._id}`)}
                      className="flex-1 py-2 px-4 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 dark:shadow-none transition"
                    >
                      Message
                    </button>
                  )}
                  {currentTab === "Followers" && (
                    <button className="flex-1 py-2 px-4 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-default">
                      Follows You
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Connections;
