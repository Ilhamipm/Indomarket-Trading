window.StockApp = window.StockApp || {};

/*
 * Analysis Service
 * - Sentiment Analysis (Keyword based)
 * - Deep Dive Reasoning (Generative Templates)
 * - Investment Horizon (Scalp vs Swing vs Invest)
 * - Fundamental & Technical Data Sim
 */

StockApp.Analysis = {

    // Keyword Dictionary for Sentiment
    keywords: {
        bullish: ['naik', 'melonjak', 'untung', 'laba', 'dividen', 'ekspansi', 'akuisisi', 'tertinggi', 'rekor', 'optimis', 'buy', 'borong', 'merger', 'resmi', 'disetujui'],
        bearish: ['turun', 'rugi', 'anjlok', 'koreksi', 'merah', 'phk', 'gugatan', 'utang', 'bangkrut', 'gagal', 'batal', 'pkpu', 'suspend', 'arb', 'jual']
    },

    analyzeSentiment(text) {
        text = text.toLowerCase();
        let score = 0;

        this.keywords.bullish.forEach(w => { if (text.includes(w)) score++; });
        this.keywords.bearish.forEach(w => { if (text.includes(w)) score--; });

        // Determine Signal
        let signal = 'NEUTRAL';
        let action = 'HOLD';

        if (score > 0) { signal = 'BULLISH'; action = 'BUY'; }
        if (score > 2) { signal = 'BULLISH'; action = 'STRONG BUY'; } // Stronger signal
        if (score < 0) { signal = 'BEARISH'; action = 'SELL'; }
        if (score < -2) { signal = 'BEARISH'; action = 'STRONG SELL'; }

        // Determine Horizon (Timeframe)
        const horizon = this.determineHorizon(text, score);

        // Generate Deep Stats
        const technical = this.generateTechnicalStats(signal);
        const fundamental = this.generateFundamentalStats(signal);

        return {
            score,
            signal,
            action,
            horizon, // New: SHORT, MEDIUM, LONG
            reason: this.generateReason(signal, text),
            technical,
            fundamental
        };
    },

    determineHorizon(text, score) {
        // Keywords for Long Term
        if (text.includes('laba') || text.includes('dividen') || text.includes('akuisisi') || text.includes('proyek')) {
            return { type: 'LONG', label: 'INVESTING (Jangka Panjang)', icon: 'bx-building' };
        }
        // Keywords for Short Term
        if (text.includes('hari ini') || text.includes('transaksi') || text.includes('auto reject') || text.includes('arb')) {
            return { type: 'SHORT', label: 'SCALPING (Harian)', icon: 'bx-stopwatch' };
        }
        // Default to Medium
        return { type: 'MEDIUM', label: 'SWING (Menengah)', icon: 'bx-trending-up' };
    },

    generateReason(signal, text) {
        const reasons = [
            "Sentimen pasar didorong oleh volume transaksi yang tinggi.",
            "Indikator MA-20 menunjukkan potensi pembalikan arah.",
            "Berita ini menciptakan momentum positif jangka pendek.",
            "Investor asing mulai mengakumulasi saham ini.",
            "Secara teknikal, harga sedang menguji resisten kuat.",
            "Fundamental perusahaan tetap solid meski ada isu makro."
        ];
        return reasons[Math.floor(Math.random() * reasons.length)];
    },

    generateTechnicalStats(signal) {
        // Simulate Technical Indicators based on signal
        const isBull = signal === 'BULLISH';
        return {
            rsi: isBull ? 55 + Math.floor(Math.random() * 20) : 30 + Math.floor(Math.random() * 20), // 55-75 vs 30-50
            ma20: isBull ? 'Uptrend ↗️' : 'Downtrend ↘️',
            volume: isBull ? 'High (Accumulation)' : 'Low (Distribution)',
            support: 1000 + Math.floor(Math.random() * 500),
            resistance: 1500 + Math.floor(Math.random() * 500)
        };
    },

    generateFundamentalStats(signal) {
        // Simulate Fundamentals
        return {
            pbv: (1 + Math.random() * 3).toFixed(2) + 'x',
            per: (5 + Math.random() * 20).toFixed(1) + 'x',
            der: (0.2 + Math.random()).toFixed(2) + 'x',
            roe: (5 + Math.random() * 15).toFixed(1) + '%'
        };
    },

    TradingRobot: {
        analyzeOpportunities(allNews) {
            const ONE_DAY_MS = 24 * 60 * 60 * 1000;
            const now = new Date();

            // 1. Filter News (Last 24 Hours) - Strict "Fresh" Data
            const dailyNews = allNews.filter(n => (now - new Date(n.date)) < ONE_DAY_MS);

            // 2. Group by Stock Code
            const stockScores = {};

            dailyNews.forEach(n => {
                let code = n.code;
                if (!code) {
                    const match = n.title.match(/\b[A-Z]{4}\b/);
                    if (match) code = match[0];
                }

                if (code) {
                    if (!stockScores[code]) {
                        stockScores[code] = {
                            code,
                            score: 0,
                            mentions: 0,
                            title: n.title,
                            sector: n.sector
                        };
                    }
                    stockScores[code].score += n.sentiment.score; // +1 or -1
                    stockScores[code].mentions++;
                }
            });

            // 3. Generate Signals
            const signals = Object.values(stockScores).map(stock => {
                let action = 'HOLD';
                let type = 'NEUTRAL';

                // Signal Thresholds
                if (stock.score >= 2) { action = 'BUY'; type = 'BULLISH'; }
                if (stock.score >= 4) { action = 'STRONG BUY'; type = 'BULLISH'; }
                if (stock.score <= -2) { action = 'SELL'; type = 'BEARISH'; }
                if (stock.score <= -4) { action = 'STRONG SELL'; type = 'BEARISH'; }

                if (type === 'NEUTRAL') return null; // Filter out noise

                // 4. Simulate Price Targets (Realistic Logic)
                // Retrieve basePrice from global STOCK_DB if possible, or fallback
                const dbStock = STOCK_DB.find(s => s.code === stock.code);
                const basePrice = dbStock ? dbStock.basePrice : (500 + Math.floor(Math.random() * 4500));

                // Add slight volatility (±1-2%) to simulate "Current Live Price"
                const volatility = (Math.random() * 0.04) - 0.02;
                const currentPrice = Math.floor(basePrice * (1 + volatility));

                let entry, tp, sl;

                // Rounding helper
                const roundPrice = (p) => {
                    if (p < 500) return Math.round(p); // Fraksi 1
                    if (p < 5000) return Math.round(p / 10) * 10; // Fraksi 10
                    return Math.round(p / 25) * 25; // Fraksi 25 (Standard tick)
                };

                if (type === 'BULLISH') {
                    entry = roundPrice(currentPrice);
                    tp = roundPrice(currentPrice * (1 + (0.04 + Math.random() * 0.08))); // +4% to +12%
                    sl = roundPrice(currentPrice * (1 - (0.02 + Math.random() * 0.04))); // -2% to -6%
                } else {
                    // Short Sell / Exit Strategy
                    entry = roundPrice(currentPrice);
                    tp = roundPrice(currentPrice * (1 - (0.04 + Math.random() * 0.08))); // Lower target
                    sl = roundPrice(currentPrice * (1 + (0.02 + Math.random() * 0.04))); // Stop if rises
                }

                return {
                    code: stock.code,
                    action: action,
                    type: type, // BULLISH / BEARISH
                    score: stock.score,
                    entry: entry,
                    tp: tp,
                    sl: sl,
                    reason: `Accumulated Sentiment: ${stock.score > 0 ? '+' : ''}${stock.score} from ${stock.mentions} sources.`
                };
            }).filter(s => s !== null);

            // Sort by Signal Strength (Absolute Score)
            return signals.sort((a, b) => Math.abs(b.score) - Math.abs(a.score));
        }
    }
};
