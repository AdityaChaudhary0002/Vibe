
import React from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";

const UserListModal = ({ title, users, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md h-[400px] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition">
                        <X className="size-5 text-gray-500" />
                    </button>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {users.length === 0 ? (
                        <p className="text-center text-gray-500 py-10">No users found.</p>
                    ) : (
                        users.map((user) => (
                            <Link to={`/profile/${user._id}`} key={user._id} onClick={onClose} className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 p-2 rounded-lg transition">
                                <img
                                    src={user.profile_picture || "https://via.placeholder.com/40"}
                                    alt={user.username}
                                    className="size-10 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                                />
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{user.full_name}</h3>
                                    <p className="text-xs text-gray-500">@{user.username}</p>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserListModal;
