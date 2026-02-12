
import React from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";

import ReactDOM from "react-dom";

const UserListModal = ({ title, users, onClose }) => {
    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
            <div
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-[500px] h-auto max-h-[600px] flex flex-col overflow-hidden relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/30">
                    <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        {title}
                        <span className="bg-gray-200 dark:bg-gray-700 text-xs px-2 py-0.5 rounded-full text-gray-600 dark:text-gray-300">
                            {users.length}
                        </span>
                    </h2>
                    <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-500 transition-colors">
                        <X className="size-4" />
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
        </div>,
        document.body
    );
};

export default UserListModal;
