import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { eq } from "drizzle-orm";
import { db } from "../db/index";
import {
  boothLocations,
  circles,
  events,
  floorMaps,
  products,
  type Circle,
  type Product
} from "../db/schema";
import {
  generateUniqueCircleSlug,
  matchFloorMap,
  normalizeComifuroItem,
  type RawComifuroItem
} from "../lib/catalog-ingestion";

interface CliOptions {
  source?: string;
  isUrl: boolean;
  eventSlug: string;
  eventName: string;
  dryRun: boolean;
  help: boolean;
}

class DryRunRollbackError extends Error {
  constructor() {
    super("DRY_RUN_ROLLBACK");
  }
}

function parseCliArgs(): CliOptions {
  const args = process.argv.slice(2);
  const options: CliOptions = {
    isUrl: false,
    eventSlug: "comifuro-20",
    eventName: "Comic Frontier 20 (Comifuro 20)",
    dryRun: false,
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--help" || arg === "-h") {
      options.help = true;
      continue;
    }

    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }

    if (arg.startsWith("--file=")) {
      options.source = arg.slice(7);
      options.isUrl = false;
      continue;
    }

    if (arg === "--file" || arg === "-f") {
      options.source = args[++i];
      options.isUrl = false;
      continue;
    }

    if (arg.startsWith("--url=")) {
      options.source = arg.slice(6);
      options.isUrl = true;
      continue;
    }

    if (arg === "--url" || arg === "-u") {
      options.source = args[++i];
      options.isUrl = true;
      continue;
    }

    if (arg.startsWith("--event-slug=")) {
      options.eventSlug = arg.slice(13);
      continue;
    }

    if (arg === "--event-slug") {
      options.eventSlug = args[++i];
      continue;
    }

    if (arg.startsWith("--event-name=")) {
      options.eventName = arg.slice(13);
      continue;
    }

    if (arg === "--event-name") {
      options.eventName = args[++i];
      continue;
    }

    // Positional argument
    if (!arg.startsWith("-") && !options.source) {
      options.source = arg;
      options.isUrl = arg.startsWith("http://") || arg.startsWith("https://");
    }
  }

  return options;
}

function printHelp() {
  console.log(`
===================================================================
Pipeline Ingestion Katalog Comifuro (Supabase JSON -> PostgreSQL Drizzle)
===================================================================

Penggunaan:
  npm run db:import [opsi] [file_atau_url]

Contoh:
  # Impor dari file bawaan (data/comifuro20-sample.json)
  npm run db:import

  # Impor dari file JSON lokal
  npm run db:import -- ./data/my-cf-catalog.json
  npm run db:import -- --file ./katalog.json

  # Impor langsung dari REST endpoint / URL Supabase
  npm run db:import -- https://example.com/cf20-circles.json
  npm run db:import -- --url https://example.supabase.co/rest/v1/circles?select=*

  # Simulasi impor tanpa mengubah database (dry-run)
  npm run db:import -- --dry-run ./data/comifuro20-sample.json

Opsi:
  -f, --file <path>        Lokasi file JSON katalog lokal
  -u, --url <url>          URL endpoint Supabase / file JSON publik
  --event-slug <slug>      Slug event target di database (default: comifuro-20)
  --event-name <name>      Nama event jika baru dibuat (default: Comic Frontier 20 (Comifuro 20))
  --dry-run                Jalankan transaksi dan rollback di akhir (simulasi)
  -h, --help               Tampilkan panduan bantuan ini
`);
}

async function loadCatalogData(
  source: string | undefined,
  isUrl: boolean
): Promise<{ data: RawComifuroItem[]; sourceDescription: string }> {
  let resolvedSource = source;

  // Jika tidak ada argumen sumber, cari file sampel default
  if (!resolvedSource) {
    const defaultPaths = [
      resolve(process.cwd(), "data", "comifuro20-sample.json"),
      resolve(process.cwd(), "data", "cf20-catalog.json")
    ];

    const found = defaultPaths.find((p) => existsSync(p));
    if (found) {
      resolvedSource = found;
      isUrl = false;
    } else {
      throw new Error(
        "Tidak ada file data atau URL yang ditentukan, dan file default 'data/comifuro20-sample.json' tidak ditemukan.\n" +
          "Jalankan 'npm run db:import -- --help' untuk melihat panduan penggunaan."
      );
    }
  }

  if (isUrl) {
    console.log(`Mengambil data katalog dari endpoint: ${resolvedSource}...`);
    const res = await fetch(resolvedSource, {
      headers: {
        Accept: "application/json",
        "User-Agent": "comipocket-ingestion/1.0"
      }
    });

    if (!res.ok) {
      throw new Error(
        `Gagal mengambil data dari URL (HTTP ${res.status}: ${res.statusText})`
      );
    }

    const json = (await res.json()) as unknown;
    const items = extractArrayFromPayload(json);
    return { data: items, sourceDescription: `URL (${resolvedSource})` };
  }

  const filePath = resolve(process.cwd(), resolvedSource);
  if (!existsSync(filePath)) {
    throw new Error(`File tidak ditemukan di path: ${filePath}`);
  }

  console.log(`Membaca file lokal: ${filePath}...`);
  const rawText = readFileSync(filePath, "utf-8");
  let json: unknown;
  try {
    json = JSON.parse(rawText);
  } catch (err) {
    throw new Error(
      `Format file JSON tidak valid (${filePath}): ${(err as Error).message}`
    );
  }

  const items = extractArrayFromPayload(json);
  return { data: items, sourceDescription: `File lokal (${filePath})` };
}

