import React, { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios.js";
import toast from "react-hot-toast";
import Loading from "../components/Loading";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { Heart, MessageCircle, UserPlus, Bell } from "lucide-react";

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const { getToken } = useAuth();
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        try {
            const token = await getToken();
            const { data } = await api.get("/api/user/notifications", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (data.success) {
                setNotifications(data.notifications);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const getIcon = (type) => {
        switch (type) {
            case 'like': return <Heart className="size-5 text-red-500 fill-red-500" />;
            case 'comment': return <MessageCircle className="size-5 text-indigo-500 fill-indigo-500" />;
            case 'follow': return <UserPlus className="size-5 text-green-500 fill-green-500" />;
            default: return <Bell className="size-5 text-gray-500" />;
        }
    };

    return loading ? (
        <Loading />
    ) : (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
            <div className="max-w-2xl mx-auto p-4 md:p-8">
                <div className="mb-10">
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter drop-shadow-sm">
                            Notifications
                        </h1>
                        {notifications.some(n => !n.read) && (
                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                                New
                            </span>
                        )}
                    </div>
                    <p className="text-slate-600 dark:text-gray-400 text-lg">
                        Stay updated with your world.
                    </p>
                </div>

                <div className="space-y-3">
                    {notifications.length > 0 ? (
                        notifications.map((notif) => (
                            <div
                                key={notif._id}
                                onClick={() => navigate(`/profile/${notif.sender._id}`)}
                                className={`group flex items-start gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-200 border border-transparent hover:border-gray-200 dark:hover:border-slate-800 hover:shadow-sm ${!notif.read ? "bg-white dark:bg-slate-900" : "hover:bg-white dark:hover:bg-slate-900"
                                    }`}
                            >
                                <div className="relative shrink-0">
                                    <img
                                        src={notif.sender.profile_picture}
                                        className="size-12 rounded-full object-cover border border-gray-100 dark:border-slate-800"
                                        alt=""
                                    />
                                    <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-900 rounded-full p-1 shadow-sm">
                                        {getIcon(notif.type)}
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0 pt-1">
                                    <p className="text-sm text-slate-800 dark:text-gray-200 leading-snug">
                                        <span className="font-bold text-slate-900 dark:text-white mr-1">
                                            {notif.sender.full_name}
                                        </span>
                                        {notif.type === "like" && "liked your post."}
                                        {notif.type === "comment" && <span className="text-slate-600 dark:text-gray-400">commented: "{notif.text}"</span>}
                                        {notif.type === "follow" && "started following you."}
                                        {notif.type === "connection_request" && "sent you a connection request."}
                                    </p>
                                    <p className="text-xs text-slate-400 dark:text-gray-500 mt-1 font-medium">
                                        {moment(notif.createdAt).fromNow()}
                                    </p>
                                </div>

                                {notif.post && notif.post.image_urls.length > 0 && (
                                    <img
                                        src={notif.post.image_urls[0]}
                                        className="size-12 rounded-lg object-cover ml-2 border border-gray-100 dark:border-slate-800"
                                        alt=""
                                    />
                                )}
                                {!notif.read && (
                                    <div className="size-2 bg-indigo-500 rounded-full mt-4 shrink-0" />
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-full mb-4">
                                <Bell className="size-8 text-slate-400" />
                            </div>
                            <p className="text-slate-500 dark:text-gray-400 font-medium">No notifications yet</p>
                            <p className="text-sm text-slate-400">When you interact with others, updates will show here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Notifications;
