const App = window.StockApp;
const Data = App.Data;
const Analysis = App.Analysis;

let allNewsData = [];
let currentFilter = 'all';

// DOM
const newsContainer = document.getElementById('news-container');
const searchInput = document.getElementById('search-input');
const clockEl = document.getElementById('clock');
const tickerEl = document.getElementById('ticker-content');
const modal = document.getElementById('analysis-modal');
const watchlistEl = document.getElementById('tomorrow-watchlist');

async function init() {
    startClock();
    await loadData();

    // Auto-Refresh Every 5 Minutes (300,000ms)
    setInterval(async () => {
        console.log("Auto-refreshing news (5m interval)...");
        await loadData();
        if (typeof window.filterSource === 'function') {
            window.filterSource(currentFilter);
        } else {
            renderFeed(allNewsData);
        }
    }, 300000);

    // Search Listener
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = allNewsData.filter(n => n.title.toLowerCase().includes(term));
        renderFeed(filtered);
    });
}

async function loadData() {
    if (allNewsData.length === 0) {
        newsContainer.innerHTML = `<div class="loading-state"><i class='bx bx-loader-alt bx-spin'></i> Fetching Live Updates...</div>`;
    }

    allNewsData = await Data.fetchAllNews();

    // Analyze all
    allNewsData = allNewsData.map(n => ({
        ...n,
        sentiment: Analysis.analyzeSentiment(n.title + ' ' + n.summary)
    }));

    // Initial Render
    if (currentFilter === 'all') {
        renderFeed(allNewsData);
    }
    updateSidebar(allNewsData);
    renderTicker(allNewsData);
    generateWatchlist(allNewsData);
    generateTradingRobot(allNewsData);
}

function generateTradingRobot(newsList) {
    const robotSignals = Analysis.TradingRobot.analyzeOpportunities(newsList);
    const container = document.getElementById('trading-robot-list');

    if (!container) return;

    if (robotSignals.length === 0) {
        container.innerHTML = '<div class="text-muted" style="font-size:12px; text-align:center;">No strong signals for tomorrow.</div>';
        return;
    }

    // Take top 5 signals
    const topSignals = robotSignals.slice(0, 5);

    container.innerHTML = topSignals.map(sig => `
        <div class="robot-item ${sig.type.toLowerCase()}">
            <div class="robot-header">
                <span class="robot-code">${sig.code}</span>
                <span class="robot-badge ${sig.type === 'BULLISH' ? 'bg-success' : 'bg-danger'}">${sig.action}</span>
            </div>
            <div class="robot-targets">
                <div class="target-row">
                    <span>ENTRY</span> <strong>${sig.entry}</strong>
                </div>
                <div class="target-row">
                    <span class="text-success">TP</span> <strong>${sig.tp}</strong>
                </div>
                <div class="target-row">
                    <span class="text-danger">SL</span> <strong>${sig.sl}</strong>
                </div>
            </div>
        </div>
    `).join('');
}

function generateWatchlist(newsList) {
    if (!watchlistEl) return;

    const scores = {};

    newsList.forEach(n => {
        let code = n.code;
        if (!code) {
            const match = n.title.match(/\b[A-Z]{4}\b/);
            if (match) code = match[0];
        }

        if (code) {
            if (!scores[code]) scores[code] = { code, score: 0, title: n.title, sector: n.sector };
            scores[code].score += n.sentiment.score;
            if (new Date(n.date) > new Date()) scores[code].title = n.title;
        }
    });

    const bullishStocks = Object.values(scores)
        .filter(s => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5); // Reduced to 5 to save space since we have Robot now

    if (bullishStocks.length === 0) {
        watchlistEl.innerHTML = '<div class="text-muted" style="font-size:12px; text-align:center;">Pasar konsolidasi. Belum ada sinyal kuat.</div>';
        return;
    }

    watchlistEl.innerHTML = bullishStocks.map(stock => `
        <div class="watchlist-item">
            <div class="wl-info">
                <div class="wl-header">
                    <span class="wl-code">${stock.code}</span>
                </div>
                <span class="wl-desc">Accumulation Phase</span>
            </div>
            <span class="wl-score">+${stock.score}</span>
        </div>
    `).join('');
}

