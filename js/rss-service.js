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
     * Fetch a single feed (RSS Loopup -> Fallback to Web Scrape)
     */
    async fetchFeed(url) {
        try {
            // 1. Try Standard RSS via rss2json
            const rssUrl = `${this.API_BASE}${encodeURIComponent(url)}`;
            const response = await fetch(rssUrl);
            const data = await response.json();

            if (data.status === 'ok') {
                return data.items.map(item => this.normalizeItem(item, data.feed));
            } else {
                // 2. Fallback: Try Client-Side Scraping
                console.log(`[RSS] RSS fetch failed for ${url}, trying Web Scraper...`);
                return await this.fetchAndScrape(url);
            }
        } catch (error) {
            console.error(`[RSS] Network error for ${url}:`, error);
            // Even on network error (maybe strict CORS on rss2json?), try scraping
            return await this.fetchAndScrape(url);
        }
    }

    /**
     * Scrape generic webpage for news items
     */
    async fetchAndScrape(url) {
        try {
            // Use AllOrigins as CORS Proxy
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
            const res = await fetch(proxyUrl);
            const json = await res.json();

            if (!json.contents) return [];

            // Parse HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(json.contents, 'text/html');
            const baseUrl = new URL(url).origin;

            // Heuristic Parsing
            let items = [];

            // Key scraping strategies
            const strategies = [
                'article',
                '.post',
                '.news-item',
                '.card',
                '.entry-title',
                '.headline'
            ];

            // 1. Try Finding Semantic Content
            for (let selector of strategies) {
                const nodes = doc.querySelectorAll(selector);
                if (nodes.length > 0) {
                    nodes.forEach(node => {
                        const titleEl = node.querySelector('h1, h2, h3, h4') || node.querySelector('a');
                        const linkEl = node.querySelector('a') || (node.tagName === 'A' ? node : null);
                        const sumEl = node.querySelector('p, .summary, .excerpt');

                        // Validation
                        if (titleEl && linkEl && titleEl.innerText.length > 15) {
                            items.push({
                                title: titleEl.innerText.trim(),
                                link: this.resolveUrl(linkEl.getAttribute('href'), baseUrl),
                                pubDate: new Date().toISOString(), // Default now
                                description: sumEl ? sumEl.innerText.substring(0, 200) : ''
                            });
                        }
                    });
                }
                if (items.length >= 5) break; // Found enough? stop looking.
            }

            // 2. Fallback: Find all heavy anchor tags
            if (items.length === 0) {
                doc.querySelectorAll('a').forEach(a => {
                    // Filter navigation links
                    const text = a.innerText.trim();
                    if (text.length > 25 && !text.includes('Sign In') && !text.includes('Menu')) {
                        items.push({
                            title: text,
                            link: this.resolveUrl(a.getAttribute('href'), baseUrl),
                            pubDate: new Date().toISOString(),
                            description: ''
                        });
                    }
                });
            }

            // Deduplicate by URL
            const unique = new Map();
            items.forEach(i => unique.set(i.link, i));

            // Limit to 10 items
            const result = Array.from(unique.values()).slice(0, 10);
            console.log(`[RSS] Scraped ${result.length} items from ${url}`);

            return result.map(item => this.normalizeItem(item, { title: 'Web Scrape: ' + new URL(url).hostname }));

        } catch (e) {
            console.error("[RSS] Scraping failed:", e);
            return [];
        }
    }

    resolveUrl(path, base) {
        if (!path) return '#';
        if (path.startsWith('http')) return path;
        // Handle root relative
        if (path.startsWith('/')) return base + path;
        return base + '/' + path;
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
