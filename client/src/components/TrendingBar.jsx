
import React, { useEffect, useState } from "react";
import { TrendingUp, Sparkles, Loader2, Newspaper, ExternalLink, RefreshCw } from "lucide-react";
import api from "../api/axios";

const NEWS_CATEGORIES = [
    { id: "tech", label: "Tech" },
    { id: "business", label: "Biz" },
    { id: "startups", label: "Startup" },
    { id: "coding", label: "Code" },
];

const TrendingBar = () => {
    const [activeTab, setActiveTab] = useState("hashtags");
    const [trends, setTrends] = useState([]);
    const [news, setNews] = useState([]);
    const [newsCategory, setNewsCategory] = useState("tech");
    const [aiSummary, setAiSummary] = useState("");
    const [loading, setLoading] = useState(true);
    const [newsLoading, setNewsLoading] = useState(false);

    useEffect(() => {
        const fetchTrends = async () => {
            try {
                const { data } = await api.get("/api/post/trending");
                if (data.success) {
                    setTrends(data.trends);
                    setAiSummary(data.summary);
                }
            } catch (error) {
                console.error("Error fetching trends:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTrends();
    }, []);

    useEffect(() => {
        if (activeTab === "news") {
            fetchNews();
        }
    }, [activeTab, newsCategory]);

    const fetchNews = async () => {
        setNewsLoading(true);
        try {
            const { data } = await api.get(`/api/news?category=${newsCategory}`);
            if (data.success) {
                setNews(data.articles.slice(0, 5));
            }
        } catch (error) {
            console.error("Error fetching news:", error);
        } finally {
            setNewsLoading(false);
        }
    };

    return (
        <div className="max-w-xs w-full bg-white dark:bg-slate-900 border border-transparent dark:border-gray-700 p-4 rounded-xl shadow-sm flex flex-col gap-4">

            {/* Tabs */}
            <div className="flex border-b border-gray-100 dark:border-gray-700">
                <button
                    onClick={() => setActiveTab("hashtags")}
                    className={`flex-1 pb-2 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'hashtags' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                >
                    <TrendingUp className="size-4" /> Trending
                </button>
                <button
                    onClick={() => setActiveTab("news")}
                    className={`flex-1 pb-2 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'news' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                >
                    <Newspaper className="size-4" /> Vibe News
                </button>
            </div>

            {/* Content */}
            {activeTab === "hashtags" ? (
                loading ? (
                    <div className="flex justify-center p-4">
                        <Loader2 className="animate-spin text-gray-400" />
                    </div>
                ) : trends.length > 0 ? (
                    <div className="space-y-4">
                        {/* Top Trend */}
                        <div className="relative p-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-800 rounded-lg border border-indigo-100 dark:border-gray-700">
                            <div className="flex justify-between items-start">
                                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                                    {trends[0].tag}
                                </span>
                                <span className="flex items-center gap-1 text-[10px] bg-white dark:bg-slate-700 px-2 py-0.5 rounded-full text-indigo-500 shadow-sm border border-indigo-100 dark:border-gray-600">
                                    <Sparkles className="size-3" /> AI Insight
                                </span>
                            </div>

                            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 italic leading-relaxed">
                                "{aiSummary.replace(/"/g, "")}"
                            </p>
                            <p className="text-xs text-gray-400 mt-2 font-medium">
                                {trends[0].count} posts
                            </p>
                        </div>

                        {/* List */}
                        <div className="space-y-2">
                            {trends.slice(1).map((trend, index) => (
                                <div key={index} className="flex justify-between items-center group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded-md transition">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-700 dark:text-gray-200 group-hover:text-indigo-500 transition">
                                            {trend.tag}
                                        </p>
                                        <p className="text-xs text-gray-400">{trend.count} posts</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No trends yet.</p>
                )
            ) : (
                /* News Tab */
                <div className="flex flex-col gap-3">
                    {/* Categories & Refresh */}
                    <div className="flex items-center justify-between gap-1">
                        <div className="flex gap-1 overflow-x-auto custom-scrollbar pb-1">
                            {NEWS_CATEGORIES.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setNewsCategory(cat.id)}
                                    className={`px-2 py-1 text-[10px] font-medium rounded-md transition-colors whitespace-nowrap ${newsCategory === cat.id
                                            ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300"
                                            : "bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700"
                                        }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={fetchNews}
                            disabled={newsLoading}
                            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-full transition disabled:opacity-50"
                        >
                            <RefreshCw className={`size-3.5 ${newsLoading ? "animate-spin" : ""}`} />
                        </button>
                    </div>

                    {newsLoading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="animate-spin text-gray-400 size-5" />
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {news.map((item, i) => (
                                <a
                                    key={i}
                                    href={item.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group block bg-gray-50 dark:bg-slate-800/50 p-3 rounded-lg hover:bg-indigo-50 dark:hover:bg-slate-800 transition border border-transparent hover:border-indigo-100 dark:hover:border-slate-700"
                                >
                                    <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 line-clamp-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 mb-1">
                                        {item.title}
                                    </h4>
                                    <div className="flex justify-between items-center text-[10px] text-gray-500">
                                        <span className="font-medium">{item.source}</span>
                                        <ExternalLink className="size-3 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500" />
                                    </div>
                                </a>
                            ))}
                            {/* Empty State / Error */}
                            {news.length === 0 && !newsLoading && (
                                <p className="text-xs text-center text-gray-400 py-4">No news found.</p>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TrendingBar;
