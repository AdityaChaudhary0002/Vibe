import React, { useEffect, useState } from "react";
import { assets, dummyPostsData } from "../assets/assets";
import Loading from "../components/Loading";
import StoriesBar from "../components/StoriesBar";
import PostCard from "../components/PostCard";
import RecentMessages from "../components/RecentMessages";
import TrendingBar from "../components/TrendingBar";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios.js";
import toast from "react-hot-toast";

import PostSkeleton from "../components/PostSkeleton";

const Feed = () => {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const { getToken } = useAuth();

  const fetchFeed = async (pageNum = 1) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const token = await getToken();
      const limit = 5;
      const { data } = await api.get(`/api/post/feed?page=${pageNum}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        if (pageNum === 1) {
          setFeeds(data.posts);
        } else {
          setFeeds((prev) => [...prev, ...data.posts]);
        }

        if (data.posts.length < limit) {
          setHasMore(false);
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchFeed(1);
  }, []);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchFeed(nextPage);
  };

  const observer = React.useRef();
  const lastPostElementRef = React.useCallback(node => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        handleLoadMore();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore]);

  return (
    <div className="h-full overflow-y-scroll no-scrollbar py-10 xl:pr-5 flex items-start justify-center xl:gap-8">
      {/* Stories and post list */}
      <div className="w-full max-w-2xl">
        <StoriesBar />
        <div className="p-4 space-y-6">
          {loading ? (
            // Skeleton Loading State
            [1, 2, 3].map((n) => <PostSkeleton key={n} />)
          ) : (
            // Feed Content
            feeds.map((post, index) => (
              <PostCard key={post._id} post={post} index={index} />
            ))
          )}

          {/* Infinite Scroll Trigger */}
          <div ref={lastPostElementRef} className="h-4"></div>

          {/* Loading More Indicator */}
          {loadingMore && (
            <div className="flex justify-center p-4">
              <Loading />
            </div>
          )}

          {!loading && !hasMore && feeds.length > 0 && (
            <p className="text-center text-gray-400 text-sm py-4">You're all caught up! 🎉</p>
          )}

          {!loading && feeds.length === 0 && ( // Empty State
            <div className="text-center py-10">
              <p className="text-gray-500">No posts yet. Be the first! 🚀</p>
            </div>
          )}
        </div>
      </div>

      {/* Right sidebar */}
      <div className="max-xl:hidden sticky top-0 space-y-4 w-80">
        <TrendingBar />
        <RecentMessages />
      </div>
    </div>
  );
};

export default Feed;