function extractArrayFromPayload(payload: unknown): RawComifuroItem[] {
  if (Array.isArray(payload)) {
    return payload as RawComifuroItem[];
  }

  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    if (Array.isArray(obj.data)) {
      return obj.data as RawComifuroItem[];
    }
    if (Array.isArray(obj.circles)) {
      return obj.circles as RawComifuroItem[];
    }
    if (Array.isArray(obj.items)) {
      return obj.items as RawComifuroItem[];
    }
  }

  throw new Error(
    "Struktur JSON tidak berisi array data circle yang valid. Harap gunakan format array [ { ... } ]."
  );
}

async function main() {
  const options = parseCliArgs();

  if (options.help) {
    printHelp();
    return;
  }

  console.log("\n=======================================================");
  console.log("   PIPELINE INGESTION KATALOG COMIFURO (DRIZZLE ORM)  ");
  console.log("=======================================================\n");

  const startTime = Date.now();
  const { data: rawItems, sourceDescription } = await loadCatalogData(
    options.source,
    options.isUrl
  );

  console.log(`Ditemukan ${rawItems.length} entri katalog mentah.`);
  if (options.dryRun) {
    console.log("[PERINGATAN] Mode --dry-run aktif! Perubahan TIDAK akan disimpan ke database.\n");
  }

  const stats = {
    totalRaw: rawItems.length,
    validCircles: 0,
    circlesCreated: 0,
    circlesUpdated: 0,
    boothsCreated: 0,
    boothsUpdated: 0,
    productsCreated: 0,
    productsUpdated: 0,
    skipped: 0
  };

  try {
    await db.transaction(async (tx) => {
      // -------------------------------------------------------------
      // 1. EVENT & FLOOR MAP COMIFURO AKTIF
      // -------------------------------------------------------------
      console.log(`[1/4] Memastikan event '${options.eventSlug}' aktif...`);

      let event = await tx.query.events.findFirst({
        where: eq(events.slug, options.eventSlug)
      });

      if (!event) {
        const [inserted] = await tx
          .insert(events)
          .values({
            name: options.eventName,
            slug: options.eventSlug,
            description:
              "Comic Frontier 20 di ICE BSD City. Pasar kreatif anime/pop culture terbesar di Indonesia. Katalog buruan circle artist alley, booth korporat, dan panduan belanja multi-day.",
            venue: "ICE BSD City (Hall 8, 9, 10), Tangerang",
            bannerImageUrl:
              "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1600&q=80",
            startsAt: new Date("2026-07-18T09:00:00+07:00"),
            endsAt: new Date("2026-07-19T18:00:00+07:00"),
            budget: 2500000,
            isActive: true
          })
          .returning();
        event = inserted;
        console.log(` -> Event baru dibuat: '${event.name}' (${event.id})`);
      } else if (!event.isActive) {
        await tx
          .update(events)
          .set({ isActive: true, updatedAt: new Date() })
          .where(eq(events.id, event.id));
        console.log(` -> Event '${event.name}' diaktifkan.`);
      } else {
        console.log(` -> Event aktif ditemukan: '${event.name}' (${event.id})`);
      }

      // Pastikan floor map default tersedia
      let currentFloorMaps = await tx.query.floorMaps.findMany({
        where: eq(floorMaps.eventId, event.id)
      });

      if (currentFloorMaps.length === 0) {
        console.log(" -> Membuat floor map default untuk event...");
        const insertedMaps = await tx
          .insert(floorMaps)
          .values([
            {
              eventId: event.id,
              name: "Hall 8 - Artist Alley (Blok A-M)",
              hall: "Hall 8",
              imageUrl:
                "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80",
              width: 1400,
              height: 900
            },
            {
              eventId: event.id,
              name: "Hall 9 - Creators & Corporate (Blok N-Z)",
              hall: "Hall 9",
              imageUrl:
                "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
              width: 1400,
              height: 900
            }
          ])
          .returning();
        currentFloorMaps = insertedMaps;
      }

      // -------------------------------------------------------------
      // 2. PRE-FETCH DATA UNTUK EFISIENSI & IDEMPOTENSI
      // -------------------------------------------------------------
      console.log("[2/4] Mengindeks data database yang sudah ada...");

      const allDbCircles = await tx.query.circles.findMany();
      const existingSlugs = new Set(allDbCircles.map((c) => c.slug));
      const circlesById = new Map<string, Circle>(
        allDbCircles.map((c) => [c.id, c])
      );
      const circlesBySlug = new Map<string, Circle>(
        allDbCircles.map((c) => [c.slug, c])
      );

      const existingBooths = await tx.query.boothLocations.findMany({
        where: eq(boothLocations.eventId, event.id)
      });
      const boothsByCode = new Map(
        existingBooths.map((b) => [b.boothCode.toUpperCase(), b])
      );

      const existingProducts = await tx.query.products.findMany({
        where: eq(products.eventId, event.id)
      });
      const productsByCircleId = new Map<string, Product[]>();
      for (const prod of existingProducts) {
        const list = productsByCircleId.get(prod.circleId) ?? [];
        list.push(prod);
        productsByCircleId.set(prod.circleId, list);
      }

      // -------------------------------------------------------------
      // 3. INGESTION LOOP (CIRCLE, BOOTH, PRODUCTS)
      // -------------------------------------------------------------
      console.log("[3/4] Mengimpor dan meng-upsert data circle & produk...");

      for (const rawItem of rawItems) {
        const item = normalizeComifuroItem(rawItem);
        if (!item) {
          stats.skipped++;
          continue;
        }

        stats.validCircles++;
        const boothUpper = item.boothCode.toUpperCase();
        const existingBooth = boothsByCode.get(boothUpper);

        // --- A. UPSERT CIRCLE ---
        let circle: Circle | undefined;

        // Jika booth ini sudah pernah terhubung ke suatu circle di event ini, update circle tersebut
        if (existingBooth && circlesById.has(existingBooth.circleId)) {
          const matchedCircle = circlesById.get(existingBooth.circleId)!;
          const [updated] = await tx
            .update(circles)
            .set({
              name: item.name,
              socialLink: item.primarySocial ?? matchedCircle.socialLink,
              notes: item.notes,
              updatedAt: new Date()
            })
            .where(eq(circles.id, matchedCircle.id))
            .returning();
          circle = updated;
          circlesById.set(circle.id, circle);
          circlesBySlug.set(circle.slug, circle);
          stats.circlesUpdated++;
        } else {
          // Cari apakah circle dengan slug/nama yang sama sudah ada
          const potentialSlug = generateUniqueCircleSlug(
            item.name,
            item.boothCode,
            existingSlugs
          );

          const existingBySlug = circlesBySlug.get(potentialSlug);
          if (existingBySlug) {
            const [updated] = await tx
              .update(circles)
              .set({
                name: item.name,
                socialLink: item.primarySocial ?? existingBySlug.socialLink,
                notes: item.notes,
                updatedAt: new Date()
              })
              .where(eq(circles.id, existingBySlug.id))
              .returning();
            circle = updated;
            circlesById.set(circle.id, circle);
            stats.circlesUpdated++;
          } else {
            const [inserted] = await tx
              .insert(circles)
              .values({
                name: item.name,
                slug: potentialSlug,
                socialLink: item.primarySocial,
                notes: item.notes
              })
              .returning();
            circle = inserted;
            circlesById.set(circle.id, circle);
            circlesBySlug.set(circle.slug, circle);
            stats.circlesCreated++;
          }
        }

        // --- B. UPSERT BOOTH LOCATION ---
        const matchedMap = matchFloorMap(
          currentFloorMaps,
          item.boothCode,
          item.hall
        );
        const floorMapId = matchedMap?.id ?? currentFloorMaps[0].id;
        const boothNotes = `Hadir: ${item.rawDay} | Booth: ${item.boothCode}`;

        if (existingBooth) {
          const [updatedBooth] = await tx
            .update(boothLocations)
            .set({
              circleId: circle.id,
              floorMapId,
              day: item.day,
              notes: boothNotes,
              updatedAt: new Date()
            })
            .where(eq(boothLocations.id, existingBooth.id))
            .returning();
          boothsByCode.set(boothUpper, updatedBooth);
          stats.boothsUpdated++;
        } else {
          const [insertedBooth] = await tx
            .insert(boothLocations)
            .values({
              eventId: event.id,
              circleId: circle.id,
              floorMapId,
              boothCode: item.boothCode,
              day: item.day,
              posX: 50,
              posY: 50,
              notes: boothNotes
            })
            .returning();
          boothsByCode.set(boothUpper, insertedBooth);
          stats.boothsCreated++;
        }

        // --- C. UPSERT PRODUK DARI SAMPLEWORKS ---
        if (item.sampleworks.length > 0) {
          const circleProducts = productsByCircleId.get(circle.id) ?? [];

          for (let sIdx = 0; sIdx < item.sampleworks.length; sIdx++) {
            const sampleUrl = item.sampleworks[sIdx];
            const sampleName = (
              item.sampleworks.length === 1
                ? `Katalog Sample - ${item.name}`
                : `Katalog Sample #${sIdx + 1} - ${item.name}`
            ).slice(0, 200);

            // Cek apakah produk dengan URL gambar atau nama ini sudah ada
            const matchedProduct = circleProducts.find(
              (p) => p.imageUrl === sampleUrl || p.name === sampleName
            );

            if (matchedProduct) {
              const [updatedProd] = await tx
                .update(products)
                .set({
                  imageUrl: sampleUrl,
                  targetDay: item.day,
                  productLink: item.primarySocial ?? matchedProduct.productLink,
                  updatedAt: new Date()
                })
                .where(eq(products.id, matchedProduct.id))
                .returning();
              stats.productsUpdated++;
              // Perbarui referensi lokal
              const idx = circleProducts.indexOf(matchedProduct);
              if (idx !== -1) circleProducts[idx] = updatedProd;
            } else {
              const [insertedProd] = await tx
                .insert(products)
                .values({
                  eventId: event.id,
                  circleId: circle.id,
                  name: sampleName,
                  imageUrl: sampleUrl,
                  price: 0,
                  status: "TARGET",
                  priority: "MEDIUM",
                  targetDay: item.day,
                  isRush: false,
                  purchaseType: "ON_THE_SPOT",
                  productLink: item.primarySocial,
                  quantity: 1,
                  notes: `Katalog sample karya circle ${item.name} (${item.fandom || "Comifuro 20"}). Booth ${item.boothCode}.`
                })
                .returning();
              circleProducts.push(insertedProd);
              stats.productsCreated++;
            }
          }

          productsByCircleId.set(circle.id, circleProducts);
        }
      }

      // -------------------------------------------------------------
      // 4. SELESAI / DRY RUN ROLLBACK
      // -------------------------------------------------------------
      if (options.dryRun) {
        throw new DryRunRollbackError();
      }
    });
  } catch (error) {
    if (error instanceof DryRunRollbackError) {
      console.log("\n[DRY RUN] Transaksi di-rollback sukses (tidak ada data yang diubah).");
    } else {
      console.error("\n[ERROR] Pipeline ingestion gagal! Transaksi di-rollback otomatis.");
      console.error(error);
      process.exit(1);
    }
  }

  const durationMs = Date.now() - startTime;

  console.log("\n=======================================================");
  console.log("             RINGKASAN INGESTION KATALOG               ");
  console.log("=======================================================");
  console.log(`Sumber Data            : ${sourceDescription}`);
  console.log(`Target Event           : ${options.eventName} (${options.eventSlug})`);
  console.log(`Waktu Eksekusi         : ${durationMs} ms`);
  console.log("-------------------------------------------------------");
  console.log(`Total Item Mentah      : ${stats.totalRaw}`);
  console.log(`Circle Valid Diproses  : ${stats.validCircles}`);
  console.log(`Circle Baru Dibuat     : ${stats.circlesCreated}`);
  console.log(`Circle Diperbarui      : ${stats.circlesUpdated}`);
  console.log(`Booth Baru Dibuat      : ${stats.boothsCreated}`);
  console.log(`Booth Diperbarui       : ${stats.boothsUpdated}`);
  console.log(`Produk Sample Dibuat   : ${stats.productsCreated}`);
  console.log(`Produk Sample Diupdate : ${stats.productsUpdated}`);
  if (stats.skipped > 0) {
    console.log(`Data Dilewati (invalid): ${stats.skipped}`);
  }
  console.log("=======================================================\n");

  if (!options.dryRun) {
    console.log("✔ Ingestion katalog Comifuro berhasil disimpan ke database!");
  } else {
    console.log("✔ Simulasi dry-run selesai!");
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(`\n[FATAL] Gagal menjalankan ingestion: ${err instanceof Error ? err.message : String(err)}\n`);
    process.exit(1);
  });
