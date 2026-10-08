/**
 * Referensi Data Resmi & Panduan Event Comic Frontier (CF 16 – CF 23)
 *
 * Single Source of Truth untuk tiket, jadwal gate, akses shuttle bus,
 * regulasi komunitas & cosplay, serta sorotan utama tiap edisi.
 *
 * Sumber Validasi:
 * - docs/comifuro-events-reference.md
 * - Situs Resmi Comifuro (comifuro.net)
 * - Platform Tiket Resmi (Ticket2u.id & KiosTix)
 * - Pengelola Venue ICE Indonesia (ice-indonesia.com)
 */

export interface EventTicketInfo {
  platform: "Ticket2U" | "KiosTix" | string;
  regularPrice: number;
  regularPriceFormatted: string;
  bundlePrice: number | null;
  bundlePriceFormatted: string | null;
  salesModel: string;
  wristbandExchangeHours: string;
  gateCloseHour: string;
  childPolicy: string;
  notes: string[];
}

export interface EventAttendanceInfo {
  estimatedAttendees: string;
  estimatedCircles: string;
  venueHalls: string;
  milestone?: string;
}

export interface EventHighlightItem {
  tag: string;
  title: string;
  description: string;
}

export interface TransportRouteStep {
  step: number;
  title: string;
  route: string;
  description: string;
  badge?: string;
}

export interface EventTransportGuide {
  shuttleBus: {
    name: string;
    operator: string;
    route: string;
    hours: string;
    frequency: string;
    fare: string;
    note: string;
    dropOffPoint: string;
  };
  krlSkywalk: {
    station: string;
    skywalkInfo: string;
    transitNote: string;
  };
  bsdLink: {
    name: string;
    route: string;
    fare: string;
  };
  tollAndVehicle: {
    serbaraja: string;
    jorr: string;
    parkingCapacity: string;
    overflowParking: string;
  };
  routeSteps: TransportRouteStep[];
}

export interface EventCommunityRules {
  antiGenAi: {
    title: string;
    sanction: string;
    description: string;
  };
  noBootleg: {
    title: string;
    sanction: string;
    description: string;
  };
  copyrightAndPlagiarism: {
    title: string;
    description: string;
  };
  cosplayProps: {
    title: string;
    allowedMaterials: string[];
    prohibitedMaterials: string[];
    inspectionNote: string;
  };
  cosplayEtiquette: {
    title: string;
    consentPrinciple: string;
    principles: string[];
    photoZones: string;
  };
  facilities: {
    changingRoom: {
      title: string;
      location: string;
      fee: string;
      rule: string;
    };
    luggageStorage: {
      title: string;
      location: string;
      rates: string;
      description: string;
    };
  };
}

export interface EventDetailMetadata {
  slug: string;
  editionNumber: number;
  editionName: string;
  datesText: string;
  venueFull: string;
  ticketInfo: EventTicketInfo;
  attendance: EventAttendanceInfo;
  highlights: EventHighlightItem[];
  transportGuide: EventTransportGuide;
  communityRules: EventCommunityRules;
}

// Panduan operasional transportasi dan regulasi komunitas standar ICE BSD

