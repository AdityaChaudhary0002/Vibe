import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import { useAuth, useUser } from "@clerk/clerk-react";
import api from "../api/axios";
import toast from "react-hot-toast";

const RecentMessages = () => {
  const [messages, setMessages] = useState([]);
  const { user } = useUser();
  const { getToken } = useAuth();

  const fetchRecentMessages = async () => {
    try {
      const token = await getToken();
      const { data } = await api.get("/api/user/recent-messages", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        // Group message by sender and get the latest message for each sender
        const groupedMessages = data.messages.reduce((acc, message) => {
          const senderId = message.from_user_id._id;
          if (
            !acc[senderId] ||
            new Date(message.createdAt) > new Date(acc[senderId].createdAt)
          ) {
            acc[senderId] = message;
          }
          return acc;
        }, {});

        // Sort messages by date
        const sortedMessages = Object.values(groupedMessages).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setMessages(sortedMessages);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRecentMessages();
      setInterval(fetchRecentMessages, 30000);
      return () => {
        clearInterval();
      };
    }
  }, [user]);

  return (
    <div className="max-w-xs w-full bg-white dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800 p-5 rounded-3xl shadow-lg mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-black text-slate-800 dark:text-white tracking-tight">
          Recent Messages
        </h3>
        <Link to="/messages" className="text-xs font-black text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:underline">
          View All
        </Link>
      </div>

      <div className="flex flex-col space-y-2 max-h-64 overflow-y-auto no-scrollbar">
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <Link
              to={`/messages/${message.from_user_id._id}`}
              key={index}
              className="group flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all duration-200"
            >
              <div className="relative shrink-0">
                <img
                  src={message.from_user_id.profile_picture}
                  className="size-10 rounded-full object-cover shadow-sm group-hover:scale-105 transition-transform"
                  alt=""
                />
                {!message.seen && (
                  <div className="absolute -top-1 -right-1 size-3 bg-indigo-500 border-2 border-white dark:border-slate-900 rounded-full" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <p className="text-sm font-bold text-slate-700 dark:text-gray-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {message.from_user_id.full_name}
                  </p>
                  <p className="text-[10px] text-gray-500 font-medium shrink-0">
                    {moment(message.createdAt).fromNow()}
                  </p>
                </div>
                <p className={`text-xs truncate ${!message.seen ? 'font-bold text-slate-800 dark:text-white' : 'text-gray-500'}`}>
                  {message.text || <span className="italic opacity-70">Media shared</span>}
                </p>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center py-6">
            <p className="text-xs text-gray-400">No recent messages</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentMessages;
