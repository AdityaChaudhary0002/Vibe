import React, { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios.js";
import toast from "react-hot-toast";
import Loading from "../components/Loading";
import { useNavigate } from "react-router-dom";
import moment from "moment";

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

    return loading ? (
        <Loading />
    ) : (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <div className="max-w-4xl mx-auto p-6">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">
                    Notifications
                </h1>

                <div className="space-y-4">
                    {notifications.length > 0 ? (
                        notifications.map((notif) => (
                            <div
                                key={notif._id}
                                onClick={() => {
                                    if (notif.type === 'like' || notif.type === 'comment') {
                                        // Navigate to post if you have a single post view, or profile for now
                                        navigate(`/profile/${notif.sender._id}`);
                                    } else {
                                        navigate(`/profile/${notif.sender._id}`);
                                    }

                                }}
                                className={`flex items-center gap-4 p-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition ${!notif.read ? "border-l-4 border-l-indigo-500" : ""}`}
                            >
                                <img
                                    src={notif.sender.profile_picture}
                                    className="size-12 rounded-full object-cover"
                                    alt=""
                                />
                                <div className="flex-1">
                                    <p className="text-sm text-gray-800 dark:text-gray-200">
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                            {notif.sender.full_name}
                                        </span>{" "}
                                        {notif.type === "like" && "liked your post"}
                                        {notif.type === "comment" && `commented: "${notif.text}"`}
                                        {notif.type === "follow" && "started following you"}
                                        {notif.type === "connection_request" &&
                                            "sent you a connection request"}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {moment(notif.createdAt).fromNow()}
                                    </p>
                                </div>
                                {notif.post && notif.post.image_urls.length > 0 && (
                                    <img
                                        src={notif.post.image_urls[0]}
                                        className="size-12 rounded object-cover"
                                        alt=""
                                    />
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-gray-500 dark:text-gray-400 mt-20">
                            No notifications yet
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Notifications;