export const DEFAULT_TRANSPORT_GUIDE: EventTransportGuide = {
  shuttleBus: {
    name: "Shuttle Bus Gratis Lorena",
    operator: "PT Eka Sari Lorena Transport Tbk",
    route: "Terminal Intermoda BSD ⇄ Drop-off Outdoor Parking Hall 10 ICE BSD (PP)",
    hours: "07:00 – 21:30 WIB",
    frequency: "Berangkat berkala setiap 15 – 30 menit",
    fare: "100% Gratis tanpa syarat tiket masuk",
    note: "Armada bus AC resmi disewa panitia Comifuro untuk seluruh pengunjung, cosplayer, dan exhibitor circle.",
    dropOffPoint: "Outdoor Parking Hall 10 ICE BSD City"
  },
  krlSkywalk: {
    station: "Stasiun Cisauk (KRL Commuter Line Lin Rangkasbitung: Tanah Abang ⇄ Rangkasbitung)",
    skywalkInfo: "Jembatan layang (Skywalk Intermoda) ±250m terhubung langsung dari gate Stasiun Cisauk ke lantai 2 Terminal Intermoda BSD.",
    transitNote: "Dari Intermoda BSD, turun ke area halte lantai dasar untuk naik Shuttle Bus Gratis Lorena menuju Hall 10 ICE BSD."
  },
  bsdLink: {
    name: "BSD Link Shuttle Bus Gratis",
    route: "Terminal Intermoda BSD ⇄ Halte ICE 1 & Halte ICE 2",
    fare: "100% Gratis (Layanan transportasi kota mandiri BSD City)"
  },
  tollAndVehicle: {
    serbaraja: "Tol Serbaraja (Seksi 1A): Exit BSD Barat / AEON Mall (±3 menit berkendara ke lobi Hall 10 ICE BSD)",
    jorr: "Tol Jakarta – Serpong (JORR): Exit BSD City / Rawa Buntu lalu via Jl. BSD Grand Boulevard (±15–20 menit)",
    parkingCapacity: "Kapasitas 5.000+ mobil & motor di area basement serta kantong outdoor Hall 1–10 ICE BSD",
    overflowParking: "Lahan parkir cadangan tersedia di Mall AEON BSD dan kawasan Edutown BSD"
  },
  routeSteps: [
    {
      step: 1,
      title: "Naik KRL Commuter Line",
      route: "Lin Rangkasbitung (Tanah Abang ⇄ Cisauk)",
      description: "Naik KRL tujuan Rangkasbitung / Parung Panjang, turun di Stasiun Cisauk. Tap-out kartu uang elektronik / QR KRL.",
      badge: "KRL COMMUTER"
    },
    {
      step: 2,
      title: "Menyeberang via Skywalk Intermoda",
      route: "Stasiun Cisauk ➔ Terminal Intermoda BSD",
      description: "Jalan santai melewati jembatan layang tertutup (Skywalk) sepanjang ±250 meter tanpa perlu turun ke jalan raya.",
      badge: "SKYWALK 250M"
    },
    {
      step: 3,
      title: "Shuttle Bus Gratis Lorena",
      route: "Intermoda ➔ Hall 10 ICE BSD",
      description: "Naik shuttle bus AC Lorena di lobi Intermoda. Bus mengantar gratis langsung ke titik drop-off Hall 10 ICE BSD.",
      badge: "100% GRATIS"
    }
  ]
};

export const DEFAULT_COMMUNITY_RULES: EventCommunityRules = {
  antiGenAi: {
    title: "Aturan Tegas Anti-Generative AI",
    sanction: "Diskualifikasi langsung tanpa pengembalian dana (no refund)",
    description: "Dilarang keras memajang, mempromosikan, atau memperjualbelikan karya atau merchandise yang dihasilkan dari Artificial Intelligence (Generative AI). Circle yang melanggar akan langsung didiskualifikasi dan dikeluarkan dari venue."
  },
  noBootleg: {
    title: "Larangan Bootleg & Reseller Barang Pabrikan",
    sanction: "Penutupan meja & penyitaan item bajakan",
    description: "Meja Circle dilarang bertindak sebagai reseller barang komersial pabrik (album CD resmi, poster berlisensi pabrikan, figure bajakan/counterfeit, atau merchandise resmi impor). Meja hanya diperuntukkan bagi karya orisinal & fanwork buatan kreator sendiri."
  },
  copyrightAndPlagiarism: {
    title: "Hak Cipta, Tracing & Merek Dagang",
    description: "Dilarang menjiplak (tracing), menduplikasi karya kreator lain, atau menempelkan logo resmi merek dagang (trademark) waralaba komersial pada produk sendiri. Dilarang memajang konten pornografi terbuka dan dilarang transaksi aset berbasis NFT/Web3."
  },
  cosplayProps: {
    title: "Regulasi Properti Senjata Cosplay (Props Policy)",
    allowedMaterials: [
      "Busa hati (EVA foam)",
      "Plastik lunak & karton / kardus",
      "PVC / ABS lunak",
      "Kayu ringan berujung tumpul"
    ],
    prohibitedMaterials: [
      "Senjata tajam atau runcing berbahan logam asli (pedang, pisau, belati, kunai logam)",
      "Replika senjata api realistis (airsoft gun, senapan angin, busur panah dengan anak panah fungsional)",
      "Bahan kimia beracun, petasan, kembang api, atau benda berbau menyengat / mudah terbakar"
    ],
    inspectionNote: "Seluruh properti senjata cosplay wajib melalui pos pemeriksaan keamanan di security gate. Barang yang melanggar aturan akan disita sementara di pos pengamanan."
  },
  cosplayEtiquette: {
    title: "Etika Busana & Prinsip 'Cosplay is Not Consent'",
    consentPrinciple: "Cosplay is Not Consent: Wajib meminta izin secara sopan sebelum mengambil foto, merekam video, atau menyapa cosplayer.",
    principles: [
      "Wajib meminta izin secara sopan sebelum mengambil foto atau menyapa cosplayer ('Cosplay is Not Consent').",
      "Dilarang mengenakan seragam dinas aktif instansi militer atau kepolisian Indonesia (TNI / POLRI).",
      "Dilarang mengenakan atribut, lambang, atau simbol organisasi terlarang dan ujaran kebencian.",
      "Kostum wajib mematuhi norma kesopanan umum dan tidak mengekspos bagian sensitif tubuh secara berlebihan.",
      "Sesi foto dilarang dilakukan di lorong Circle Market (Hall 7, 8, 9) demi kelancaran alur massa. Gunakan Pre-function Hall 6–10, Loading Dock belakang, atau Taman Outdoor."
    ],
    photoZones: "Pre-function area Hall 6–10, Loading Dock belakang Hall 9, dan Taman Outdoor Hall 7–10."
  },
  facilities: {
    changingRoom: {
      title: "Ruang Ganti Resmi (Changing Room)",
      location: "Hall 6 / Hall 7 ICE BSD City",
      fee: "Rp 10.000 / orang per sesi masuk",
      rule: "Dilarang keras berganti pakaian, memakai wig, atau merias wajah di dalam toilet umum ICE BSD demi menjaga kelancaran sanitasi pengunjung."
    },
    luggageStorage: {
      title: "Penitipan Barang (Baggage Drop)",
      location: "Hall 6 / Hall 7 ICE BSD City",
      rates: "Rp 10.000 (tas kecil / backpack / totebag) · Rp 20.000 (koper besar / boks kontainer)",
      description: "Dikelola oleh tim logistik resmi event untuk keamanan barang bawaan cosplayer dan pengunjung selama menjelajahi hall pameran."
    }
  }
};

