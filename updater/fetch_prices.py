import yfinance as yf
import json
import os
from datetime import datetime

# List of Stocks to Fetch (Using .JK suffix for Indonesia Stock Exchange)
tickers = [
    "BBCA.JK", "BBRI.JK", "BMRI.JK", "BBNI.JK", "BRIS.JK", "ARTO.JK",
    "ADRO.JK", "PTBA.JK", "ITMG.JK", "BUMI.JK", 
    "ANTM.JK", "MDKA.JK", "AMMN.JK", "INCO.JK", "NCKL.JK",
    "CTRA.JK", "SMRA.JK", "BSDE.JK", "PWON.JK",
    "BREN.JK", "ICBP.JK", "UNVR.JK", "TLKM.JK", "ISAT.JK", "ASII.JK"
]

# Map back to our simple codes (remove .JK)
stock_data = {}

print("🚀 Starting Price Update from Yahoo Finance...")
print("---------------------------------------------")

try:
    # Fetch data in bulk for efficiency
    data = yf.download(tickers, period="1d")
    
    # Get the latest Close prices
    # unexpected data structure can happen with yfinance updates, handling robustly
    current_prices = data['Close'].iloc[-1]
    
    for ticker in tickers:
        simple_code = ticker.replace(".JK", "")
        price = current_prices.get(ticker)
        
        if price is not None and not  price != price: # Check for NaN
            final_price = int(price)
            stock_data[simple_code] = {
                "price": final_price,
                "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
            print(f"✅ {simple_code}: {final_price}")
        else:
            print(f"⚠️ {simple_code}: Failed to fetch or No Data")
            
except Exception as e:
    print(f"❌ critical Error: {e}")

# Save to js/stock_data.json
output_path = os.path.join(os.path.dirname(__file__), '..', 'js', 'stock_data.json')

with open(output_path, 'w') as f:
    json.dump(stock_data, f, indent=4)

print("---------------------------------------------")
print(f"🎉 Success! Data saved to: {output_path}")
print("You can now refresh your website.")
