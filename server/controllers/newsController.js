
import Parser from "rss-parser";
import groq from "../configs/groq.js";

const parser = new Parser();

// RSS Feed Sources (Free & Reliable)
const NEWS_SOURCES = {
    tech: [
        "https://feeds.feedburner.com/TechCrunch/",
        "https://www.theverge.com/rss/index.xml",
        "https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml",
    ],
    business: [
        "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10001147", // CNBC Business
        "https://feeds.feedburner.com/entrepreneur/latest",
    ],
    startups: [
        "https://techcrunch.com/category/startups/feed/",
        "http://feeds.feedburner.com/Venturebeat",
    ],
    coding: [
        "https://dev.to/feed",
        "https://www.freecodecamp.org/news/rss/",
    ],
};

export const getNews = async (req, res) => {
    try {
        const { category = "tech" } = req.query;

        if (!NEWS_SOURCES[category]) {
            return res.json({ success: false, message: "Invalid category" });
        }

        const feeds = NEWS_SOURCES[category];
        const promises = feeds.map((feedUrl) => parser.parseURL(feedUrl));

        const results = await Promise.allSettled(promises);

        let allArticles = [];

        results.forEach((result) => {
            if (result.status === "fulfilled") {
                const feed = result.value;
                const feedTitle = feed.title || "News Source";

                // Map items to a standard format
                const articles = feed.items.slice(0, 10).map((item) => ({
                    title: item.title,
                    link: item.link,
                    pubDate: item.pubDate,
                    contentSnippet: item.contentSnippet,
                    source: feedTitle, // Source name
                    creator: item.creator || "Unknown",
                    // Try to extract image from content or enclosure if available (RSS specific)
                    image: extractImage(item),
                }));

                allArticles = [...allArticles, ...articles];
            }
        });

        // Shuffle articles to mix sources
        allArticles = allArticles.sort(() => Math.random() - 0.5);

        res.json({ success: true, articles: allArticles.slice(0, 20) }); // Return top 20 mixed
    } catch (error) {
        console.log("News Fetch Error:", error);
        res.json({ success: false, message: "Failed to fetch news" });
    }
};

// Helper to extract image from RSS item (basic heuristic)
const extractImage = (item) => {
    if (item.enclosure && item.enclosure.url) return item.enclosure.url;
    if (item["media:content"] && item["media:content"]["$"] && item["media:content"]["$"].url) return item["media:content"]["$"].url;
    if (item.content) {
        const match = item.content.match(/src="([^"]+)"/);
        if (match) return match[1];
    }
    return null; // Frontend will show placeholder
};
