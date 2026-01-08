window.StockApp = window.StockApp || {};

// Massive List of Real IHSG Tickers
const STOCK_DB = [
    { code: 'BBCA', sector: 'Banking', name: 'Bank Central Asia', owner: 'Jardine Hartono (55%), Public (45%)', basePrice: 8150 },
    { code: 'BBRI', sector: 'Banking', name: 'Bank Rakyat Indonesia', owner: 'Negara RI (53%), Public (47%)', basePrice: 3700 },
    { code: 'BMRI', sector: 'Banking', name: 'Bank Mandiri', owner: 'Negara RI (52%), Public (48%)', basePrice: 4810 },
    { code: 'BBNI', sector: 'Banking', name: 'Bank Negara Indonesia', owner: 'Negara RI (60%), Public (40%)', basePrice: 4200 },
    { code: 'BRIS', sector: 'Banking', name: 'Bank Syariah Indonesia', owner: 'Bank Mandiri (51%), BNI (23%), BRI (15%)', basePrice: 2450 },
    { code: 'ARTO', sector: 'Banking', name: 'Bank Jago (Digital)', owner: 'Metamorfosis Ekosistem (29%), Gojek (21%)', basePrice: 2100 },
    { code: 'ADRO', sector: 'Mining-Coal', name: 'Adaro Energy', owner: 'Garibaldi Thohir (6%), Public (94%)', basePrice: 2010 },
    { code: 'PTBA', sector: 'Mining-Coal', name: 'Bukit Asam', owner: 'MIND ID (65%), Public (35%)', basePrice: 2600 },
    { code: 'ITMG', sector: 'Mining-Coal', name: 'Indo Tambangraya Megah', owner: 'Banpu Minerals (65%), Public (35%)', basePrice: 24000 },
    { code: 'BUMI', sector: 'Mining-Coal', name: 'Bumi Resources', owner: 'Bakrie Group & Salim Group Consortium', basePrice: 120 },
    { code: 'ANTM', sector: 'Mining-Gold', name: 'Aneka Tambang', owner: 'MIND ID (65%), Public (35%)', basePrice: 1600 },
    { code: 'MDKA', sector: 'Mining-Gold', name: 'Merdeka Copper Gold', owner: 'Saratoga (18%), Mitra Daya (13%)', basePrice: 2500 },
    { code: 'AMMN', sector: 'Mining-Gold', name: 'Amman Mineral', owner: 'Medco Energi & Salim Group', basePrice: 11500 },
    { code: 'INCO', sector: 'Mining-Nickel', name: 'Vale Indonesia', owner: 'Vale Canada (43%), MIND ID (20%)', basePrice: 3900 },
    { code: 'NCKL', sector: 'Mining-Nickel', name: 'Trimegah Bangun Persada', owner: 'Harita Group (80%), Public (20%)', basePrice: 900 },
    { code: 'CTRA', sector: 'Property', name: 'Ciputra Development', owner: 'Kel. Ciputra (52%), Public (48%)', basePrice: 1300 },
    { code: 'SMRA', sector: 'Property', name: 'Summarecon Agung', owner: 'Kel. Soetjipto (58%), Public (42%)', basePrice: 650 },
    { code: 'BSDE', sector: 'Property', name: 'Bumi Serpong Damai', owner: 'Sinarmas Land (60%), Public (40%)', basePrice: 1050 },
    { code: 'PWON', sector: 'Property', name: 'Pakuwon Jati', owner: 'Pakuwon Arthaniaga (68%), Public (32%)', basePrice: 420 },
    { code: 'BREN', sector: 'IPO', name: 'Barito Renewables', owner: 'Barito Pacific (66%), Green Era (24%)', basePrice: 8500 },
    { code: 'BRAND', sector: 'IPO', name: 'Brand Brand (Fictional IPO)', owner: 'Unknown Founders (70%), Public (30%)', basePrice: 300 },
    { code: 'STRK', sector: 'Small Cap', name: 'Lovina Beach', owner: 'Baruna Bina (78%), Public (22%)', basePrice: 50 },
    { code: 'FUTR', sector: 'Small Cap', name: 'Liofil Foods', owner: 'Asia Future (60%), Public (40%)', basePrice: 50 },
    { code: 'KOKA', sector: 'Small Cap', name: 'Koka Indonesia', owner: 'Chiqo (75%), Public (25%)', basePrice: 65 },
    { code: 'WIFI', sector: 'Small Cap', name: 'Solusi Sinergi', owner: 'Investasi Gemilang (55%), Public (45%)', basePrice: 145 },
    { code: 'ICBP', sector: 'Consumer', name: 'Indofood CBP', owner: 'Indofood Sukses Makmur (80%)', basePrice: 10500 },
    { code: 'UNVR', sector: 'Consumer', name: 'Unilever Indonesia', owner: 'Unilever Indonesia Holding (85%)', basePrice: 2600 },
    { code: 'TLKM', sector: 'Telco', name: 'Telkom Indonesia', owner: 'Negara RI (52%), Public (48%)', basePrice: 3540 },
    { code: 'ISAT', sector: 'Telco', name: 'Indosat Ooredoo', owner: 'Ooredoo Hutchison (65%), Public (35%)', basePrice: 10200 },
    { code: 'ASII', sector: 'Auto', name: 'Astra International', owner: 'Jardine cycle & Carriage (50%)', basePrice: 7025 }
];

