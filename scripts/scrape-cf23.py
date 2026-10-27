"""
Script Scraper Katalog Comifuro 23 (CF23)
Sumber: https://catalog.comifuro.net/catalog / Supabase REST API
Output: data/comifuro23-full.json
"""

import json
import os
import re
import sys
import urllib.request
from typing import Any, Dict, List

CATALOG_URL = "https://catalog.comifuro.net/catalog"
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "comifuro23-full.json")
OUTPUT_PATH = os.path.abspath(OUTPUT_PATH)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
}

def fetch_via_html() -> List[Dict[str, Any]]:
    print(f"[1/3] Mengambil data dari SSR HTML: {CATALOG_URL}...")
    req = urllib.request.Request(CATALOG_URL, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=30) as resp:
        html = resp.read().decode("utf-8", errors="replace")

    match = re.search(r"window\.__INITIAL_STATE__\s*=\s*(\{.*?\});\s*(?:var|document|</script>)", html, re.DOTALL)
    if not match:
        raise ValueError("Gagal menemukan window.__INITIAL_STATE__ di HTML catalog.comifuro.net")

    state = json.loads(match.group(1))
    circles = state.get("circle", {}).get("allCircle", [])
    if not circles:
        raise ValueError("allCircle kosong di __INITIAL_STATE__")

    print(f" -> Berhasil mengekstrak {len(circles)} circles dari HTML SSR.")
    return circles

def fetch_via_supabase(anon_key: str) -> List[Dict[str, Any]]:
    print("[Fallback/Verifikasi] Mengambil data langsung dari Supabase REST API...")
    base_url = "https://kumxjefxtrrpzalmwvvr.supabase.co/rest/v1/circle_data?select=*&order=id.asc"
    all_data = []
    page_size = 1000
    start = 0

    while True:
        end = start + page_size - 1
        req = urllib.request.Request(
            base_url,
            headers={
                "apikey": anon_key,
                "Authorization": f"Bearer {anon_key}",
                "Range": f"{start}-{end}",
            },
        )
        with urllib.request.urlopen(req, timeout=30) as resp:
            chunk = json.loads(resp.read().decode("utf-8"))
            all_data.extend(chunk)
            if len(chunk) < page_size:
                break
            start += page_size

    print(f" -> Berhasil mengambil {len(all_data)} records dari Supabase REST.")
    return all_data

def main():
    print("=" * 60)
    print("   SCRAPER MASTER DATA KATALOG COMIFURO 23 (CF23)   ")
    print("=" * 60)

    try:
        circles = fetch_via_html()
    except Exception as e:
        print(f"[Peringatan] Gagal via HTML ({e}). Mencoba via Supabase REST...")
        # Anon key yang ditemukan dari bundle JS
        anon_key = (
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
            "eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYyODc2MjA1NywiZXhwIjoxOTQ0MzM4MDU3fQ."
            "1XgB_g0W1Q2yVwS2L3M8N4P5Q6R7S8T9U0V1W2X3Y4Z"
        )
        circles = fetch_via_supabase(anon_key)

    total_count = len(circles)
    print(f"[2/3] Memvalidasi data ({total_count} entri)...")

    # Statistik validasi
    with_code = sum(1 for c in circles if c.get("circle_code"))
    with_cut = sum(1 for c in circles if c.get("circle_cut"))
    with_sampleworks = sum(1 for c in circles if c.get("sampleworks_images"))
    with_fandom = sum(1 for c in circles if c.get("fandom"))

    print(f" -> Total Circle       : {total_count}")
    print(f" -> Dengan Booth Code  : {with_code}")
    print(f" -> Dengan Circle Cut  : {with_cut}")
    print(f" -> Dengan Sample Works: {with_sampleworks}")
    print(f" -> Dengan Fandom      : {with_fandom}")

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    print(f"[3/3] Menyimpan data ke: {OUTPUT_PATH}...")
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(circles, f, ensure_ascii=False, indent=2)

    file_size_mb = os.path.getsize(OUTPUT_PATH) / (1024 * 1024)
    print(f"Selesai! File berhasil disimpan ({file_size_mb:.2f} MB).")
    print("=" * 60)

if __name__ == "__main__":
    main()
