import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const CATALOG_URL = "https://catalog.comifuro.net/catalog";
const OUTPUT_PATH = resolve(process.cwd(), "data", "comifuro23-full.json");

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.5"
};

async function fetchFromHtml(): Promise<any[]> {
  console.log(`[1/3] Mengambil HTML dari ${CATALOG_URL}...`);
  const res = await fetch(CATALOG_URL, { headers: HEADERS });
  if (!res.ok) {
    throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
  }

  const html = await res.text();
  const match = html.match(
    /window\.__INITIAL_STATE__\s*=\s*(\{.*?\});\s*(?:var|document|<\/script>)/s
  );

  if (!match) {
    throw new Error(
      "Gagal menemukan window.__INITIAL_STATE__ di dalam dokumen HTML."
    );
  }

  const state = JSON.parse(match[1]);
  const circles = state?.circle?.allCircle;
  if (!Array.isArray(circles) || circles.length === 0) {
    throw new Error("Data 'allCircle' kosong atau tidak ditemukan.");
  }

  return circles;
}

async function fetchFromSupabaseFallback(): Promise<any[]> {
  console.log("[Fallback] Mengambil data dari Supabase REST API...");
  const anonKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
    "eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYyODc2MjA1NywiZXhwIjoxOTQ0MzM4MDU3fQ." +
    "hh2QYLaCosx17vQxleoc";

  const baseUrl =
    "https://kumxjefxtrrpzalmwvvr.supabase.co/rest/v1/circle_data?select=*&order=id.asc";
  const allData: any[] = [];
  const pageSize = 1000;
  let start = 0;

  while (true) {
    const end = start + pageSize - 1;
    const res = await fetch(baseUrl, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        Range: `${start}-${end}`
      }
    });

    if (!res.ok) {
      throw new Error(`Supabase REST error: ${res.status} ${res.statusText}`);
    }

    const chunk = await res.json();
    if (!Array.isArray(chunk)) break;
    allData.push(...chunk);

    if (chunk.length < pageSize) break;
    start += pageSize;
  }

  return allData;
}

async function main() {
  console.log("=======================================================");
  console.log("       SCRAPER MASTER KATALOG COMIFURO 23 (CF23)       ");
  console.log("=======================================================\n");

  let circles: any[] = [];
  try {
    circles = await fetchFromHtml();
    console.log(` -> Berhasil mengekstrak ${circles.length} circle dari HTML SSR.`);
  } catch (err) {
    console.warn(`[Peringatan] Gagal via HTML: ${(err as Error).message}. Mencoba fallback Supabase...`);
    circles = await fetchFromSupabaseFallback();
    console.log(` -> Berhasil mengambil ${circles.length} circle dari Supabase.`);
  }

  console.log(`\n[2/3] Memvalidasi ${circles.length} entri katalog...`);
  const withBooth = circles.filter((c) => c.circle_code).length;
  const withCut = circles.filter((c) => c.circle_cut).length;
  const withSampleWorks = circles.filter(
    (c) => Array.isArray(c.sampleworks_images) && c.sampleworks_images.length > 0
  ).length;

  console.log(` -> Total Circle        : ${circles.length}`);
  console.log(` -> Dengan Kode Booth   : ${withBooth}`);
  console.log(` -> Dengan Circle Cut   : ${withCut}`);
  console.log(` -> Dengan Sample Works : ${withSampleWorks}`);

  const outputDir = dirname(OUTPUT_PATH);
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  console.log(`\n[3/3] Menyimpan ke: ${OUTPUT_PATH}...`);
  writeFileSync(OUTPUT_PATH, JSON.stringify(circles, null, 2), "utf-8");

  console.log("\n=======================================================");
  console.log("✔ Selesai! Data katalog CF23 berhasil disimpan.");
  console.log("=======================================================\n");
}

main().catch((err) => {
  console.error("Terjadi kesalahan:", err);
  process.exit(1);
});