const TEMPLATES = [
    { t: "Laba Bersih [CODE] Melonjak [NUM]% di Kuartal Ini", sentiment: 'pos' },
    { t: "[CODE] Resmi Bagi Dividen Rp [NUM] per Saham", sentiment: 'pos' },
    { t: "Asing Borong Saham [CODE], Harga Meroket ke Level Tertinggi", sentiment: 'pos' },
    { t: "Ekspansi Bisnis, [CODE] Akuisisi Lahan Baru", sentiment: 'pos' },
    { t: "Saham [CODE] Auto Reject Atas (ARA) 3 Hari Berturut-turut", sentiment: 'pos' },
    { t: "Proyek Strategis [CODE] Disetujui Pemerintah", sentiment: 'pos' },
    { t: "[CODE] Catat Pendapatan Tertinggi Sepanjang Sejarah", sentiment: 'pos' },
    { t: "Kinerja [CODE] Tertekan, Rugi Bersih Membengkak", sentiment: 'neg' },
    { t: "Investor Asing Lepas [CODE], Harga Koreksi Dalam", sentiment: 'neg' },
    { t: "[CODE] Hadapi Gugatan PKPU, Saham Terjun Bebas", sentiment: 'neg' },
    { t: "Harga Saham [CODE] Anjlok Menyentuh ARB", sentiment: 'neg' },
    { t: "PHK Massal, [CODE] Lakukan Efisiensi Besar-besaran", sentiment: 'neg' },
    { t: "[CODE] Gelar RUPS Tahunan Pekan Depan", sentiment: 'neu' },
    { t: "Analis Rekomendasikan BUY untuk Saham [CODE]", sentiment: 'pos' },
    { t: "Volume Transaksi [CODE] Meningkat Signifikan Hari Ini", sentiment: 'pos' },
    { t: "Isu Merger [CODE] Kembali Mencuat di Pasar", sentiment: 'pos' }
];

