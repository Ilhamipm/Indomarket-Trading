import json
import os
import datetime

# Source of Truth: Data retrieved manually on Jan 8, 2026
# In a real scenario, this dict could be populated by an API call.
REAL_PRICES = {
    # Banking
    "BBCA": 8075,
    "BBRI": 3700,
    "BMRI": 4850,
    "BBNI": 4200,
    "BRIS": 2170,
    "ARTO": 1995,

    # Mining
    "ADRO": 2080,
    "PTBA": 2420,
    "ITMG": 21925,
    "BUMI": 452,
    "ANTM": 3690,
    "MDKA": 2700,
    "AMMN": 8225,
    "INCO": 6350,
    "NCKL": 1435,

    # Property
    "CTRA": 855,   # Estimated from analysis
    "SMRA": 388,
    "BSDE": 920,
    "PWON": 346,
    "BREN": 9600,

    # IPO / Small Cap / Others
    "STRK": 197,
    "FUTR": 645,
    "KOKA": 252,
    "WIFI": 3430,

    # Consumer / Blue Chip
    "ICBP": 8050,
    "UNVR": 2600,
    "TLKM": 3530,
    "ISAT": 2140,
    "ASII": 7000,
    "GOTO": 67,
    "KLBF": 1205
}

def update_prices():
    # Path to the output JS file (Avoiding JSON fetch for CORS compatibility)
    base_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(base_dir, '..', 'js', 'stock_data.js')
    news_output_path = os.path.join(base_dir, '..', 'js', 'news_data.js')

    data_to_save = {}
    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # 1. Update Prices
    for code, price in REAL_PRICES.items():
        data_to_save[code] = {
            "price": price,
            "last_updated": now_str
        }

    # Ensure/Create directory
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    # Write Prices JS
    js_content = f"window.STOCK_DATA = {json.dumps(data_to_save, indent=4)};"
    with open(output_path, 'w') as f:
        f.write(js_content)
    
    print(f"Successfully updated prices for {len(data_to_save)} stocks.")

    # 2. Fetch News (RSS)
    print("Fetching News...")
    import urllib.request
    import xml.etree.ElementTree as ET
    import time

    news_list = []
    
    # Select a few active tickers to check for news to avoid spamming requests
    tickers_to_check = ["BBCA", "BBRI", "BMRI", "BBNI", "ADRO", "ASII", "GOTO", "TLKM", "ANTM", "AMMN"]
    
    for code in tickers_to_check:
        try:
            # Google News RSS Search
            url = f"https://news.google.com/rss/search?q={code}+saham+indonesia+when:7d&hl=id&gl=ID&ceid=ID:id"
            with urllib.request.urlopen(url) as response:
                xml_data = response.read()
                root = ET.fromstring(xml_data)
                
                # Get first 2 items per ticker
                count = 0
                for item in root.findall('.//item'):
                    if count >= 2: break
                    
                    title = item.find('title').text
                    link = item.find('link').text
                    pubDate = item.find('pubDate').text
                    
                    # Simple Clean
                    title = title.split(' - ')[0] # Remove source suffix if common
                    
                    news_list.append({
                        "source": "Google News",
                        "title": title,
                        "link": link,
                        "date": pubDate,
                        "summary": f"Berita terbaru mengenai saham {code}.",
                        "code": code,
                        "sector": "Market" # Simplified
                    })
                    count += 1
            
            time.sleep(1) # Polite delay
        except Exception as e:
            print(f"Error fetching {code}: {e}")

    # Write News JS
    news_js_content = f"window.MARKET_NEWS = {json.dumps(news_list, indent=4)};"
    with open(news_output_path, 'w', encoding='utf-8') as f:
        f.write(news_js_content)

    print(f"Successfully updated news with {len(news_list)} articles.")

    # 3. History Tracking
    print("Updating History...")
    history_dir = os.path.join(base_dir, '..', 'data')
    os.makedirs(history_dir, exist_ok=True)

    today_date = datetime.datetime.now().strftime("%Y-%m-%d")

    # --- Price History ---
    price_hist_path = os.path.join(history_dir, 'price_history.json')
    price_history = {}
    
    if os.path.exists(price_hist_path):
        try:
            with open(price_hist_path, 'r') as f:
                price_history = json.load(f)
        except: pass
    
    # Append today's prices
    price_history[today_date] = data_to_save
    
    with open(price_hist_path, 'w') as f:
        json.dump(price_history, f, indent=4)

    # --- News History ---
    news_hist_path = os.path.join(history_dir, 'news_history.json')
    news_history = {}

    if os.path.exists(news_hist_path):
        try:
            with open(news_hist_path, 'r') as f:
                news_history = json.load(f)
        except: pass

    # Append today's news
    news_history[today_date] = news_list

    with open(news_hist_path, 'w') as f:
        json.dump(news_history, f, indent=4)

    print(f"History updated for {today_date}")



if __name__ == "__main__":
    update_prices()
