import React, { useState } from "react";
import { Eye, MessageSquare, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const Message = () => {
  const { connections } = useSelector((state) => state.connections);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredConnections = connections.filter(user =>
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen relative bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-6xl mx-auto p-6 md:p-10">

        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter drop-shadow-sm">
              Messages
            </h1>
            <p className="text-slate-600 dark:text-gray-400 text-lg">
              Connect instantly with your circle.
            </p>
          </div>

          <div className="relative w-full md:w-96 group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur opacity-10 group-focus-within:opacity-20 transition duration-300" />
            <div className="relative bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl flex items-center p-3 shadow-sm group-focus-within:shadow-md transition-all">
              <Search className="text-gray-400 size-5 ml-2" />
              <input
                type="text"
                placeholder="Search for friends..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent border-none outline-none pl-3 text-slate-800 dark:text-white placeholder-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Connected Users Grid */}
        {filteredConnections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredConnections.map((user) => (
              <div
                key={user._id}
                className="group relative bg-white dark:bg-slate-900/80 backdrop-blur-sm border border-gray-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={user.profile_picture}
                      className="size-16 object-cover rounded-full shadow-md border-2 border-white dark:border-slate-800"
                      alt=""
                    />
                    <div className="absolute bottom-0 right-0 size-4 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full" title="Online" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white truncate">
                      {user.full_name}
                    </h3>
                    <p className="text-sm text-indigo-500 dark:text-indigo-400 font-medium truncate">
                      @{user.username}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-gray-500 mt-1 line-clamp-1">
                      {user.bio || "Available for chat"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-slate-800/50">
                  <button
                    onClick={() => navigate(`/messages/${user._id}`)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-95"
                  >
                    <MessageSquare className="size-4" />
                    Chat
                  </button>

                  <button
                    onClick={() => navigate(`/profile/${user._id}`)}
                    className="size-11 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                    title="View Profile"
                  >
                    <Eye className="size-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="inline-block p-4 rounded-full bg-slate-100 dark:bg-slate-900 mb-4">
              <MessageSquare className="size-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 dark:text-white mb-2">No connections found</h3>
            <p className="text-slate-500 dark:text-gray-400">Try searching for a different name or go discover new people.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;
