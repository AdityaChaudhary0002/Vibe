import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
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

  const handleSearch = async (e) => {
    if (e.key === "Enter") {
      try {
        setUsers([]);
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
        setLoading(false);
        setInput("");
      } catch (error) {
        toast.error(error.message);
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    getToken().then((token) => {
      dispatch(fetchUser(token));
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-6xl mx-auto p-6">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Discover People
          </h1>
          <p className="text-slate-600 dark:text-gray-400">
            Connect with amazing people and grow your network
          </p>
        </div>

        {/* Search */}
        <div className="mb-8 shadow-md rounded-md border border-slate-200/60 dark:border-gray-700 bg-white/80 dark:bg-slate-900">
          <div className="p-6">
            <div className=" relative">
              <Search className=" absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 size-5" />
              <input
                type="text"
                onChange={(e) => setInput(e.target.value)}
                value={input}
                onKeyUp={handleSearch}
                className="pl-10 sm:pl-12 w-full py-2 border border-gray-300 dark:border-gray-600 dark:bg-slate-800 dark:text-white rounded-md max-sm:text-sm focus:outline-none focus:border-indigo-500"
                placeholder="Search people by name, username, bio or location..."
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-6">
          {users.map((user) => (
            <UserCard key={user._id} user={user} />
          ))}
        </div>

        {loading && <Loading height="60vh" />}
      </div>
    </div>
  );
};

export default Discover;