function renderFeed(newsList) {
    if (newsList.length === 0) {
        newsContainer.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">
            No news found in this timeframe.
        </div>`;
        return;
    }

    newsContainer.innerHTML = newsList.map((item) => {
        let badgeClass = 'tag-hold';
        if (item.sentiment.signal === 'BULLISH') badgeClass = 'tag-buy';
        if (item.sentiment.signal === 'BEARISH') badgeClass = 'tag-sell';

        const isFresh = (new Date() - item.date) < (1000 * 60 * 60 * 3);
        const freshClass = isFresh ? 'fresh' : '';
        const newTag = isFresh ? '<span class="tag-new">BARU</span>' : '';

        const horizon = item.sentiment.horizon || { type: 'MEDIUM', label: 'Swing', icon: 'bx-trending-up' };
        let horizonClass = 'medium';
        if (horizon.type === 'SHORT') horizonClass = 'short';
        if (horizon.type === 'LONG') horizonClass = 'long';

        return `
        <article class="news-card expanded ${freshClass}">
            <div class="news-content">
                <div class="news-header-row">
                    <div class="news-meta">
                        <span class="news-source">${item.source}</span>
                        <span class="news-date">${formatDateID(item.date)}</span>
                    </div>
                </div>

                <h3 class="news-title">
                    ${newTag}
                    ${item.title}
                </h3>

                <div class="news-body-inline">
                    <p class="news-summary">${item.summary}</p>
                    
                    <div class="ai-analysis-box">
                        <div class="ai-box-header"><i class='bx bx-microchip'></i> AI Robot Logic</div>
                        <p class="ai-reason">"${item.sentiment.reason}"</p>
                        
                        <div class="ai-stats-grid">
                            <div class="stat-pill">
                                <span class="lbl">Signal</span>
                                <span class="val ${badgeClass}">${item.sentiment.action}</span>
                            </div>
                            <div class="stat-pill">
                                <span class="lbl">Horizon</span>
                                <span class="val ${horizonClass}"><i class='bx ${horizon.icon}'></i> ${horizon.label}</span>
                            </div>
                            <div class="stat-pill">
                                <span class="lbl">Impact</span>
                                <span class="val">Score: ${item.sentiment.score > 0 ? '+' : ''}${item.sentiment.score}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="news-footer-inline">
                    <a href="${item.link}" target="_blank" class="source-link">
                        Baca Sumber Lengkap <i class='bx bx-link-external'></i>
                    </a>
                </div>
            </div>
        </article>
        `;
    }).join('');
}

function renderTicker(newsList) {
    const items = newsList.slice(0, 30).map(n =>
        `<span class="ticker-item"><strong>${n.sentiment.action}</strong> ${n.title}</span>`
    ).join(' • ');
    tickerEl.innerHTML = items + ' • ' + items;
}

function updateSidebar(newsList) {
    const buys = newsList.filter(n => n.sentiment.score > 0).slice(0, 5);
    const sells = newsList.filter(n => n.sentiment.score < 0).slice(0, 5);
    renderMiniList('top-buy-list', buys, 'text-success');
    renderMiniList('top-sell-list', sells, 'text-danger');
}

function renderMiniList(elementId, items, colorClass) {
    const el = document.getElementById(elementId);
    if (!el) return;
    if (items.length === 0) {
        el.innerHTML = '<div class="text-muted" style="font-size: 12px;">No signals detected.</div>';
        return;
    }
    el.innerHTML = items.map(item => `
        <div class="mini-item">
            <a href="#" onclick="openAnalysis('${encodeURIComponent(item.title).replace(/'/g, "%27")}', event)">${item.title}</a>
            <div class="mini-meta">
                <span>${item.source}</span>
                <span class="${colorClass}" style="font-weight:700;">${item.sentiment.action}</span>
            </div>
        </div>
    `).join('');
}

// Modal Logic Enhanced
window.openAnalysis = function (encodedTitle, event) {
    if (event) event.preventDefault();
    const title = decodeURIComponent(encodedTitle);
    const news = allNewsData.find(n => n.title === title);
    if (!news) return;

    // Lookup Stock Info for Ownership
    const stockInfo = Data.lookupStock(news.title) ||
        Data.lookupStock(news.code) ||
        { owner: 'Data Not Available' };

    document.getElementById('modal-title').innerText = news.title;
    document.getElementById('modal-date').innerText = `Updated: ${formatDateID(news.date)} • Source: ${news.source}`;

    // Clear previous content first to prevent duplication or rendering issue
    const bodyContainer = document.querySelector('.modal-body');
    bodyContainer.innerHTML = '';

    const technical = news.sentiment.technical || {};
    const fundamental = news.sentiment.fundamental || {};

    bodyContainer.innerHTML = `
        <div class="owner-banner">
            <i class='bx bx-id-card'></i> <strong>PEMEGANG SAHAM UTAMA:</strong> ${stockInfo.owner}
        </div>

        <p class="modal-summary">${news.summary}</p>
        
        <div class="analysis-grid">
            <div class="analysis-col">
                <div class="col-title"><i class='bx bx-line-chart'></i> Technical (AI Estimated)</div>
                <div class="stat-row"><span class="stat-label">RSI (14)</span> <span class="stat-val ${technical.rsi > 70 || technical.rsi < 30 ? 'text-warning' : ''}">${technical.rsi}</span></div>
                <div class="stat-row"><span class="stat-label">MA Trend</span> <span class="stat-val">${technical.ma20}</span></div>
                <div class="stat-row"><span class="stat-label">Volume</span> <span class="stat-val">${technical.volume}</span></div>
                <div class="stat-row"><span class="stat-label">Support</span> <span class="stat-val">${technical.support}</span></div>
                <div class="stat-row"><span class="stat-label">Resistance</span> <span class="stat-val">${technical.resistance}</span></div>
            </div>

            <div class="analysis-col">
                <div class="col-title"><i class='bx bx-briefcase'></i> Fundamental Snapshot</div>
                <div class="stat-row"><span class="stat-label">PBV Ratio</span> <span class="stat-val">${fundamental.pbv}</span></div>
                <div class="stat-row"><span class="stat-label">PER</span> <span class="stat-val">${fundamental.per}</span></div>
                <div class="stat-row"><span class="stat-label">ROE</span> <span class="stat-val text-success">${fundamental.roe}</span></div>
                <div class="stat-row"><span class="stat-label">DER</span> <span class="stat-val">${fundamental.der}</span></div>
            </div>
        </div>

        </div>

        <!-- TRADINGVIEW WIDGET INTEGRATION -->
        <div class="tv-widget-container" style="margin-top:20px; border-top:1px solid rgba(255,255,255,0.1); padding-top:20px;">
            <div class="col-title" style="margin-bottom:15px;"><i class='bx bx-radar'></i> Live Technical Meter (TradingView)</div>
            <div class="tradingview-widget-container">
                <div class="tradingview-widget-container__widget" id="tv-widget-${news.code || 'COMPOSITE'}"></div>
                <script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js" async>
                {
                "interval": "1D",
                "width": "100%",
                "isTransparent": true,
                "height": 400,
                "symbol": "IDX:${news.code ? news.code : 'COMPOSITE'}",
                "showIntervalTabs": true,
                "displayMode": "single",
                "locale": "id"
                }
                </script>
            </div>
            <small style="color:var(--text-muted); font-size:10px;">*Data real-time dari TradingView (Delay 15m without Pro).</small>
        </div>

        <div class="ai-insight-box" style="margin-top:20px;">
             <h3><i class='bx bx-brain'></i> AI Prediction</h3>
             <p class="ai-reason">"${news.sentiment.reason}"</p>
        </div>

        <a href="${news.link}" target="_blank" class="read-more-btn">
            Read Full Article Source <i class='bx bx-link-external'></i>
        </a>
    `;

    // Manually Inject Script because innerHTML script tags don't execute
    const tvScript = document.createElement('script');
    tvScript.src = 'https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js';
    tvScript.async = true;
    tvScript.innerHTML = JSON.stringify({
        "interval": "1D",
        "width": "100%",
        "isTransparent": true,
        "height": 400,
        "symbol": `IDX:${news.code ? news.code : 'COMPOSITE'}`,
        "showIntervalTabs": true,
        "displayMode": "single",
        "locale": "id",
        "colorTheme": "dark"
    });

    // Find the container we just made
    setTimeout(() => {
        const widgetContainer = bodyContainer.querySelector('.tradingview-widget-container__widget');
        if (widgetContainer) {
            widgetContainer.parentNode.appendChild(tvScript);
        }
    }, 50);

    const badge = document.getElementById('modal-sentiment-badge');
    badge.innerText = news.sentiment.action;
    badge.className = 'modal-badge';
    if (news.sentiment.signal === 'BULLISH') {
        badge.style.background = 'var(--success)';
        badge.style.color = '#000';
    } else if (news.sentiment.signal === 'BEARISH') {
        badge.style.background = 'var(--danger)';
        badge.style.color = '#fff';
    } else {
        badge.style.background = 'var(--warning)';
        badge.style.color = '#000';
    }

    // Force style reset
    modal.style.display = 'flex';
    modal.style.opacity = '0'; // Start transparent

    // Use timeout to ensure DOM render before transition
    setTimeout(() => {
        modal.style.opacity = '1';
    }, 10);
};

window.closeModal = function () {
    modal.style.opacity = '0';
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
};

function formatDateID(date) {
    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];

    const d = new Date(date);
    const dayName = days[d.getDay()];
    const dayDate = d.getDate().toString().padStart(2, '0');
    const month = months[d.getMonth()];
    const hour = d.getHours().toString().padStart(2, '0');
    const min = d.getMinutes().toString().padStart(2, '0');

    return `${dayName}, ${dayDate} ${month} • ${hour}:${min}`;
}

function startClock() {
    setInterval(() => {
        clockEl.innerText = new Date().toLocaleTimeString();
    }, 1000);
}

window.filterSource = function (filter) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    currentFilter = filter;
    if (filter === 'all') { renderFeed(allNewsData); return; }

    const filtered = allNewsData.filter(n => {
        if (filter === '1H') {
            const oneHourAgo = new Date().getTime() - (60 * 60 * 1000);
            return n.date.getTime() >= oneHourAgo;
        }
        if (n.sector && n.sector.includes(filter)) return true;
        const text = (n.title + ' ' + n.summary).toLowerCase();
        const f = filter.toLowerCase();
        if (filter === 'Mining-Gold') return text.includes('emas') || text.includes('gold') || text.includes('antm') || text.includes('mdka');
        if (filter === 'Mining-Coal') return text.includes('batu bara') || text.includes('coal') || text.includes('adro') || text.includes('ptba');
        if (filter === 'Mining-Nickel') return text.includes('nikel') || text.includes('nickel') || text.includes('inco') || text.includes('nckl');
        return text.includes(f);
    });
    renderFeed(filtered);
};

document.addEventListener('DOMContentLoaded', init);
