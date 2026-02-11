
import React, { useEffect, useRef, useState } from "react";
import { ImageIcon, SendHorizonal, Phone, Video, ArrowLeft } from "lucide-react";
import moment from "moment";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios.js";
import {
  addMessage,
  fetchMessages,
  resetMessages,
} from "../features/messages/messagesSlice.js";
import { toast } from "react-hot-toast";

const ChatBox = () => {
  const { messages } = useSelector((state) => state.messages);
  const { userId } = useParams();
  const { getToken } = useAuth();
  const dispatch = useDispatch();

  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [user, setUser] = useState(null);
  const messagesEndRef = useRef(null);

  const connections = useSelector((state) => state.connections.connections);

  const fetchUserMessages = async () => {
    try {
      const token = await getToken();
      dispatch(fetchMessages({ token, userId }));
    } catch (error) {
      toast.error(error.message);
    }
  };

  const sendMessage = async () => {
    try {
      if (!text && !image) return;

      const token = await getToken();
      const formData = new FormData();

      formData.append("to_user_id", userId);
      formData.append("text", text);
      image && formData.append("image", image);

      const { data } = await api.post("/api/message/send", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setText("");
        setImage(null);
        dispatch(addMessage(data.message));
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchUserMessages();


    return () => {
      dispatch(resetMessages());
    };
  }, [userId]);

  useEffect(() => {
    if (connections.length > 0) {
      const user = connections.find((connection) => connection._id === userId);
      setUser(user);
    }
  }, [connections, userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    user && (
      <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950">
        <div className="flex items-center justify-between p-3 md:px-6 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800 shadow-sm z-10">
          <div className="flex items-center gap-3">
            <Link to="/messages" className="md:hidden">
              <ArrowLeft className="text-slate-600 dark:text-gray-300" />
            </Link>
            <div className="relative">
              <img
                src={user.profile_picture}
                className="size-10 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                alt=""
              />
              <div className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-900"></div>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-white leading-tight">
                {user.full_name}
              </h3>
              <p className="text-xs text-green-500 font-medium">Online</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-slate-500 dark:text-gray-400">
            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition cursor-pointer" onClick={() => toast.success("Voice Call coming soon!")}>
              <Phone size={20} />
            </button>
            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition cursor-pointer" onClick={() => toast.success("Video Call coming soon!")}>
              <Video size={22} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 custom-scrollbar bg-slate-50 dark:bg-slate-950">
          {messages
            .toSorted((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
            .map((message, index) => {
              const isMyMessage = message.from_user_id === userId || message.from_user_id?._id === userId; // Handle population if needed
              // Actually, current implementation: message.to_user_id check is used to determine side.
              // Original: message.to_user_id !== user._id ? "items-start" : "items-end"
              // `user` state is the OTHER person.
              // So if message to OTHER person, it is SENT by me. So items-end.
              // Wait. 
              // userId from params is the OTHER person's ID.
              // Logged in user ID is in Redux or Token.
              // Original code: `message.to_user_id !== user._id`
              // `user._id` is the OTHER person.
              // If to_user_id IS NOT the OTHER person, it means it is TO ME. So RECEIVE.
              // Wait, logic in original code:
              // `message.to_user_id !== user._id` ? "items-start" : "items-end"
              // If to_user_id (recipient) is NOT the chat partner, then recipient is ME.
              // If recipient is ME, it should be LEFT (start).
              // If recipient is PARTNER, it should be RIGHT (end).
              // Logic seems correct.

              const isMe = message.to_user_id === user._id;

              return (
                <div
                  key={index}
                  className={`flex flex-col ${!isMe ? "items-start" : "items-end"}`}
                >
                  <div
                    className={`relative px-4 py-2 max-w-[75%] md:max-w-md break-words rounded-2xl shadow-sm text-[15px] 
                      ${!isMe
                        ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-gray-100 rounded-bl-sm border border-gray-100 dark:border-gray-700"
                        : "bg-indigo-600 text-white rounded-br-sm"
                      }`}
                  >
                    {message.message_type === "image" && (
                      <img
                        src={message.media_url}
                        className="w-full rounded-lg mb-2 mt-1 max-h-60 object-cover"
                        alt="Shared media"
                      />
                    )}
                    <p className="leading-relaxed">{message.text}</p>
                    <p className={`text-[10px] mt-1 text-right opacity-70 ${!isMe ? "text-gray-400" : "text-indigo-100"}`}>
                      {moment(message.createdAt).format("h:mm A")}
                    </p>
                  </div>
                </div>
              )
            })}

          <div ref={messagesEndRef} />
        </div>

        <div className="px-4">
          <div className="flex items-center gap-3 pl-5 p-1.5 bg-white dark:bg-slate-900 w-full max-w-xl mx-auto border border-gray-300 dark:border-gray-700 shadow rounded-full mb-5">
            <input
              type="text"
              className="flex-1 outline-none text-slate-700 dark:text-white bg-transparent"
              placeholder="Type a message..."
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              onChange={(e) => setText(e.target.value)}
              value={text}
            />

            <label htmlFor="image">
              {image ? (
                <img
                  src={URL.createObjectURL(image)}
                  className="h-8 rounded"
                  alt=""
                />
              ) : (
                <ImageIcon className="size-7 text-gray-400 dark:text-gray-500 cursor-pointer" />
              )}
              <input
                type="file"
                id="image"
                accept="image/*"
                hidden
                onChange={(e) => setImage(e.target.files[0])}
              />
            </label>

            <button
              onClick={sendMessage}
              className="bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 cursor-pointer text-white p-2 rounded-full transition-all duration-300"
            >
              <SendHorizonal size={18} />
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default ChatBox;
