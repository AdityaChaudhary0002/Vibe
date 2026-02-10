import React, { useEffect, useState } from "react";
import { TrendingUp, Sparkles, Loader2 } from "lucide-react";
import api from "../api/axios";

const TrendingBar = () => {
    const [trends, setTrends] = useState([]);
    const [aiSummary, setAiSummary] = useState("");
    const [loading, setLoading] = useState(true);

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

    return (
        <div className="max-w-xs w-full bg-white dark:bg-slate-900 border border-transparent dark:border-gray-700 p-4 rounded-xl shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2 text-slate-800 dark:text-gray-100 font-bold border-b pb-2 dark:border-gray-700">
                <TrendingUp className="size-5 text-indigo-500" />
                <h3>Trending Now</h3>
            </div>

            {loading ? (
                <div className="flex justify-center p-4">
                    <Loader2 className="animate-spin text-gray-400" />
                </div>
            ) : trends.length > 0 ? (
                <div className="space-y-4">
                    {/* Top Trend with AI Insight */}
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

                    {/* Other Trends */}
                    <div className="space-y-3">
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
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                    No trends yet. Start posting!
                </p>
            )}
        </div>
    );
};

export default TrendingBar;