StockApp.Data = {

    async fetchAllNews() {
        // Try fetch real prices first
        await this.syncLivePrices();

        let allNews = [];

        try {
            const raw = await fetch('https://berita-indo-api-mirror.vercel.app/v1/cnbc-news/market').then(r => r.json()).catch(() => null);
            if (raw && raw.data) {
                allNews = raw.data.map(item => ({
                    source: 'CNBC Indonesia',
                    title: item.title,
                    link: item.link,
                    date: new Date(item.isoDate),
                    summary: item.contentSnippet || '',
                    sector: 'bluechip'
                }));
            }
        } catch (e) { }

        // Generate Synthetic News
        const generatedCount = 60;
        const syntheticNews = Array.from({ length: generatedCount }).map(() => this.generateArticle());

        // Strict 7 Day Filter
        const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
        const now = new Date();
        const minDate = new Date(now.getTime() - ONE_WEEK_MS);

        let combined = [...syntheticNews, ...allNews];

        // Filter out old news
        combined = combined.filter(n => new Date(n.date) >= minDate);

        // Sort new to old
        return combined.sort((a, b) => b.date - a.date);
    },

    lookupStock(codeOrTitle) {
        // Helper to find stock data from DB
        codeOrTitle = codeOrTitle.toUpperCase();
        // Try strict code match
        let found = STOCK_DB.find(s => s.code === codeOrTitle);
        if (found) return found;

        // Try regex code extraction
        const match = codeOrTitle.match(/\b[A-Z]{4}\b/);
        if (match) {
            found = STOCK_DB.find(s => s.code === match[0]);
            if (found) return found;
        }

        return null;
    },

    generateArticle() {
        const stock = STOCK_DB[Math.floor(Math.random() * STOCK_DB.length)];
        const template = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)];
        const num = Math.floor(Math.random() * 50) + 5;

        let title = template.t;
        if (stock.sector === 'Property' && title.includes('Akuisisi')) {
            title = "Ekspansi Land Bank, [CODE] Akuisisi Lahan 50 Ha di IKN";
        }
        if (stock.sector.includes('Mining') && Math.random() > 0.7) {
            title = Math.random() > 0.5 ?
                "Harga Komoditas Naik, [CODE] Genjot Produksi" :
                "Hilirisasi Berjalan, Smelter [CODE] Mulai Beroperasi";
        }

        title = title.replace('[CODE]', stock.code).replace('[NUM]', num);

        const summary = `Update terkini emiten ${stock.name} (${stock.code}). ` +
            (template.sentiment === 'pos' ? 'Fundamental kokoh dengan sentimen pasar positif.' :
                template.sentiment === 'neg' ? 'Tantangan makro ekonomi menekan kinerja perseroan.' :
                    'Konsolidasi harga terjadi di tengah penantian rilis data keuangan.');

        const googleLink = `https://www.google.com/search?q=${encodeURIComponent(title + ' ' + stock.code)}`;

        // TIME LOGIC: Strictly 0 to 7 Days Ago
        const now = new Date();
        const maxDays = 7;
        const timeDiff = Math.random() * maxDays * 24 * 60 * 60 * 1000;
        let newsDate = new Date(now.getTime() - timeDiff);

        // Bias towards recent days (optional, but keep distribution somewhat even)
        // If we want "Today" bias, we can do power of random, but linear is safer for coverage.

        // Randomize hour (Market Hours 08:00 - 17:00)
        newsDate.setHours(Math.floor(Math.random() * (17 - 8 + 1)) + 8);
        newsDate.setMinutes(Math.floor(Math.random() * 60));

        // Ensure we don't go into the future
        if (newsDate > now) {
            newsDate = new Date(now.getTime() - (Math.random() * 60 * 60 * 1000));
        }

        return {
            source: 'IHSG Market Intelligence',
            title: title,
            link: googleLink,
            image: null,
            date: newsDate,
            summary: summary,
            sector: stock.sector,
            code: stock.code
            async syncLivePrices() {
                console.log("Attempting to fetch Live IDX Data...");
                try {
                    // Use AllOrigins Proxy to bypass CORS for IDX API
                    const proxyUrl = 'https://api.allorigins.win/raw?url=';
                    const targetUrl = encodeURIComponent('https://www.idx.co.id/primary/TradingSummary/GetStockSummary?length=9999&start=0');

                    const response = await fetch(proxyUrl + targetUrl);
                    if (!response.ok) throw new Error("Proxy Error");

                    const data = await response.json();
                    if (data && data.data) {
                        let updatedCount = 0;
                        data.data.forEach(realStock => {
                            const localStock = STOCK_DB.find(s => s.code === realStock.StockCode);
                            if (localStock) {
                                // Update basePrice with Real LastPrice
                                localStock.basePrice = realStock.LastPrice;
                                updatedCount++;
                            }
                        });
                        console.log(`Live Prices Synced for ${updatedCount} stocks.`);
                    }
                } catch (e) {
                    console.warn("Live Sync Failed (CORS/Network), using cached values:", e);
                }
            }
        };
    }
};
