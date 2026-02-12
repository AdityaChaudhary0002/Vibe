
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
        <div className="max-w-xs w-full bg-white dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800 p-5 rounded-3xl shadow-lg flex flex-col gap-6 sticky top-24">

            {/* Tabs */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl relative">
                <div
                    className={`absolute inset-y-1 w-1/2 bg-white dark:bg-slate-700 rounded-lg shadow-sm transition-all duration-300 ease-in-out ${activeTab === 'news' ? 'translate-x-full' : 'translate-x-0'}`}
                />
                <button
                    onClick={() => setActiveTab("hashtags")}
                    className={`relative z-10 flex-1 py-2 text-xs font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'hashtags' ? 'text-indigo-600 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                >
                    <TrendingUp className="size-3.5" /> Trending
                </button>
                <button
                    onClick={() => setActiveTab("news")}
                    className={`relative z-10 flex-1 py-2 text-xs font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'news' ? 'text-indigo-600 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                >
                    <Newspaper className="size-3.5" /> Vibe News
                </button>
            </div>

            {/* Content */}
            {activeTab === "hashtags" ? (
                loading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="animate-spin text-indigo-500 size-6" />
                    </div>
                ) : trends.length > 0 ? (
                    <div className="space-y-4">
                        {/* Top Trend */}
                        <div className="relative p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg text-white overflow-hidden group">
                            <div className="absolute top-0 right-0 p-3 opacity-10">
                                <Sparkles className="size-16" />
                            </div>

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="font-black text-xl tracking-tight">
                                        {trends[0].tag}
                                    </span>
                                    <span className="text-[10px] bg-white/20 backdrop-blur-md px-2 py-1 rounded-full text-white font-bold border border-white/10">
                                        #1
                                    </span>
                                </div>

                                <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-xl border border-white/10 mb-3">
                                    <p className="text-xs text-indigo-50 italic leading-relaxed">
                                        "{aiSummary.replace(/"/g, "")}"
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 text-xs font-medium text-indigo-100">
                                    <Sparkles className="size-3" />
                                    {trends[0].count} posts
                                </div>
                            </div>
                        </div>

                        {/* List */}
                        <div className="space-y-1">
                            {trends.slice(1).map((trend, index) => (
                                <div key={index} className="flex justify-between items-center group cursor-pointer p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-bold text-gray-400 w-4">{index + 2}</span>
                                        <div>
                                            <p className="text-sm font-bold text-slate-700 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                {trend.tag}
                                            </p>
                                            <p className="text-[10px] text-gray-400 font-medium">{trend.count} posts</p>
                                        </div>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0">
                                        <TrendingUp className="size-3 text-indigo-500" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-10 opacity-50">
                        <TrendingUp className="size-10 mx-auto text-gray-300 mb-2" />
                        <p className="text-sm text-gray-500">No trends right now.</p>
                    </div>
                )
            ) : (
                /* News Tab */
                <div className="flex flex-col gap-4">
                    {/* Categories */}
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex gap-1 overflow-x-auto custom-scrollbar pb-1 no-scrollbar">
                            {NEWS_CATEGORIES.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setNewsCategory(cat.id)}
                                    className={`px-3 py-1.5 text-[10px] font-bold rounded-full transition-all whitespace-nowrap border ${newsCategory === cat.id
                                        ? "bg-slate-800 text-white border-slate-800 dark:bg-white dark:text-slate-900"
                                        : "bg-transparent text-gray-500 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                                        }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={fetchNews}
                            disabled={newsLoading}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-full transition disabled:opacity-50"
                        >
                            <RefreshCw className={`size-3.5 ${newsLoading ? "animate-spin" : ""}`} />
                        </button>
                    </div>

                    {newsLoading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="animate-spin text-indigo-500 size-6" />
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {news.map((item, i) => (
                                <a
                                    key={i}
                                    href={item.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group block bg-slate-50 dark:bg-slate-800/30 p-4 rounded-2xl hover:bg-white dark:hover:bg-slate-800 hover:shadow-lg transition-all duration-300 border border-transparent hover:border-indigo-100 dark:hover:border-slate-700"
                                >
                                    <div className="flex justify-between items-start gap-2 mb-2">
                                        <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">{item.source}</span>
                                        <ExternalLink className="size-3 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                                    </div>
                                    <h4 className="text-sm font-bold text-slate-800 dark:text-gray-100 line-clamp-2 leading-relaxed group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                        {item.title}
                                    </h4>
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TrendingBar;
