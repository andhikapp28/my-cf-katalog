# Prompt: Build Interactive Convention Floor Map (sirkel.id-style)

> **Target referensi:** https://sirkel.id/events/cf22/map  
> **Deskripsi:** Interactive floor map untuk doujinshi/comic convention (Comic Frontier) yang menampilkan 1.400+ booth circle kreator di venue ICE BSD City, dengan fitur pencarian, zoom-pan, klik booth untuk detail, dan wishlist marking.

---

## 🎯 PROJECT OVERVIEW

Bangun halaman **Interactive Convention Floor Map** full-featured untuk event Comic Frontier (Comifuro). Halaman ini menampilkan denah venue ICE BSD City dengan 6 hall (Hall 5–10) dan masing-masing hall berisi ratusan booth circle kreator yang dapat di-klik, di-search, di-filter, dan di-bookmark.

**Konteks pemakaian utama:** Halaman ini dipakai oleh attendee event **di hari-H di dalam venue** — sinyal seluler sangat buruk, layar HP kecil, pengguna berdiri/jalan. Maka prioritas tertinggi adalah: **performa rendering 1.400+ marker**, **responsif di mobile**, **offline-capable**, dan **interaksi satu tangan**.

---

## 🏗️ TECH STACK

- **Framework:** Next.js 15 App Router (TypeScript strict)
- **Styling:** Tailwind CSS 3 (utility-first, no CSS modules)
- **Map rendering:** SVG inline (bukan Leaflet/Mapbox/OpenLayers — ini denah indoor, bukan geospatial)
- **State management:** React hooks (useState, useMemo, useCallback, useRef)
- **Data source:** Server Component memfetch data dari PostgreSQL via Drizzle ORM, lalu pass ke Client Component sebagai props
- **Offline:** Service Worker sudah ada, halaman harus cacheable

---

## 📐 ARSITEKTUR HALAMAN

### 1. Server Component (Page)
```
app/events/[slug]/map/page.tsx
```

**Tanggung jawab:**
- Ambil data event berdasarkan `slug` dari database
- Ambil semua `boothLocations` milik event tersebut, JOIN dengan `circles` (nama, fandom, notes, socialLink) dan `floorMaps` (hall info)
- Transform data menjadi array `CircleMarker[]` yang sudah berisi koordinat SVG (`masterX`, `masterY`), booth code, circle name, fandom, day, rating, sample works URLs, social links
- Pass semua data ke Client Component sebagai props (SSR, no client fetch)

**Data shape yang di-pass ke client:**
```typescript
interface EventMapPageData {
  event: {
    id: string;
    name: string;           // "Comic Frontier 22"
    slug: string;           // "cf22"
    venue: string;          // "ICE BSD City (Hall 6-10)"
    datesText: string;      // "16 - 17 Mei 2026"
    editionNumber: number;  // 22
    hallsText: string;      // "Hall 6, 7, 8, 9, 10"
  };
  halls: HallDefinition[];       // 6 hall rectangles dengan SVG coordinates
  markers: CircleMarker[];       // 1.400+ booth markers
}
```

### 2. Client Component (Interactive Map)
```
components/map/event-map-client.tsx  (utama, ~600-900 baris)
components/map/map-controls.tsx     (floating zoom buttons)
components/map/circle-drawer.tsx    (slide-up detail panel)
```

---

## 🗺️ LAYOUT & UI STRUCTURE

Halaman ini **full-screen dark mode** (bg-zinc-950), menempati seluruh viewport minus header 64px. Tidak ada footer.

### Layer 1: Header Toolbar (sticky top, z-30)
```
┌─────────────────────────────────────────────────────────┐
│ [←] CF 22 · ICE BSD (Hall 6-10)           [Mode Toggle] │
│ COMIC FRONTIER 22 MAP                                   │
├─────────────────────────────────────────────────────────┤
│ [Semua] [Day 1] [Day 2] [♥ Wishlist(n)]   [🔍 Search ] │
└─────────────────────────────────────────────────────────┘
```

