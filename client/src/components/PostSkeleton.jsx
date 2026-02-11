import React from "react";

const PostSkeleton = () => {
    return (
        <div className="bg-white dark:bg-slate-900 border border-transparent dark:border-gray-700 rounded-xl shadow p-4 space-y-4 w-full max-w-2xl animate-pulse">
            {/* User Info Skeleton */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800"></div>
                <div className="space-y-2">
                    <div className="w-32 h-4 bg-gray-200 dark:bg-gray-800 rounded"></div>
                    <div className="w-24 h-3 bg-gray-200 dark:bg-gray-800 rounded"></div>
                </div>
            </div>

            {/* Content Skeleton */}
            <div className="space-y-2">
                <div className="w-full h-4 bg-gray-200 dark:bg-gray-800 rounded"></div>
                <div className="w-3/4 h-4 bg-gray-200 dark:bg-gray-800 rounded"></div>
            </div>

            {/* Image Skeleton */}
            <div className="w-full h-48 sm:h-64 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>

            {/* Actions Skeleton */}
            <div className="flex items-center gap-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800"></div>
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800"></div>
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800"></div>
            </div>
        </div>
    );
};

export default PostSkeleton;
