
import React, { useEffect, useState } from "react";
import { Search, Sparkles } from "lucide-react";
import UserCard from "../components/UserCard";
import Loading from "../components/Loading";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios.js";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { fetchUser } from "../features/user/userSlice.js";

const Discover = () => {
  const dispatch = useDispatch();
  const [input, setInput] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { getToken } = useAuth();

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (input.trim()) {
        try {
          setLoading(true);
          const token = await getToken();
          const { data } = await api.post(
            "/api/user/discover",
            { input },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          data.success ? setUsers(data.users) : toast.error(data.message);
        } catch (error) {
          toast.error(error.message);
        } finally {
          setLoading(false);
        }
      } else {
        setUsers([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [input]);

  useEffect(() => {
    getToken().then((token) => {
      dispatch(fetchUser(token));
    });
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto p-6 md:p-10">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6 mb-12 animate-fade-in-up">
          <div className="text-center md:text-left">
            <h1 className="text-6xl md:text-7xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter drop-shadow-sm">
              Discover People
            </h1>
            <p className="text-lg text-slate-600 dark:text-gray-400">
              Find your tribe, expand your circle.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto mb-16 relative group z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur opacity-20 group-hover:opacity-30 transition duration-500" />
          <div className="relative flex items-center bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-full shadow-lg p-2 transition-shadow hover:shadow-xl">
            <Search className="ml-4 text-gray-400 size-5" />
            <input
              type="text"
              onChange={(e) => setInput(e.target.value)}
              value={input}
              className="flex-1 bg-transparent border-none outline-none px-4 py-2 text-slate-900 dark:text-white placeholder-gray-400"
              placeholder="Search by name, username, or interest..."
            />
          </div>
        </div>

        {/* Content Grid */}
        <div className="mt-8">
          {loading ? (
            <div className="flex justify-center pt-20">
              <Loading />
            </div>
          ) : (
            <>
              {users.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
                  {users.map((user) => (
                    <UserCard key={user._id} user={user} />
                  ))}
                </div>
              ) : (
                input.trim() ? (
                  <div className="text-center py-20 text-gray-500">
                    No users found matching "{input}"
                  </div>
                ) : (
                  /* Empty State / Suggestions could go here later */
                  <div className="flex flex-col items-center justify-center py-20 opacity-40">
                    <Sparkles className="size-16 text-slate-300 dark:text-slate-700 mb-4" />
                    <p className="text-xl font-medium text-slate-900 dark:text-white">Start typing to explore</p>
                  </div>
                )
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Discover;