**Komponen:**
- **Back button** (`←`) → Link ke `/events/{slug}`
- **Edition badge** (e.g. "CF 22") + venue text
- **Title** (display font, uppercase, bold)
- **Day filter chips** — 4 tombol pill: Semua Hari | Day 1 (Sabtu) | Day 2 (Minggu) | ♥ Wishlist
  - Active state: bg-white text-zinc-950
  - Wishlist active: bg-[#D6F834] text-zinc-950
- **Search input** — Placeholder: "Cari AA-01, TC-12, nama circle..."
  - Instant client-side filtering (bukan server roundtrip)
  - Clear button (X) muncul saat ada teks
  - Fuzzy matching opsional (Fuse.js atau simple includes)

### Layer 2: Hall Quick-Jump Bar (sticky, z-20)
```
┌─────────────────────────────────────────────────────────┐
│ Fokus: [Semua Hall] [Hall 6] [Hall 7] [Hall 8] [Hall 9]│
│         [Hall 10]                                       │
└─────────────────────────────────────────────────────────┘
```
- Horizontal scrollable chips
- Klik hall → map auto-zoom & pan ke hall tersebut (animate transform)
- Klik lagi → reset view
- Active state: bg-[#D6F834] text-zinc-950

### Layer 3: SVG Map Canvas (flex-1, overflow-hidden)
Ini area utama. **Full viewport height** minus header/toolbar.

**SVG Configuration:**
- `viewBox="0 0 2400 1200"` — canvas cukup lebar untuk 6 hall berdampingan
- `minWidth: 1200px` — agar tetap readable
- Background: zinc-950 dengan subtle dot grid pattern (`radial-gradient(#fff 1px, transparent 1px)` opacity 10%)

**SVG Elements hierarchy:**
1. **Venue perimeter** — Outer rect, rounded, dark fill, subtle border
2. **Concourse/lobby walkway** — Rect di bagian bawah, label "KORIDOR LOBBY ICE BSD CITY"
3. **Entrance gates** — 3 titik pintu masuk di sepanjang concourse
4. **6 Hall rectangles** — Masing-masing hall punya:
   - Background rect (dark, highlighted saat selected)
   - Colored header strip (tiap hall warna beda: emerald, sky, amber, rose, violet, teal)
   - Hall name & subtitle text
5. **1.400+ Circle markers** — Rendered sebagai `<circle>` elements di posisi booth-nya
6. **Zone labels** — Area spesial (stage, food court, shuttle bus)

**Interaksi Pan-Zoom:**
- **Mouse drag** → pan (Pointer events: `onPointerDown/Move/Up`)
- **Mouse wheel** → zoom (`onWheel`, `e.preventDefault()`)
- **Touch drag** → pan (single finger)
- **Pinch-to-zoom** → zoom (two-finger, hitung jarak antar touch)
- **Zoom range:** 0.65x – 3.5x
- **Cursor:** `cursor-grab` default, `cursor-grabbing` saat drag
- **Transition:** `transform 150ms ease-out` saat tidak sedang drag (smooth snap)
- **Transform model:** CSS `translate(Xpx, Ypx) scale(S)` pada wrapper div, bukan pada SVG viewBox

### Layer 4: Floating Zoom Controls (absolute bottom-left, z-20)
```
┌─────┐
│  +  │  Zoom In
├─────┤
│ 1.2x│  Current zoom level indicator
├─────┤
│  −  │  Zoom Out
├─────┤
│  ⟲  │  Reset View (zoom 1x, center)
└─────┘
```
- Vertical stack, rounded-2xl, border white/15, bg zinc-900/90, backdrop-blur
- Tombol min-h-[44px] untuk touch target

### Layer 5: Circle Detail Drawer (slide-up bottom sheet / side panel)
Muncul saat user **klik salah satu booth marker** pada peta.

```
┌─────────────────────────────────────────────────────────┐
│ ── (drag handle) ──                              [✕]   │
├─────────────────────────────────────────────────────────┤
│ TC-12 · Artist Alley                                    │
│ ▇▇▇▇ Circle Name Here                                  │
│ Day 1 (Sabtu) · Rating GA                               │
│ Fandom: Genshin Impact / Honkai Star Rail               │
├─────────────────────────────────────────────────────────┤
│ Deskripsi / Notes circle                                │
│ ────────────────────────────────────                    │
│ Social Links: [Twitter] [Instagram] [Pixiv]             │
│ ────────────────────────────────────                    │
│ Sample Works: [img1] [img2] [img3]  (horizontal scroll) │
├─────────────────────────────────────────────────────────┤
│ [♥ Simpan ke Wishlist]              [Buka Detail Circle]│
└─────────────────────────────────────────────────────────┘
```

**Perilaku:**
- **Mobile:** Bottom sheet, slide up dari bawah, max-h-[70vh], scrollable
- **Desktop:** Side panel kanan, width 400px, full height
- **Animasi:** translateY(100%) → translateY(0) dengan transition 200ms
- **Dismiss:** Klik overlay gelap, klik X, atau tekan Escape
- **Content:**
  - Booth code + hall location
  - Circle name (display font, large)
  - Day badge (Day 1 / Day 2 / Both Days)
  - Rating badge (GA / PG / M) dengan warna berbeda
  - Fandom tags
  - Description/notes
  - Social media links (clickable pills)
  - Sample works gallery (horizontal scroll, lazy-loaded images)
  - Wishlist toggle button (♥ merah jika sudah disimpan)
  - Link ke halaman detail circle

---

## 🔵 CIRCLE MARKER RENDERING (Kritis!)

Ini bagian paling penting — rendering 1.400+ SVG circles harus performant.

### Marker Data Structure
```typescript
interface CircleMarker {
  id: string;              // unique marker ID
  circleId: string;        // reference ke circles table
  circleName: string;      // "Atelier Haruka"
  boothCode: string;       // "TC-12", "AA-01a"
  hall: string;            // "Hall 8"
  day: "DAY_1" | "DAY_2" | "ALL_DAYS";
  fandom: string | null;   // "Genshin Impact / Honkai Star Rail"
  rating: string | null;   // "GA", "PG", "M"
  masterX: number;         // SVG x coordinate (0-2400)
  masterY: number;         // SVG y coordinate (0-1200)
  circleCutUrl?: string;   // circle cut image URL
  sampleWorks: string[];   // sample work image URLs
  socialLinks: Array<{ platform: string; url: string; label: string }>;
  description?: string;
}
```

### Koordinat Booth → SVG Position Mapping

Setiap hall punya bounds di SVG canvas (misal Hall 8: x=760, y=50, w=380, h=850). Booth code format: `{prefix}-{number}{suffix}` dimana prefix menentukan area dalam hall.

**Strategi konversi booth code ke SVG coordinates:**
1. Parse booth code → extract prefix (e.g. "AA", "TC", "AB") dan number
2. Setiap prefix punya area rect di dalam hall-nya
3. Number menentukan posisi relatif dalam area (grid layout, wrap per N kolom)
4. Calculate: `masterX = hallX + areaOffsetX + (col * spacing)`, `masterY = hallY + areaOffsetY + (row * spacing)`

**Catatan:** Jika data posisi sudah ada dari database (`posX`, `posY` percentage-based), konversi ke SVG coords:
```typescript
masterX = hallX + (posX / 100) * hallWidth;
masterY = hallY + (posY / 100) * hallHeight;
```

### Marker Visual Styling
```
Default marker:     ● radius 6, fill #64748B (slate), stroke #0F172A
Wishlisted:         ● radius 9, fill #D6F834 (lime), + pulse halo ring
Selected/clicked:   ● radius 10, fill #F84632 (red), + pulse halo ring
Rating M (mature):  ● fill #FB7185 (pink)
TC- prefix (booth): ● fill #38BDF8 (sky), radius 8
```

**Zoom-dependent labels:**
- `scale >= 1.5` → tampilkan booth code text (`<text>` element, font-size 9, monospace, bold) di sebelah kanan marker
- `scale >= 2.2` → tampilkan circle name juga (font-size 8, regular)
- `scale < 1.5` → hanya dots, no text (performance)

### Performance Optimization
- **Jangan** pakai React component per marker (1400 component instances = lambat)
- Render semua markers dalam satu `<g>` element, `map()` langsung ke `<circle>` + `<text>` JSX
- **useMemo** pada filtered markers array — recalculate hanya saat filter/search berubah
- **Conditional text rendering** berdasarkan zoom level — kurangi DOM node saat zoomed out
- Hindari `useEffect` untuk re-render — gunakan derived state

---

## 🔍 SEARCH & FILTER LOGIC

### Search (Client-side, instant)
```typescript
const filteredMarkers = useMemo(() => {
  const q = searchQuery.trim().toLowerCase();
  
  return allMarkers.filter((m) => {
    // 1. Day filter
    if (dayFilter === "DAY_1" && m.day === "DAY_2") return false;
    if (dayFilter === "DAY_2" && m.day === "DAY_1") return false;
    if (dayFilter === "WISHLIST") {
      if (!wishlistIds.includes(m.circleId) && !wishlistIds.includes(m.id)) return false;
    }
    
    // 2. Hall filter
    if (selectedHallId) {
      const hallNum = selectedHallId.replace("hall-", "");
      if (!m.hall?.includes(hallNum)) return false;
    }
    
    // 3. Text search (booth code, circle name, fandom, hall)
    if (q) {
      return (
        m.boothCode.toLowerCase().includes(q) ||
        m.circleName.toLowerCase().includes(q) ||
        (m.fandom?.toLowerCase().includes(q) ?? false) ||
        (m.hall?.toLowerCase().includes(q) ?? false)
      );
    }
    
    return true;
  });
}, [allMarkers, dayFilter, searchQuery, selectedHallId, wishlistIds]);
```

### Search Result Count
Tampilkan di announcement bar: `"{n} lokasi ditemukan"` saat ada search query aktif.

### Auto-focus on Search Result
Saat search menghasilkan ≤ 5 hasil, auto-zoom ke bounding box of matching markers.

---

## ♥ WISHLIST INTEGRATION

Wishlist menggunakan **localStorage** — zero server dependency, works offline.

```typescript
// Stored as: localStorage.setItem("comipocket-wishlist", JSON.stringify(["id1", "id2", ...]))

// Toggle wishlist
function toggleWishlist(id: string): void;

// Get current wishlist
function getWishlistProductIds(): string[];

// Listen for changes (cross-component sync)
window.addEventListener("comipocket:wishlist-updated", handler);
```

**Visual feedback:**
- Marker pada peta berubah warna (lime + pulse halo) saat di-wishlist
- Badge count di filter chip "♥ Wishlist (n)" update real-time
- Drawer punya tombol "Simpan ke Wishlist" / "Hapus dari Wishlist"

---

## 📱 MOBILE-SPECIFIC CONSIDERATIONS

1. **Touch targets:** Semua tombol `min-h-[44px]` (Apple HIG)
2. **Horizontal scroll:** Hall chips dan filter chips scrollable horizontal tanpa scrollbar visible
3. **Bottom sheet drawer:** Bukan side panel — slide up dari bawah, max 70vh
4. **Pinch-to-zoom:** Harus bekerja smooth tanpa conflict dengan native browser zoom
5. **One-handed use:** Primary actions (search, filter, back) reachable dari bottom half
6. **Offline:** Halaman harus tetap berfungsi penuh dari Service Worker cache

---

## 🎨 DESIGN TOKENS

```
Background:          zinc-950 (#09090b)
Surface:             zinc-900 (#18181b)
Border:              white/10, white/15
Text primary:        white (#ffffff)
Text secondary:      zinc-300, zinc-400
Text muted:          zinc-500

Accent lime:         #D6F834
Accent red:          #F84632
Accent sky:          #38BDF8

Hall theme colors:   emerald-700, sky-700, amber-700, rose-700, violet-700, teal-700

Font display:        Bebas Neue (--font-display)
Font body:           Plus Jakarta Sans (--font-sans)
Font mono:           JetBrains Mono (--font-mono)
```

---

## 📊 DATA PIPELINE

### Step 1: Database Query (Server)
```sql
SELECT 
  bl.id, bl.booth_code, bl.day, bl.pos_x, bl.pos_y,
  bl.floor_map_id, bl.notes,
  c.id as circle_id, c.name as circle_name, c.notes as circle_notes,
  c.social_link,
  fm.hall, fm.name as map_name
FROM booth_locations bl
JOIN circles c ON c.id = bl.circle_id
JOIN floor_maps fm ON fm.id = bl.floor_map_id
WHERE bl.event_id = $eventId
ORDER BY bl.booth_code ASC
```

### Step 2: Enrich with Parsed Metadata (Server)
- Parse `circle.notes` untuk extract: fandom, rating, description, circleCutUrl, sampleWorks, socialLinks
- Map booth code → SVG master coordinates berdasarkan hall layout
- Attach catalog data jika ada (dari static JSON/CSV cache)

### Step 3: Serialize & Pass to Client Component
- Semua enrichment di server → client terima array `CircleMarker[]` siap render
- Tidak ada client-side data fetching

---

## 🧪 TESTING REQUIREMENTS

### Unit Tests (Vitest)
1. **Booth code parsing** — "TC-12" → { prefix: "TC", number: 12, suffix: "" }
2. **Booth code sorting** — natural sort: AA-1 < AA-2 < AA-10 < AB-1 < TC-1
3. **Coordinate mapping** — booth code → SVG (masterX, masterY) dalam hall bounds
4. **Filter logic** — day filter, search query, hall filter, wishlist filter
5. **Zoom bounds** — scale stays within 0.65–3.5

### E2E Tests (Playwright)
1. Page loads with all markers visible
2. Search "TC-12" → only matching markers shown
3. Click marker → drawer opens with correct circle info
4. Pinch zoom on mobile viewport
5. Hall chip click → map zooms to that hall

---

## 📁 FILE STRUCTURE

```
app/events/[slug]/map/
  page.tsx                    # Server Component: data fetching & metadata

components/map/
  event-map-client.tsx        # Main interactive map (client component)
  map-controls.tsx            # Floating zoom +/−/reset buttons
  circle-drawer.tsx           # Bottom sheet / side panel detail view

lib/
  floor-map.ts                # Booth code parser, coordinate mapper, sort utils
  map-data.ts                 # Data fetching & enrichment functions
  wishlist.ts                 # LocalStorage wishlist utils

types/
  map.ts                      # CircleMarker, HallDefinition, CommunityZone interfaces
```

---

## ⚡ PERFORMANCE BUDGET

| Metric | Target |
|--------|--------|
| First paint | < 1.5s |
| Interactive (map draggable) | < 2s |
| 1400 markers render | < 500ms |
| Search filter response | < 100ms |
| Zoom animation | 60fps, no jank |
| Bundle size (map page) | < 80KB gzipped JS |

---

## 🚫 JANGAN

- Jangan pakai Leaflet, Mapbox, OpenLayers, atau library peta geospatial — ini denah indoor, bukan peta dunia
- Jangan pakai Canvas 2D — SVG lebih mudah untuk click targets per booth
- Jangan fetch data di client — semua data dari server props
- Jangan buat 1400 React components — render inline `<circle>` elements
- Jangan pakai `position: absolute` per marker — semua dalam satu SVG coordinate space
- Jangan block main thread saat filtering — useMemo sudah cukup untuk 1400 items
- Jangan pakai modal/dialog untuk detail — pakai drawer/bottom-sheet yang tidak menutup peta sepenuhnya

---

## ✅ ACCEPTANCE CRITERIA

1. [ ] Menampilkan denah 6 hall ICE BSD City dengan label dan warna berbeda
2. [ ] Menampilkan 1.400+ booth marker di posisi yang benar dalam hall masing-masing
3. [ ] Pan (drag) dan zoom (wheel/pinch) bekerja smooth di desktop dan mobile
4. [ ] Search instant: ketik booth code atau nama circle → marker terfilter real-time
5. [ ] Day filter: Day 1 / Day 2 / All / Wishlist
6. [ ] Hall focus: klik chip hall → auto-zoom ke hall tersebut
7. [ ] Klik marker → drawer muncul dengan info lengkap circle
8. [ ] Wishlist toggle dari drawer → marker berubah warna di peta
9. [ ] Zoom-dependent labels: booth code muncul di zoom ≥ 1.5x
10. [ ] Mobile responsive: bottom sheet drawer, touch-friendly controls
11. [ ] Dark mode full-screen layout (zinc-950 background)
12. [ ] Offline-capable: bekerja dari Service Worker cache
13. [ ] Performance: 60fps pan/zoom, < 100ms filter response
14. [ ] Accessible: focus-visible rings, aria labels, keyboard navigable controls