// Master data metadata tiap edisi Comic Frontier (CF 16 - CF 23)

export const EVENT_DETAILS_MAP: Record<string, EventDetailMetadata> = {
  cf16: {
    slug: "cf16",
    editionNumber: 16,
    editionName: "Comic Frontier 16 (Comifuro 16)",
    datesText: "6 – 7 Mei 2023",
    venueFull: "ICE BSD City (Hall 8, 9, dan 10)",
    ticketInfo: {
      platform: "KiosTix",
      regularPrice: 65000,
      regularPriceFormatted: "Rp 65.000",
      bundlePrice: 115000,
      bundlePriceFormatted: "Rp 115.000",
      salesModel: "Online & Loket Tunai OTS (Terakhir)",
      wristbandExchangeHours: "08:00 - 18:15 WIB",
      gateCloseHour: "18:30 WIB",
      childPolicy: "Anak >= 2 tahun wajib tiket",
      notes: [
        "Terakhir kali tersedia loket OTS tunai (5.000 tiket On-The-Spot)",
        "20.000 tiket online didistribusikan via 16 loket penukaran wristband",
        "Penukaran Wristband 08:00 - 18:15 WIB",
        "Pintu Masuk Tutup 18:30 WIB",
        "Anak >= 2 tahun wajib tiket"
      ]
    },
    attendance: {
      estimatedAttendees: "± 42.000 – 45.000",
      estimatedCircles: "~800 – 1.000",
      venueHalls: "Hall 8, 9, 10 ICE BSD",
      milestone: "Ekspansi ke 3 hall megah pasca-evaluasi alur keamanan CF 15"
    },
    highlights: [
      {
        tag: "EXPANSION",
        title: "Ekspansi ke 3 Hall Penuh (Hall 8, 9, 10)",
        description: "Penambahan Hall 8 memperluas kapasitas koridor sirkulasi pengunjung dan area circle secara signifikan."
      },
      {
        tag: "GUEST STAR",
        title: "Virtual Meet & Greet hololive Indonesia",
        description: "Sesi temu virtual eksklusif bersama Pavolia Reine, Ayunda Risu, Kureiji Ollie, dan Kobo Kanaeru via sistem tiket raffle."
      },
      {
        tag: "TICKETING",
        title: "Era Terakhir Loket OTS Fisik",
        description: "Penyelenggaraan terakhir dengan loket On-The-Spot tunai fisik (5.000 tiket) sebelum berganti ke sistem 100% online."
      },
      {
        tag: "STAGE",
        title: "Panggung Hiburan Kreator & Anisong DJ",
        description: "Stage dimeriahkan penampilan kreator lokal, komunitas VTuber (MAHA5, hololive), serta sesi Anisong DJ Party."
      }
    ],
    transportGuide: DEFAULT_TRANSPORT_GUIDE,
    communityRules: DEFAULT_COMMUNITY_RULES
  },

  cf17: {
    slug: "cf17",
    editionNumber: 17,
    editionName: "Comic Frontier 17 (Comifuro 17)",
    datesText: "16 – 17 Desember 2023",
    venueFull: "ICE BSD City (Hall 7, 8, 9, dan 10)",
    ticketInfo: {
      platform: "Ticket2U",
      regularPrice: 65000,
      regularPriceFormatted: "Rp 65.000 (+ fee Rp 6.000 = Rp 71.000)",
      bundlePrice: 120000,
      bundlePriceFormatted: "Rp 120.000",
      salesModel: "100% Online Ticketing",
      wristbandExchangeHours: "08:00 - 18:15 WIB",
      gateCloseHour: "18:30 WIB",
      childPolicy: "Anak >= 2 tahun wajib tiket",
      notes: [
        "100% Online Ticketing via Ticket2U",
        "Loket tunai fisik resmi dihapus demi kepastian kapasitas",
        "Penukaran Wristband 08:00 - 18:15 WIB",
        "Pintu Masuk Tutup 18:30 WIB",
        "Anak >= 2 tahun wajib tiket"
      ]
    },
    attendance: {
      estimatedAttendees: "± 50.000",
      estimatedCircles: "> 1.000",
      venueHalls: "Hall 7, 8, 9, 10 ICE BSD",
      milestone: "Peluncuran perdana Shuttle Bus Gratis Lorena dan sistem 100% online ticketing"
    },
    highlights: [
      {
        tag: "SHUTTLE BUS",
        title: "Peluncuran Perdana Shuttle Bus Lorena",
        description: "Penyediaan armada shuttle bus gratis Lorena rute Stasiun Cisauk ⇄ Hall 10 ICE BSD untuk mengurai kemacetan kawasan BSD."
      },
      {
        tag: "EXPANSION",
        title: "Ekspansi Menyeluruh 4 Hall Penuh",
        description: "Penggunaan Hall 7, 8, 9, dan 10 ICE BSD sekaligus untuk memisahkan circle market, corporate booth, dan panggung."
      },
      {
        tag: "TICKETING",
        title: "100% Online Ticketing via Ticket2U",
        description: "Penghapusan total loket tunai fisik dengan implementasi check-in barcode cepat yang mengurai antrean gelang sejak pagi."
      },
      {
        tag: "COMMUNITY",
        title: "Lebih dari 1.000 Circle Kreator Independen",
        description: "Pertumbuhan eksponensial karya doujinshi lokal dan fan merchandise orisinal di Hall 8 dan Hall 9."
      }
    ],
    transportGuide: DEFAULT_TRANSPORT_GUIDE,
    communityRules: DEFAULT_COMMUNITY_RULES
  },

  cf18: {
    slug: "cf18",
    editionNumber: 18,
    editionName: "Comic Frontier 18 (Comifuro 18)",
    datesText: "11 – 12 Mei 2024",
    venueFull: "ICE BSD City (Hall 7, 8, 9, 10 + Hall 6 F&B)",
    ticketInfo: {
      platform: "Ticket2U",
      regularPrice: 75000,
      regularPriceFormatted: "Rp 75.000",
      bundlePrice: 130000,
      bundlePriceFormatted: "Rp 130.000",
      salesModel: "100% Online Ticketing",
      wristbandExchangeHours: "08:00 - 18:15 WIB",
      gateCloseHour: "18:30 WIB",
      childPolicy: "Anak >= 2 tahun wajib tiket",
      notes: [
        "100% Online Ticketing",
        "Penukaran Wristband 08:00 - 18:15 WIB",
        "Pintu Masuk Tutup 18:30 WIB",
        "Anak >= 2 tahun wajib tiket"
      ]
    },
    attendance: {
      estimatedAttendees: "± 45.000 – 50.000",
      estimatedCircles: "> 1.000",
      venueHalls: "Hall 6, 7, 8, 9, 10 ICE BSD",
      milestone: "Bushiroad EXPO 2024 dibuka langsung CEO Takaaki Kidani bersama seiyuu BanG Dream!"
    },
    highlights: [
      {
        tag: "BUSHROAD EXPO",
        title: "Bushiroad EXPO 2024 dibuka CEO Takaaki Kidani",
        description: "CEO Bushiroad Group Takaaki Kidani membuka acara langsung dalam bahasa Jepang di panggung utama ICE BSD pada kedua hari."
      },
      {
        tag: "GUEST SEIYUU",
        title: "Guest Seiyuu BanG Dream! (Aina Aiba & Yuka Nishio)",
        description: "Kehadiran pengisi suara Aina Aiba (Yukina Minato / Roselia) dan Yuka Nishio (Nanami Hiromachi / Morfonica)."
      },
      {
        tag: "ILLUSTRATOR",
        title: "Sesi Tanda Tangan Ilustrator Hisashi Momose",
        description: "Jumpa fans dan sesi tanda tangan eksklusif ilustrator resmi TCG Cardfight!! Vanguard."
      },
      {
        tag: "VENUE",
        title: "Hall 6 Khusus F&B & Area Istirahat",
        description: "Hall 6 difungsikan penuh sebagai area makan, minum, dan ruang istirahat berkapasitas besar bagi pengunjung."
      },
      {
        tag: "CSR",
        title: "Aksi Sosial Donor Darah PMI",
        description: "Fasilitas donor darah bekerja sama dengan PMI di area ticketing counter Hall 8."
      }
    ],
    transportGuide: DEFAULT_TRANSPORT_GUIDE,
    communityRules: DEFAULT_COMMUNITY_RULES
  },

  cf19: {
    slug: "cf19",
    editionNumber: 19,
    editionName: "Comic Frontier 19 (Comifuro 19)",
    datesText: "9 – 10 November 2024",
    venueFull: "ICE BSD City (Hall 7, 8, 9, dan 10)",
    ticketInfo: {
      platform: "Ticket2U",
      regularPrice: 75000,
      regularPriceFormatted: "Rp 75.000",
      bundlePrice: 130000,
      bundlePriceFormatted: "Rp 130.000",
      salesModel: "100% Online Ticketing",
      wristbandExchangeHours: "08:00 - 18:15 WIB",
      gateCloseHour: "18:30 WIB",
      childPolicy: "Anak >= 2 tahun wajib tiket",
      notes: [
        "100% Online Ticketing",
        "Penukaran Wristband 08:00 - 18:15 WIB",
        "Pintu Masuk Tutup 18:30 WIB",
        "Anak >= 2 tahun wajib tiket",
        "Tiket konser anisong dijual terpisah (Rp 500k/hari atau paket Rp 950k)"
      ]
    },
    attendance: {
      estimatedAttendees: "± 50.000",
      estimatedCircles: "> 1.000",
      venueHalls: "Hall 7, 8, 9, 10 ICE BSD",
      milestone: "Konser anisong Konomi Suzuki & panggung musik kolaborasi Yuko Suzuhana x Upiko"
    },
    highlights: [
      {
        tag: "ANISONG CONCERT",
        title: "Anisong Live Stage: Konomi Suzuki",
        description: "Konser anisong penyanyi papan atas Jepang Konomi Suzuki membawakan OST No Game No Life, Re:Zero, dan Sakurasou."
      },
      {
        tag: "MUSIC STAGE",
        title: "Jewel Box: Yuko Suzuhana x Upiko",
        description: "Panggung musik kolaborasi vokalis Wagakki Band didampingi instrumen tradisional Jepang (shakuhachi & shamisen) bersama musisi indie Upiko."
      },
      {
        tag: "PARALLEL EVENT",
        title: "Pelaksanaan Serentak Akhir Pekan Pop-Kultur",
        description: "Berjalan sukses di akhir pekan yang sama dengan Indonesia Comic Con 2024 di JCC Senayan."
      },
      {
        tag: "MARKET",
        title: "Pusat Rilisan Doujinshi & Fan Art Kreator Lokal",
        description: "Ribuan judul karya komik mandiri, artbook ilustrasi, dan novel ringan buatan kreator independen."
      }
    ],
    transportGuide: DEFAULT_TRANSPORT_GUIDE,
    communityRules: DEFAULT_COMMUNITY_RULES
  },

  cf20: {
    slug: "cf20",
    editionNumber: 20,
    editionName: "Comic Frontier 20 (Comic Frontier XX / CF XX)",
    datesText: "24 – 25 Mei 2025",
    venueFull: "ICE BSD City (Hall 6, 7, 8, 9, dan 10)",
    ticketInfo: {
      platform: "Ticket2U",
      regularPrice: 75000,
      regularPriceFormatted: "Rp 75.000",
      bundlePrice: 130000,
      bundlePriceFormatted: "Rp 130.000",
      salesModel: "100% Online Ticketing",
      wristbandExchangeHours: "08:00 - 18:15 WIB",
      gateCloseHour: "18:30 WIB",
      childPolicy: "Anak >= 2 tahun wajib tiket",
      notes: [
        "100% Online Ticketing",
        "Edisi Khusus Comic Frontier XX (2 Dekade Perhelatan)",
        "Penukaran Wristband 08:00 - 18:15 WIB",
        "Pintu Masuk Tutup 18:30 WIB",
        "Anak >= 2 tahun wajib tiket"
      ]
    },
    attendance: {
      estimatedAttendees: "± 45.000 – 50.000",
      estimatedCircles: "> 1.000 – 1.200",
      venueHalls: "Hall 6, 7, 8, 9, 10 ICE BSD",
      milestone: "Perayaan dua dekade Comic Frontier XX dengan 5 hall penuh ICE BSD"
    },
    highlights: [
      {
        tag: "2 DECADES",
        title: "Edisi Khusus Comic Frontier XX (2 Dekade)",
        description: "Perayaan tonggak sejarah dua dekade bertumbuhnya ekosistem kreator komik independen di Indonesia."
      },
      {
        tag: "BUSHROAD EXPO",
        title: "Bushiroad EXPO 2025: Q&A CEO Takaaki Kidani",
        description: "Sesi Q&A dwibahasa bersama CEO Takaaki Kidani serta kehadiran seiyuu BanG Dream! (Yuka Nishio & Yuzuki Watase)."
      },
      {
        tag: "GUEST ARTIST",
        title: "Sesi Tanda Tangan Ilustrator NOMISAKI",
        description: "Jumpa fans dan sesi tanda tangan eksklusif ilustrator populer Jepang NOMISAKI."
      },
      {
        tag: "TALKSHOW",
        title: "Talkshow Industri bersama Jiva Animation",
        description: "Panggung diskusi ekosistem animasi nasional bersama studio animasi profesional terkemuka."
      }
    ],
    transportGuide: DEFAULT_TRANSPORT_GUIDE,
    communityRules: DEFAULT_COMMUNITY_RULES
  },

  cf21: {
    slug: "cf21",
    editionNumber: 21,
    editionName: "Comic Frontier 21 (Comifuro 21)",
    datesText: "15 – 16 November 2025",
    venueFull: "ICE BSD City (Hall 6, 7, 8, 9, dan 10)",
    ticketInfo: {
      platform: "Ticket2U",
      regularPrice: 75000,
      regularPriceFormatted: "Rp 75.000",
      bundlePrice: 130000,
      bundlePriceFormatted: "Rp 130.000",
      salesModel: "100% Online Ticketing",
      wristbandExchangeHours: "08:00 - 18:15 WIB",
      gateCloseHour: "18:30 WIB",
      childPolicy: "Anak >= 2 tahun wajib tiket",
      notes: [
        "100% Online Ticketing",
        "Rekor Tertinggi: 70.000 Pengunjung",
        "Penukaran Wristband 08:00 - 18:15 WIB",
        "Pintu Masuk Tutup 18:30 WIB",
        "Anak >= 2 tahun wajib tiket"
      ]
    },
    attendance: {
      estimatedAttendees: "70.000 (Rekor Tertinggi)",
      estimatedCircles: "1.300 – 1.500",
      venueHalls: "Hall 6, 7, 8, 9, 10 ICE BSD",
      milestone: "Rekor kehadiran tertinggi 70.000 pengunjung & konser arena hololive ID 5th Anniv LIVE"
    },
    highlights: [
      {
        tag: "ALL-TIME RECORD",
        title: "Rekor Pengunjung Tertinggi (70.000 Pengunjung)",
        description: "Mencetak rekor jumlah pengunjung terbanyak sepanjang sejarah perhelatan Comic Frontier di Indonesia."
      },
      {
        tag: "HOLOLIVE ARENA",
        title: "hololive ID 5th Anniv LIVE 'Chromatic Future'",
        description: "Konser arena offline akbar di Hall 6 menghadirkan seluruh 9 talenta hololive Indonesia secara lengkap (Sold Out)."
      },
      {
        tag: "FAN FEST",
        title: "hololive ID Fan Fest di Hall 10",
        description: "Area interaktif eksklusif, meet & greet, stamp rally, dan display booth hololive Indonesia."
      },
      {
        tag: "LN AUTHOR",
        title: "Guest LN Author Sunsunsun (Roshidere)",
        description: "Kehadiran penulis light novel terkenal Alya Sometimes Hides Her Feelings in Russian bersama Phoenix Gramedia."
      },
      {
        tag: "GAME EXHIBITION",
        title: "Pameran Interaktif Sky: Children of the Light",
        description: "Instalasi bertema dan pengalaman bermain interaktif bersama komunitas resmi game besutan thatgamecompany."
      }
    ],
    transportGuide: DEFAULT_TRANSPORT_GUIDE,
    communityRules: DEFAULT_COMMUNITY_RULES
  },

  cf22: {
    slug: "cf22",
    editionNumber: 22,
    editionName: "Comic Frontier 22 (Comifuro 22)",
    datesText: "16 – 17 Mei 2026",
    venueFull: "ICE BSD City (Hall 6, 7, 8, 9, dan 10)",
    ticketInfo: {
      platform: "Ticket2U",
      regularPrice: 75000,
      regularPriceFormatted: "Rp 75.000",
      bundlePrice: 130000,
      bundlePriceFormatted: "Rp 130.000",
      salesModel: "100% Online Ticketing",
      wristbandExchangeHours: "08:00 - 18:15 WIB",
      gateCloseHour: "18:30 WIB",
      childPolicy: "Anak >= 2 tahun wajib tiket",
      notes: [
        "100% Online Ticketing",
        "Penukaran Wristband 08:00 - 18:15 WIB",
        "Pintu Masuk Tutup 18:30 WIB",
        "Anak >= 2 tahun wajib tiket"
      ]
    },
    attendance: {
      estimatedAttendees: "55.000 – 65.000",
      estimatedCircles: "1.300 – 1.500+",
      venueHalls: "Hall 6, 7, 8, 9, 10 ICE BSD",
      milestone: "Bushiroad EXPO 2026 Jakarta & kolaborasi resmi Kartu Multi Trip (KMT) KAI Commuter"
    },
    highlights: [
      {
        tag: "GLOBAL TOUR",
        title: "Bushiroad EXPO 2026 Jakarta",
        description: "Pemberhentian tur dunia resmi Bushiroad menyajikan kompetisi TCG internasional, demo game, dan panggung kreator."
      },
      {
        tag: "KAI COMMUTER",
        title: "Kolaborasi Resmi Kartu Multi Trip (KMT) KAI Commuter",
        description: "Peluncuran Kartu Multi Trip resmi KAI Commuter edisi terbatas CF 22 (3 varian desain eksklusif, Rp 80.000/kartu atau bundle Rp 210.000)."
      },
      {
        tag: "KEY VISUAL",
        title: "Key Visual Art Resmi oleh @ichigowarano",
        description: "Artwork poster resmi Comic Frontier 22 didesain langsung oleh ilustrator kenamaan @ichigowarano."
      },
      {
        tag: "CULINARY MERCH",
        title: "Kolaborasi Kuliner Eksklusif Amanda Brownies",
        description: "Kemitraan resmi kuliner dan merchandise bertema khusus edisi Comic Frontier 22."
      }
    ],
    transportGuide: DEFAULT_TRANSPORT_GUIDE,
    communityRules: DEFAULT_COMMUNITY_RULES
  },

  cf23: {
    slug: "cf23",
    editionNumber: 23,
    editionName: "Comic Frontier 23 (Comifuro 23)",
    datesText: "31 Oktober – 1 November 2026",
    venueFull: "ICE BSD City (Hall 6 – 10 + Hall 5 Komunitas)",
    ticketInfo: {
      platform: "Ticket2U",
      regularPrice: 75000,
      regularPriceFormatted: "Rp 75.000",
      bundlePrice: 130000,
      bundlePriceFormatted: "Rp 130.000",
      salesModel: "100% Online Ticketing",
      wristbandExchangeHours: "08:00 - 18:15 WIB",
      gateCloseHour: "18:30 WIB",
      childPolicy: "Anak >= 2 tahun wajib tiket",
      notes: [
        "100% Online Ticketing",
        "Edisi Tematik Halloween Weekend",
        "Penukaran Wristband 08:00 - 18:15 WIB",
        "Pintu Masuk Tutup 18:30 WIB",
        "Anak >= 2 tahun wajib tiket"
      ]
    },
    attendance: {
      estimatedAttendees: "± 60.000 – 70.000",
      estimatedCircles: "1.500+ Terkurasi",
      venueHalls: "Hall 6 – 10 (+ Hall 5 Komunitas)",
      milestone: "Edisi Halloween Weekend dengan seleksi 100% kurasi komite ketat dan free community booth"
    },
    highlights: [
      {
        tag: "HALLOWEEN",
        title: "Edisi Tematik Halloween Weekend",
        description: "Perhelatan akbar bertema khusus Halloween dengan dekorasi karnaval musim gugur, kompetisi cosplay tematik, dan karya spesial."
      },
      {
        tag: "STRICT CURATION",
        title: "Sistem Seleksi Circle 100% Kurasi Komite",
        description: "Penerapan kurasi ketat anti-AI dan seleksi orisinalitas tinggi demi menjamin kualitas terbaik karya di Artist Alley."
      },
      {
        tag: "FREE BOOTHS",
        title: "Penyediaan Free Community Booth di Hall 5",
        description: "Hall 5 dialokasikan khusus bebas biaya untuk ruang pamer komunitas kreatif independen, itasha, dan game developer lokal."
      },
      {
        tag: "MASSIVE MARKET",
        title: "Lebih dari 1.500 Meja Kreator Terkurasi",
        description: "Pameran karya kreasi komik mandiri terbesar di Asia Tenggara dengan alur koridor belanja yang dirancang lebih luas."
      }
    ],
    transportGuide: DEFAULT_TRANSPORT_GUIDE,
    communityRules: DEFAULT_COMMUNITY_RULES
  }
};

