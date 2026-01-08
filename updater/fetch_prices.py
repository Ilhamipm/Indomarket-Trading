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

    data_to_save = {}
    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    for code, price in REAL_PRICES.items():
        data_to_save[code] = {
            "price": price,
            "last_updated": now_str
        }

    # Ensure/Create directory
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    # Write as a JavaScript file
    js_content = f"window.STOCK_DATA = {json.dumps(data_to_save, indent=4)};"

    with open(output_path, 'w') as f:
        f.write(js_content)
    
    print(f"Successfully updated prices for {len(data_to_save)} stocks.")
    print(f"Saved to: {output_path}")

if __name__ == "__main__":
    update_prices()
