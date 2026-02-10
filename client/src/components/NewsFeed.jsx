
import React, { useState, useEffect } from "react";
import api from "../api/axios.js";
import Loading from "./Loading";
import { ExternalLink, Clock, TrendingUp } from "lucide-react";
import moment from "moment";

const CATEGORIES = [
    { id: "tech", label: "Technology" },
    { id: "startups", label: "Startups" },
    { id: "business", label: "Business" },
    { id: "coding", label: "Coding" },
];

const NewsFeed = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [category, setCategory] = useState("tech");

    useEffect(() => {
        const fetchNews = async () => {
            setLoading(true);
            try {
                const { data } = await api.get(`/api/news?category=${category}`);
                if (data.success) {
                    setArticles(data.articles);
                }
            } catch (error) {
                console.error("Failed to fetch news", error);
            }
            setLoading(false);
        };
        fetchNews();
    }, [category]);


    return (
        <div className="w-full">
            {/* Category Tabs */}
            <div className="flex gap-3 overflow-x-auto pb-6 mb-6 custom-scrollbar">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setCategory(cat.id)}
                        className={`px-5 py-2.5 rounded-xl whitespace-nowrap text-sm font-semibold transition-all transform active:scale-95 ${category === cat.id
                                ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30"
                                : "bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 hover:shadow-sm"
                            }`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="min-h-[40vh] flex items-center justify-center">
                    <Loading />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {articles.map((article, index) => (
                        <a
                            key={index}
                            href={article.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group relative"
                        >
                            <div className="h-48 overflow-hidden relative bg-gray-100 dark:bg-slate-800">
                                {article.image ? (
                                    <img
                                        src={article.image}
                                        alt={article.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-900">
                                        <TrendingUp className="size-10 text-indigo-300 dark:text-slate-600" />
                                    </div>
                                )}
                                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide border border-white/10">
                                    {article.source}
                                </div>
                            </div>

                            <div className="p-5 flex flex-col flex-1">
                                <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">
                                    <span className="flex items-center gap-1">
                                        <Clock className="size-3" />
                                        {moment(article.pubDate).fromNow()}
                                    </span>
                                    {article.creator && (
                                        <>
                                            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                                            <span className="truncate max-w-[120px]">{article.creator}</span>
                                        </>
                                    )}
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                    {article.title}
                                </h3>
                                <div className="flex-1">
                                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4 leading-relaxed">
                                        {article.contentSnippet || "Click to read full story..."}
                                    </p>
                                </div>

                                <div className="pt-4 mt-auto border-t border-gray-100 dark:border-slate-800 w-full">
                                    <span className="flex items-center justify-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 group-hover:gap-3 transition-all duration-300">
                                        Read Full Story <ExternalLink className="size-4" />
                                    </span>
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NewsFeed;