// Helper lookup functions

export function normalizeEventSlug(slug: string): string {
  if (!slug) return "";
  const cleaned = slug.toLowerCase().trim();
  const cfMatch = cleaned.match(/cf[\s-_]?(\d+)/i) || cleaned.match(/comifuro[\s-_]?(\d+)/i);
  if (cfMatch) {
    return `cf${cfMatch[1]}`;
  }
  return cleaned;
}

export function getEventDetailData(rawSlug: string): EventDetailMetadata | null {
  const normalized = normalizeEventSlug(rawSlug);
  return EVENT_DETAILS_MAP[normalized] || null;
}

export function getEventDetailDataWithFallback(
  rawSlug: string,
  eventName?: string | null,
  venue?: string | null
): EventDetailMetadata {
  const existing = getEventDetailData(rawSlug);
  if (existing) {
    return existing;
  }

  const normalized = normalizeEventSlug(rawSlug);
  const numMatch = normalized.match(/\d+/) || (eventName && eventName.match(/\d+/));
  const editionNum = numMatch ? parseInt(numMatch[0], 10) : 0;
  const displayName = eventName || (editionNum > 0 ? `Comic Frontier ${editionNum}` : "Comic Frontier Event");

  return {
    slug: normalized || "event-unknown",
    editionNumber: editionNum,
    editionName: displayName,
    datesText: "Jadwal Resmi Comifuro",
    venueFull: venue || "ICE BSD City (Hall 6 - 10)",
    ticketInfo: {
      platform: "Ticket2U",
      regularPrice: 75000,
      regularPriceFormatted: "Rp 75.000",
      bundlePrice: 130000,
      bundlePriceFormatted: "Rp 130.000",
      salesModel: "100% Online Ticketing",
      wristbandExchangeHours: "08:00 - 18:15 WIB",
      gateCloseHour: "18:30 WIB",
      childPolicy: "Anak >= 2 tahun wajib tiket",
      notes: [
        "100% Online Ticketing",
        "Penukaran Wristband 08:00 - 18:15 WIB",
        "Pintu Masuk Tutup 18:30 WIB",
        "Anak >= 2 tahun wajib tiket"
      ]
    },
    attendance: {
      estimatedAttendees: "50.000+",
      estimatedCircles: "1.000+ Circle",
      venueHalls: venue || "ICE BSD City (Hall 6 - 10)",
      milestone: "Perhelatan resmi pasar kreatif komik dan kultur pop Comic Frontier"
    },
    highlights: [
      {
        tag: "CREATOR MARKET",
        title: "1.000+ Circle Kreator Independen",
        description: "Pasar karya doujinshi, artbook, komik orisinal, dan merchandise buatan kreator independen."
      },
      {
        tag: "COSPLAY & STAGE",
        title: "Panggung Kreatif & Area Cosplay Resmi",
        description: "Tempat berkumpulnya komunitas cosplayer, sesi foto beretika, dan panggung musik kreatif."
      },
      {
        tag: "TRANSIT READY",
        title: "Akses Transportasi Shuttle Bus Lorena",
        description: "Konektivitas shuttle gratis menghubungkan Stasiun Cisauk dan Terminal Intermoda langsung ke Hall 10 ICE BSD."
      }
    ],
    transportGuide: DEFAULT_TRANSPORT_GUIDE,
    communityRules: DEFAULT_COMMUNITY_RULES
  };
}
