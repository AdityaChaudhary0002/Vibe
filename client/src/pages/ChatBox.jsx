import React, { useEffect, useRef, useState } from "react";
import { ImageIcon, SendHorizonal, Phone, Video, ArrowLeft, Trash2, Mic, Sparkles } from "lucide-react";
import moment from "moment";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios.js";
import {
  addMessage,
  fetchMessages,
  resetMessages,
  deleteMessageFromState,
} from "../features/messages/messagesSlice.js";
import { toast } from "react-hot-toast";

const ChatBox = () => {
  const { messages } = useSelector((state) => state.messages);
  const { userId } = useParams();
  const { getToken, userId: senderId } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const sendCallMessage = async (text) => {
    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append("to_user_id", userId);
      formData.append("text", text);
      const { data } = await api.post("/api/message/send", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        dispatch(addMessage(data.message));
      }
    } catch (error) {
      toast.error("Failed to send call invite");
    }
  };

  const handleVideoCall = () => {
    const roomId = [senderId, userId].sort().join('_');
    sendCallMessage(`[VIDEO_CALL|${roomId}]`);
    navigate(`/room/${roomId}`);
  };

  const handleVoiceCall = () => {
    const roomId = [senderId, userId].sort().join('_');
    sendCallMessage(`[VOICE_CALL|${roomId}]`);
    navigate(`/room/${roomId}?type=voice`);
  };

  /* AI Voice & Translation State */
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const handleMicClick = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await handleTranscribe(audioBlob);
        stream.getTracks().forEach((track) => track.stop()); // Stop mic
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast("Listening...", { icon: "🎙️" });
    } catch (error) {
      console.error("Error accessing mic:", error);
      toast.error("Mic Access Error: " + (error.message || "Unknown error"));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleTranscribe = async (audioBlob) => {
    const loadingToast = toast.loading("Processing voice...");
    try {
      const formData = new FormData();
      // Create a file from blob
      const file = new File([audioBlob], "recording.webm", { type: "audio/webm" });
      formData.append("audio", file);

      const token = await getToken();
      const { data } = await api.post("/api/ai/transcribe", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        },
      });

      if (data.success) {
        setText((prev) => prev + " " + data.text); // Append text
        toast.success("Voice transcribed!", { id: loadingToast });
      } else {
        toast.error("Transcription failed: " + (data.message || "Unknown error"), { id: loadingToast });
      }
    } catch (error) {
      console.error("Transcription API Error:", error);
      toast.error("Process Error: " + (error.response?.data?.message || error.response?.data?.error || error.message), { id: loadingToast });
    }
  };

  const handleTranslate = async () => {
    if (!text.trim()) return;
    const loadingToast = toast.loading("Translating...");
    try {
      const token = await getToken();
      const { data } = await api.post("/api/ai/translate", { text }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success) {
        setText(data.translation);
        toast.success("Magic Translate! ✨", { id: loadingToast });
      } else {
        toast.error("Translation failed", { id: loadingToast });
      }
    } catch (error) {
      toast.error("Translation error", { id: loadingToast });
    }
  };

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

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm("Delete this message?")) return;

    try {
      const token = await getToken();
      // Optimistic update
      dispatch(deleteMessageFromState(messageId));

      const { data } = await api.post("/api/message/delete", { messageId }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!data.success) {
        toast.error(data.message);
        // Re-fetch or revert if failed? For now, fetch is safer but lazy.
        fetchUserMessages();
      }
    } catch (error) {
      toast.error("Failed to delete message");
      fetchUserMessages();
    }
  }

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
      <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950/50 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100/20 via-slate-50 to-slate-100 dark:from-indigo-950/20 dark:via-slate-950 dark:to-slate-950 transition-colors duration-500">

        {/* Header - Glassmorphic */}
        <div className="sticky top-0 z-50 px-4 py-3 md:px-6 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-slate-800/50 shadow-sm transition-all">
          <div className="flex items-center gap-4">
            <Link
              to="/messages"
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-gray-300 transition md:hidden"
            >
              <ArrowLeft size={20} />
            </Link>

            <div className="relative group cursor-pointer" onClick={() => navigate(`/profile/${user._id}`)}>
              <div className="absolute inset-0 bg-indigo-500 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <img
                src={user.profile_picture}
                className="relative size-11 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-sm"
                alt=""
              />
              <div className="absolute bottom-0 right-0 size-3.5 bg-green-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></div>
            </div>

            <div className="cursor-pointer" onClick={() => navigate(`/profile/${user._id}`)}>
              <h3 className="font-bold text-lg text-slate-800 dark:text-white leading-tight hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                {user.full_name}
              </h3>
              <p className="text-xs text-green-600 dark:text-green-400 font-bold tracking-wide flex items-center gap-1">
                Active Now
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleVoiceCall}
              className="p-3 rounded-full text-slate-500 dark:text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400 transition-all duration-300"
              title="Voice Call"
            >
              <Phone size={20} strokeWidth={2.5} />
            </button>
            <button
              onClick={handleVideoCall}
              className="p-3 rounded-full text-slate-500 dark:text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400 transition-all duration-300"
              title="Video Call"
            >
              <Video size={22} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full opacity-60">
              <div className="size-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="size-10 text-indigo-500" />
              </div>
              <p className="text-slate-500 dark:text-gray-400 font-medium">No messages yet. Start the vibes! ✨</p>
            </div>
          ) : (
            messages
              .toSorted((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
              .map((message, index) => {
                const isMe = message.from_user_id === senderId || message.from_user_id?._id === senderId;
                const isCallEnded = (type, id) => {
                  return messages.some(m => m.text.includes(`🚫 ${type} Call Ended||${id}`));
                };

                return (
                  <div
                    key={index}
                    className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`flex flex-col max-w-[85%] md:max-w-lg group ${isMe ? "items-end" : "items-start"}`}>

                      <div className="flex items-end gap-2">
                        {/* Avatar for receiver (only if not me) */}
                        {!isMe && (
                          <img
                            src={user.profile_picture}
                            className="size-6 rounded-full object-cover mb-1 shadow-sm opacity-80"
                            alt=""
                          />
                        )}

                        <div
                          className={`relative px-5 py-3 shadow-sm text-[15px] leading-relaxed transition-all duration-200
                            ${!isMe
                              ? "bg-white dark:bg-slate-800 text-slate-700 dark:text-gray-100 rounded-2xl rounded-bl-none border border-gray-100 dark:border-slate-700/50"
                              : "bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl rounded-br-none shadow-md shadow-indigo-500/20"
                            }`}
                        >
                          {/* Image Attachment */}
                          {message.message_type === "image" && (
                            <img
                              src={message.media_url}
                              className="w-full rounded-xl mb-3 mt-1 max-h-72 object-cover border border-black/10 dark:border-white/10"
                              alt="Shared media"
                            />
                          )}

                          {/* Call Messages / Text */}
                          {message.text.startsWith("[VIDEO_CALL|") ? (() => {
                            const roomId = message.text.split("|")[1].replace("]", "").trim();
                            const ended = isCallEnded("Video", roomId);
                            return ended ? (
                              <div className="flex items-center gap-2 bg-gray-100/20 backdrop-blur-sm px-4 py-2 rounded-lg font-bold opacity-80">
                                <Video size={18} /> Call Ended
                              </div>
                            ) : (
                              <Link
                                to={`/room/${roomId}`}
                                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg font-bold transition-colors shadow-sm"
                              >
                                <Video size={18} /> Join Video Call
                              </Link>
                            );
                          })() : message.text.startsWith("[VOICE_CALL|") ? (() => {
                            const roomId = message.text.split("|")[1].replace("]", "").trim();
                            const ended = isCallEnded("Voice", roomId);
                            return ended ? (
                              <div className="flex items-center gap-2 bg-gray-100/20 backdrop-blur-sm px-4 py-2 rounded-lg font-bold opacity-80">
                                <Phone size={18} /> Call Ended
                              </div>
                            ) : (
                              <Link
                                to={`/room/${roomId}?type=voice`}
                                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg font-bold transition-colors shadow-sm"
                              >
                                <Phone size={18} /> Join Voice Call
                              </Link>
                            );
                          })() : message.text.includes("Call Ended") ? (
                            <div className="flex items-center gap-2 opacity-90 font-medium">
                              <span className="size-2 bg-red-400 rounded-full animate-pulse"></span>
                              {message.text.split("||")[0]}
                            </div>
                          ) : (
                            <p>{message.text}</p>
                          )}

                          {/* Time & Delete */}
                          <div className={`flex items-center justify-end gap-2 mt-1 -mb-1 ${isMe ? "text-indigo-100" : "text-slate-400"}`}>
                            <span className="text-[10px] font-medium opacity-80">
                              {moment(message.createdAt).format("h:mm A")}
                            </span>
                            {isMe && (
                              <button
                                onClick={() => handleDeleteMessage(message._id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:text-red-200"
                                title="Delete"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-transparent">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-2 pl-4 rounded-3xl shadow-lg shadow-gray-100/50 dark:shadow-slate-900/50 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">

              {/* Actions: Mic & Image */}
              <div className="flex items-center gap-1 pb-2">
                <button
                  onClick={handleMicClick}
                  className={`p-2 rounded-full transition-all duration-300 ${isRecording
                    ? "bg-red-500 text-white animate-pulse shadow-md shadow-red-500/30"
                    : "text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-slate-800"
                    }`}
                  title={isRecording ? "Stop" : "Voice Message"}
                >
                  <Mic size={20} />
                </button>

                <label htmlFor="image" className="cursor-pointer">
                  <div className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-full transition-all">
                    {image ? (
                      <div className="relative">
                        <img src={URL.createObjectURL(image)} className="size-6 rounded object-cover" alt="" />
                        <div className="absolute -top-1 -right-1 size-2 bg-indigo-500 rounded-full border border-white"></div>
                      </div>
                    ) : (
                      <ImageIcon size={20} />
                    )}
                  </div>
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    hidden
                    onChange={(e) => setImage(e.target.files[0])}
                  />
                </label>

                {text.trim() && !isRecording && (
                  <button
                    onClick={handleTranslate}
                    className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-full transition-all"
                    title="Translate"
                  >
                    <Sparkles size={18} />
                  </button>
                )}
              </div>

              {/* Text Input */}
              <textarea
                className="flex-1 bg-transparent border-none outline-none text-slate-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none py-3 min-h-[48px] max-h-32 custom-scrollbar text-sm"
                placeholder={isRecording ? "Listening..." : "Type a message..."}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                onChange={(e) => setText(e.target.value)}
                value={text}
                disabled={isRecording}
                rows={1}
                style={{ height: 'auto', minHeight: '48px' }}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
              />

              {/* Send Button */}
              <button
                onClick={sendMessage}
                disabled={(!text.trim() && !image) || isRecording}
                className="mb-1 p-3 bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 text-white rounded-2xl shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:shadow-none transition-all duration-300"
              >
                <SendHorizonal size={20} strokeWidth={2.5} className={text.trim() ? "translate-x-0.5" : ""} />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );
};
export default ChatBox;
