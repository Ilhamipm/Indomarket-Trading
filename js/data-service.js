window.StockApp = window.StockApp || {};

// Massive List of Real IHSG Tickers
const STOCK_DB = [
    { code: 'BBCA', sector: 'Banking', name: 'PT Bank Central Asia Tbk', owner: 'Jardine Hartono (55%), Public (45%)', basePrice: 10150 },
    { code: 'BBRI', sector: 'Banking', name: 'PT Bank Rakyat Indonesia (Persero) Tbk', owner: 'Negara RI (53%), Public (47%)', basePrice: 5400 },
    { code: 'BMRI', sector: 'Banking', name: 'PT Bank Mandiri (Persero) Tbk', owner: 'Negara RI (52%), Public (48%)', basePrice: 6500 },
    { code: 'BBNI', sector: 'Banking', name: 'PT Bank Negara Indonesia (Persero) Tbk', owner: 'Negara RI (60%), Public (40%)', basePrice: 5350 },
    { code: 'BRIS', sector: 'Banking', name: 'PT Bank Syariah Indonesia Tbk', owner: 'Bank Mandiri (51%), BNI (23%), BRI (15%)', basePrice: 2450 },
    { code: 'ARTO', sector: 'Banking', name: 'PT Bank Jago Tbk', owner: 'Metamorfosis Ekosistem (29%), Gojek (21%)', basePrice: 2800 },
    { code: 'ADRO', sector: 'Mining-Coal', name: 'PT Adaro Energy Indonesia Tbk', owner: 'Garibaldi Thohir (6%), Public (94%)', basePrice: 3800 },
    { code: 'PTBA', sector: 'Mining-Coal', name: 'PT Bukit Asam Tbk', owner: 'MIND ID (65%), Public (35%)', basePrice: 2600 },
    { code: 'ITMG', sector: 'Mining-Coal', name: 'PT Indo Tambangraya Megah Tbk', owner: 'Banpu Minerals (65%), Public (35%)', basePrice: 24000 },
    { code: 'BUMI', sector: 'Mining-Coal', name: 'PT Bumi Resources Tbk', owner: 'Bakrie Group & Salim Group Consortium', basePrice: 120 },
    { code: 'ANTM', sector: 'Mining-Gold', name: 'PT Aneka Tambang Tbk', owner: 'MIND ID (65%), Public (35%)', basePrice: 1600 },
    { code: 'MDKA', sector: 'Mining-Gold', name: 'PT Merdeka Copper Gold Tbk', owner: 'Saratoga (18%), Mitra Daya (13%)', basePrice: 2500 },
    { code: 'AMMN', sector: 'Mining-Gold', name: 'PT Amman Mineral Internasional Tbk', owner: 'Medco Energi & Salim Group', basePrice: 12000 },
    { code: 'INCO', sector: 'Mining-Nickel', name: 'PT Vale Indonesia Tbk', owner: 'Vale Canada (43%), MIND ID (20%)', basePrice: 4100 },
    { code: 'NCKL', sector: 'Mining-Nickel', name: 'PT Trimegah Bangun Persada Tbk', owner: 'Harita Group (80%), Public (20%)', basePrice: 950 },
    { code: 'CTRA', sector: 'Property', name: 'PT Ciputra Development Tbk', owner: 'Kel. Ciputra (52%), Public (48%)', basePrice: 1300 },
    { code: 'SMRA', sector: 'Property', name: 'PT Summarecon Agung Tbk', owner: 'Kel. Soetjipto (58%), Public (42%)', basePrice: 650 },
    { code: 'BSDE', sector: 'Property', name: 'PT Bumi Serpong Damai Tbk', owner: 'Sinarmas Land (60%), Public (40%)', basePrice: 1050 },
    { code: 'PWON', sector: 'Property', name: 'PT Pakuwon Jati Tbk', owner: 'Pakuwon Arthaniaga (68%), Public (32%)', basePrice: 420 },
    { code: 'BREN', sector: 'IPO', name: 'PT Barito Renewables Energy Tbk', owner: 'Barito Pacific (66%), Green Era (24%)', basePrice: 11000 },
    { code: 'BRAND', sector: 'IPO', name: 'PT Brand Brand (Fictional IPO)', owner: 'Unknown Founders (70%), Public (30%)', basePrice: 300 },
    { code: 'STRK', sector: 'Small Cap', name: 'PT Lovina Beach Brewery Tbk', owner: 'Baruna Bina (78%), Public (22%)', basePrice: 50 },
    { code: 'FUTR', sector: 'Small Cap', name: 'PT Liofil Foods Tbk', owner: 'Asia Future (60%), Public (40%)', basePrice: 50 },
    { code: 'KOKA', sector: 'Small Cap', name: 'PT Koka Indonesia Tbk', owner: 'Chiqo (75%), Public (25%)', basePrice: 65 },
    { code: 'WIFI', sector: 'Small Cap', name: 'PT Solusi Sinergi Digital Tbk', owner: 'Investasi Gemilang (55%), Public (45%)', basePrice: 145 },
    { code: 'ICBP', sector: 'Consumer', name: 'PT Indofood CBP Sukses Makmur Tbk', owner: 'Indofood Sukses Makmur (80%)', basePrice: 10500 },
    { code: 'UNVR', sector: 'Consumer', name: 'PT Unilever Indonesia Tbk', owner: 'Unilever Indonesia Holding (85%)', basePrice: 2800 },
    { code: 'TLKM', sector: 'Telco', name: 'PT Telkom Indonesia (Persero) Tbk', owner: 'Negara RI (52%), Public (48%)', basePrice: 3100 },
    { code: 'ISAT', sector: 'Telco', name: 'PT Indosat Ooredoo Hutchison Tbk', owner: 'Ooredoo Hutchison (65%), Public (35%)', basePrice: 11500 },
    { code: 'ASII', sector: 'Auto', name: 'PT Astra International Tbk', owner: 'Jardine cycle & Carriage (50%)', basePrice: 5200 },
    { code: 'GOTO', sector: 'Tech', name: 'PT GoTo Gojek Tokopedia Tbk', owner: 'GOTO Peopleverse (5%), Taobao (8%)', basePrice: 50 },
    { code: 'KLBF', sector: 'Consumer', name: 'PT Kalbe Farma Tbk', owner: 'Sapta (14%), Public (86%)', basePrice: 1500 }
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
        let allNews = [];

        // 1. Load Real-Time Price Data (from global window.STOCK_DATA)
        if (window.STOCK_DATA) {
            console.log("Using Global JS Price Data");
            STOCK_DB.forEach(stock => {
                if (window.STOCK_DATA[stock.code]) {
                    stock.basePrice = window.STOCK_DATA[stock.code].price;
                    stock.lastUpdated = window.STOCK_DATA[stock.code].last_updated;
                }
            });
        } else {
            console.log("No global price data found. Using default hardcoded prices.");
        }

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
        };
    }
};
