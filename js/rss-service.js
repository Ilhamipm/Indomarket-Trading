/**
 * RSS Service
 * Manages user-defined RSS feeds and fetches them via rss2json API.
 */
class RssService {
    constructor() {
        this.STORAGE_KEY = 'user_rss_feeds';
        this.API_BASE = 'https://api.rss2json.com/v1/api.json?rss_url=';
        this.feeds = this.loadFeeds();

        // Default feeds if empty (Optional, for demo)
        if (this.feeds.length === 0) {
            this.addFeed('https://www.antaranews.com/rss/ekonomi-bisnis');
            this.addFeed('https://www.cnbcindonesia.com/market/rss');
        }
    }

    /**
     * Load feeds from LocalStorage
     */
    loadFeeds() {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    }

    /**
     * Save feeds to LocalStorage
     */
    saveFeeds() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.feeds));
    }

    /**
     * Add a new feed URL
     */
    addFeed(url) {
        if (!this.feeds.includes(url)) {
            this.feeds.push(url);
            this.saveFeeds();
            return true;
        }
        return false;
    }

    /**
     * Remove a feed URL
     */
    removeFeed(url) {
        this.feeds = this.feeds.filter(f => f !== url);
        this.saveFeeds();
    }

    /**
     * Fetch all feeds and normalize them
     */
    async fetchAllFeeds() {
        if (this.feeds.length === 0) return [];

        const promises = this.feeds.map(url => this.fetchFeed(url));
        const results = await Promise.allSettled(promises);

        let mergedNews = []; // Flat list of news items

        results.forEach(res => {
            if (res.status === 'fulfilled') {
                mergedNews = mergedNews.concat(res.value);
            }
        });

        console.log(`[RSS] Fetched ${mergedNews.length} items from ${this.feeds.length} feeds.`);
        return mergedNews;
    }

    /**
     * Fetch a single feed
     */
    async fetchFeed(url) {
        try {
            // Using a public proxy to convert RSS XML to JSON and handle CORS
            const response = await fetch(`${this.API_BASE}${encodeURIComponent(url)}`);
            const data = await response.json();

            if (data.status === 'ok') {
                return data.items.map(item => this.normalizeItem(item, data.feed));
            } else {
                console.warn(`[RSS] Failed to fetch ${url}:`, data.message);
                return [];
            }
        } catch (error) {
            console.error(`[RSS] Network error for ${url}:`, error);
            return [];
        }
    }

    /**
     * Convert RSS item to App News Format
     */
    normalizeItem(item, feedInfo) {
        // Try to infer stock code from title
        const codeMatch = item.title.match(/\b[A-Z]{4}\b/);
        const code = codeMatch ? codeMatch[0] : null;

        return {
            source: feedInfo.title || 'RSS Feed',
            title: item.title,
            link: item.link,
            date: item.pubDate, // RSS usually has pubDate
            summary: this.stripHtml(item.description || item.content),
            code: code,
            sector: 'General', // Default
            isRss: true // Flag to distinguish
        };
    }

    /**
     * Helper to remove HTML tags from description
     */
    stripHtml(html) {
        if (!html) return '';
        const tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        let text = tmp.textContent || tmp.innerText || "";
        // Trucate if too long
        return text.length > 200 ? text.substring(0, 200) + '...' : text;
    }
}

// Export instance
window.RssService = new RssService();
