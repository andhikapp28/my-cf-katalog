"use client";

import React from "react";

interface IceHallCanvasProps {
  hall?: string | null;
  className?: string;
}

/**
 * Canvas denah hall arsitektural ICE BSD (Hall 8 & Hall 9).
 * Dirender sebagai SVG presisi berbasis vektor yang tajam di semua level zoom,
 * hemat memori, dan 100% berfungsi offline tanpa ketergantungan CDN gambar eksternal.
 */
export function IceHallCanvas({ hall, className }: IceHallCanvasProps) {
  const isHall9 = Boolean(hall && hall.toLowerCase().includes("9"));

  if (isHall9) {
    return <Hall9VectorPlan className={className} />;
  }

  return <Hall8VectorPlan className={className} />;
}

// =============================================================================
// DENAH HALL 8: ARTIST ALLEY & POP-CULTURE (BLOK AA-AG & A-M)
// =============================================================================
function Hall8VectorPlan({ className }: { className?: string }) {
  const islandAisles = [
    { label: "AA", x: 8 },
    { label: "AB", x: 12 },
    { label: "AC", x: 16 },
    { label: "AD", x: 20 },
    { label: "AE", x: 24 },
    { label: "AF", x: 28 },
    { label: "AG", x: 32 }
  ];

  const mainAisles = [
    { label: "A", x: 38 },
    { label: "B", x: 43 },
    { label: "C", x: 48 },
    { label: "D", x: 53 },
    { label: "E", x: 58 },
    { label: "F", x: 63 },
    { label: "G", x: 68 },
    { label: "H", x: 73 },
    { label: "I", x: 78 },
    { label: "J", x: 83 },
    { label: "K", x: 87 },
    { label: "L", x: 91 },
    { label: "M", x: 95 }
  ];

  return (
    <svg
      viewBox="0 0 1400 900"
      className={className ?? "h-full w-full select-none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Pola grid lantai hall */}
        <pattern id="hall8Grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#252A36" strokeWidth="0.8" opacity="0.6" />
        </pattern>
        <linearGradient id="hall8WallGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1B1E26" />
          <stop offset="100%" stopColor="#13151B" />
        </linearGradient>
        <linearGradient id="stageGlow" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FF4838" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#FF4838" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="entranceGlow" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#5398DA" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#5398DA" stopOpacity="0.0" />
        </linearGradient>
      </defs>

      {/* Latar Belakang Lantai Hall */}
      <rect width="1400" height="900" fill="url(#hall8WallGrad)" />
      <rect width="1400" height="900" fill="url(#hall8Grid)" />

      {/* Dinding Perimeter Luar ICE BSD */}
      <rect
        x="30"
        y="30"
        width="1340"
        height="840"
        fill="none"
        stroke="#373D4D"
        strokeWidth="4"
        rx="16"
      />
      <rect
        x="36"
        y="36"
        width="1328"
        height="828"
        fill="none"
        stroke="#282D3A"
        strokeWidth="1.5"
        rx="12"
      />

      {/* Pilar Struktural Venue */}
      {[200, 480, 760, 1040, 1280].map((px) =>
        [200, 450, 700].map((py) => (
          <g key={`p-${px}-${py}`}>
            <rect x={px - 8} y={py - 8} width="16" height="16" fill="#4B5366" rx="3" />
            <rect x={px - 4} y={py - 4} width="8" height="8" fill="#1B1E26" rx="1" />
          </g>
        ))
      )}

      {/* Header Denah & Identitas Venue */}
      <g transform="translate(60, 68)">
        <text
          x="0"
          y="0"
          fill="#D6F834"
          fontFamily="var(--font-display), sans-serif"
          fontSize="28"
          fontWeight="900"
          letterSpacing="2"
        >
          ICE BSD · HALL 8
        </text>
        <text
          x="0"
          y="20"
          fill="#8A93A6"
          fontFamily="var(--font-sans), sans-serif"
          fontSize="11"
          fontWeight="600"
          letterSpacing="1"
        >
          ARTIST ALLEY · BLOK AA-AG & BLOK A-M
        </text>
      </g>

      {/* Area Panggung Mini / Creator Stage (Kanan Atas) */}
      <g transform="translate(1080, 50)">
        <rect width="260" height="90" fill="url(#stageGlow)" stroke="#FF4838" strokeWidth="1.5" rx="10" strokeDasharray="4 4" />
        <text x="130" y="42" fill="#FF4838" fontFamily="var(--font-display), sans-serif" fontSize="18" fontWeight="bold" textAnchor="middle" letterSpacing="1">
          CREATOR MINI STAGE
        </text>
        <text x="130" y="62" fill="#A4B0C6" fontFamily="var(--font-sans), sans-serif" fontSize="10" textAnchor="middle">
          Talkshow, Live Drawing & Sign Session
        </text>
      </g>

      {/* Area Fasilitas: Toilet & Musholla (Kiri Atas) */}
      <g transform="translate(60, 95)">
        <rect width="180" height="42" fill="#1F2430" stroke="#373D4D" strokeWidth="1" rx="6" />
        <text x="90" y="26" fill="#8A93A6" fontFamily="var(--font-sans), sans-serif" fontSize="10" fontWeight="bold" textAnchor="middle" letterSpacing="0.5">
          RESTROOMS & PRAYER ROOM
        </text>
      </g>

      {/* Area ATM Center & Medis (Kiri Bawah) */}
      <g transform="translate(60, 775)">
        <rect width="180" height="50" fill="#1F2430" stroke="#373D4D" strokeWidth="1" rx="6" />
        <text x="90" y="24" fill="#5398DA" fontFamily="var(--font-sans), sans-serif" fontSize="11" fontWeight="bold" textAnchor="middle">
          ATM CENTER & FIRST AID
        </text>
        <text x="90" y="40" fill="#6B7588" fontFamily="var(--font-sans), sans-serif" fontSize="9" textAnchor="middle">
          Tarik Tunai Sebelum Masuk
        </text>
      </g>

      {/* Pintu Masuk Utama (Bawah Tengah) */}
      <g transform="translate(480, 790)">
        <rect width="440" height="70" fill="url(#entranceGlow)" stroke="#5398DA" strokeWidth="2" rx="12" />
        <text x="220" y="32" fill="#FFFFFF" fontFamily="var(--font-display), sans-serif" fontSize="20" fontWeight="900" textAnchor="middle" letterSpacing="2">
          PINTU MASUK UTAMA · MAIN ENTRANCE
        </text>
        <text x="220" y="52" fill="#5398DA" fontFamily="var(--font-sans), sans-serif" fontSize="11" fontWeight="bold" textAnchor="middle">
          TICKETING SCAN & WRISTBAND CHECK
        </text>
      </g>

      {/* Pintu Keluar (Kanan Bawah) */}
      <g transform="translate(1120, 785)">
        <rect width="210" height="45" fill="#1F2430" stroke="#373D4D" strokeWidth="1.5" rx="8" />
        <text x="105" y="28" fill="#8A93A6" fontFamily="var(--font-sans), sans-serif" fontSize="11" fontWeight="bold" textAnchor="middle" letterSpacing="1">
          EXIT GATE & LOBBY
        </text>
      </g>

      {/* Pintu Emergency (Kiri & Kanan Tengah) */}
      <text x="38" y="450" fill="#E05252" fontFamily="var(--font-sans), sans-serif" fontSize="9" fontWeight="bold" transform="rotate(-90 38 450)" textAnchor="middle" letterSpacing="2">
        EMERGENCY EXIT
      </text>
      <text x="1362" y="450" fill="#E05252" fontFamily="var(--font-sans), sans-serif" fontSize="9" fontWeight="bold" transform="rotate(90 1362 450)" textAnchor="middle" letterSpacing="2">
        EMERGENCY EXIT
      </text>

      {/* Crosswalk / Lorong Utama Tengah */}
      <line x1="60" y1="450" x2="1340" y2="450" stroke="#2D3342" strokeWidth="1" strokeDasharray="6 6" />
      <text x="700" y="445" fill="#505A6F" fontFamily="var(--font-sans), sans-serif" fontSize="9" fontWeight="bold" textAnchor="middle" letterSpacing="3">
        MAIN CROSSWAY AISLE
      </text>

      {/* ===================================================================== */}
      {/* MEJA DERETAN ISLAND (BLOK AA s.d. AG) */}
      {/* ===================================================================== */}
      {islandAisles.map((aisle) => {
        const xPos = (aisle.x / 100) * 1400;
        return (
          <g key={`island-${aisle.label}`}>
            {/* Header Lorong Atas */}
            <rect x={xPos - 18} y="148" width="36" height="20" fill="#242B38" stroke="#3F495D" strokeWidth="1" rx="4" />
            <text x={xPos} y="162" fill="#D6F834" fontFamily="var(--font-mono), monospace" fontSize="11" fontWeight="bold" textAnchor="middle">
              {aisle.label}
            </text>

            {/* Balok Meja Fisik Lorong */}
            <rect
              x={xPos - 12}
              y="180"
              width="24"
              height="570"
              fill="#181D26"
              stroke="#2A3242"
              strokeWidth="1"
              rx="6"
            />
            {/* Garis pemisah petak meja */}
            {Array.from({ length: 18 }).map((_, i) => (
              <line
                key={`line-${aisle.label}-${i}`}
                x1={xPos - 11}
                y1={180 + i * 31.6}
                x2={xPos + 11}
                y2={180 + i * 31.6}
                stroke="#262D3B"
                strokeWidth="1"
              />
            ))}

            {/* Header Lorong Bawah */}
            <rect x={xPos - 18} y="756" width="36" height="20" fill="#242B38" stroke="#3F495D" strokeWidth="1" rx="4" />
            <text x={xPos} y="770" fill="#D6F834" fontFamily="var(--font-mono), monospace" fontSize="11" fontWeight="bold" textAnchor="middle">
              {aisle.label}
            </text>
          </g>
        );
      })}

      {/* Pembatas Area Island dan Main Aisles */}
      <line x1="495" y1="140" x2="495" y2="780" stroke="#373D4D" strokeWidth="1.5" strokeDasharray="4 4" />

      {/* ===================================================================== */}
      {/* MEJA DERETAN ARTIST ALLEY UTAMA (BLOK A s.d. M) */}
      {/* ===================================================================== */}
      {mainAisles.map((aisle) => {
        const xPos = (aisle.x / 100) * 1400;
        return (
          <g key={`main-${aisle.label}`}>
            {/* Header Lorong Atas */}
            <rect x={xPos - 16} y="148" width="32" height="20" fill="#1F2533" stroke="#384357" strokeWidth="1" rx="4" />
            <text x={xPos} y="162" fill="#FFFFFF" fontFamily="var(--font-mono), monospace" fontSize="12" fontWeight="bold" textAnchor="middle">
              {aisle.label}
            </text>

            {/* Balok Meja Fisik Lorong */}
            <rect
              x={xPos - 11}
              y="180"
              width="22"
              height="570"
              fill="#181D26"
              stroke="#2A3242"
              strokeWidth="1"
              rx="5"
            />
            {/* Garis pembagi meja kiri/kanan */}
            <line x1={xPos} y1="180" x2={xPos} y2="750" stroke="#252D3C" strokeWidth="1" strokeDasharray="3 3" />
            {/* Baris sekat meja */}
            {Array.from({ length: 18 }).map((_, i) => (
              <line
                key={`line-m-${aisle.label}-${i}`}
                x1={xPos - 10}
                y1={180 + i * 31.6}
                x2={xPos + 10}
                y2={180 + i * 31.6}
                stroke="#252D3C"
                strokeWidth="1"
              />
            ))}

            {/* Header Lorong Bawah */}
            <rect x={xPos - 16} y="756" width="32" height="20" fill="#1F2533" stroke="#384357" strokeWidth="1" rx="4" />
            <text x={xPos} y="770" fill="#FFFFFF" fontFamily="var(--font-mono), monospace" fontSize="12" fontWeight="bold" textAnchor="middle">
              {aisle.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// =============================================================================
// DENAH HALL 9: CREATORS, CORPORATE & STAGE (BLOK N-S, Z & TC)
// =============================================================================
function Hall9VectorPlan({ className }: { className?: string }) {
  const creatorAisles = [
    { label: "N", x: 14 },
    { label: "O", x: 21 },
    { label: "P", x: 28 },
    { label: "Q", x: 35 },
    { label: "R", x: 42 },
    { label: "S", x: 49 },
    { label: "Z", x: 58 }
  ];

  return (
    <svg
      viewBox="0 0 1400 900"
      className={className ?? "h-full w-full select-none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="hall9Grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#252A36" strokeWidth="0.8" opacity="0.6" />
        </pattern>
        <linearGradient id="hall9WallGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1B1E26" />
          <stop offset="100%" stopColor="#13151B" />
        </linearGradient>
        <linearGradient id="mainStageGlow" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#D6F834" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#D6F834" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Latar Belakang Lantai Hall 9 */}
      <rect width="1400" height="900" fill="url(#hall9WallGrad)" />
      <rect width="1400" height="900" fill="url(#hall9Grid)" />

      {/* Perimeter Dinding Luar */}
      <rect
        x="30"
        y="30"
        width="1340"
        height="840"
        fill="none"
        stroke="#373D4D"
        strokeWidth="4"
        rx="16"
      />
      <rect
        x="36"
        y="36"
        width="1328"
        height="828"
        fill="none"
        stroke="#282D3A"
        strokeWidth="1.5"
        rx="12"
      />

      {/* Header Denah Hall 9 */}
      <g transform="translate(60, 68)">
        <text
          x="0"
          y="0"
          fill="#5398DA"
          fontFamily="var(--font-display), sans-serif"
          fontSize="28"
          fontWeight="900"
          letterSpacing="2"
        >
          ICE BSD · HALL 9
        </text>
        <text
          x="0"
          y="20"
          fill="#8A93A6"
          fontFamily="var(--font-sans), sans-serif"
          fontSize="11"
          fontWeight="600"
          letterSpacing="1"
        >
          CREATORS, CORPORATE & MAIN COMMUNITY STAGE
        </text>
      </g>

      {/* PANGGUNG UTAMA / MAIN STAGE (Tengah Atas) */}
      <g transform="translate(420, 50)">
        <rect width="560" height="100" fill="url(#mainStageGlow)" stroke="#D6F834" strokeWidth="2" rx="14" />
        <text x="280" y="46" fill="#D6F834" fontFamily="var(--font-display), sans-serif" fontSize="24" fontWeight="900" textAnchor="middle" letterSpacing="2">
          MAIN COMMUNITY & COSPLAY STAGE
        </text>
        <text x="280" y="70" fill="#FFFFFF" fontFamily="var(--font-sans), sans-serif" fontSize="11" fontWeight="600" textAnchor="middle">
          Guest Stars, Cosplay Competition, Anisong Party & Closing Ceremony
        </text>
      </g>

      {/* Food & Beverage / Rest Area (Kiri Atas) */}
      <g transform="translate(60, 95)">
        <rect width="260" height="42" fill="#1F2430" stroke="#373D4D" strokeWidth="1" rx="6" />
        <text x="130" y="26" fill="#8A93A6" fontFamily="var(--font-sans), sans-serif" fontSize="10" fontWeight="bold" textAnchor="middle">
          F&B ZONE & ATTENDEE LOUNGE
        </text>
      </g>

      {/* Pintu Masuk Utama Hall 9 (Bawah Tengah) */}
      <g transform="translate(480, 790)">
        <rect width="440" height="70" fill="#1C2333" stroke="#5398DA" strokeWidth="2" rx="12" />
        <text x="220" y="34" fill="#FFFFFF" fontFamily="var(--font-display), sans-serif" fontSize="20" fontWeight="900" textAnchor="middle" letterSpacing="2">
          PINTU MASUK UTAMA · HALL 9
        </text>
        <text x="220" y="54" fill="#5398DA" fontFamily="var(--font-sans), sans-serif" fontSize="11" fontWeight="bold" textAnchor="middle">
          FAST TRACK QUEUE & CORPORATE ENTRANCE
        </text>
      </g>

      {/* ===================================================================== */}
      {/* LORONG CREATORS (BLOK N s.d. S & Z) */}
      {/* ===================================================================== */}
      {creatorAisles.map((aisle) => {
        const xPos = (aisle.x / 100) * 1400;
        return (
          <g key={`creator-${aisle.label}`}>
            {/* Header Lorong Atas */}
            <rect x={xPos - 18} y="165" width="36" height="22" fill="#1F2533" stroke="#384357" strokeWidth="1" rx="4" />
            <text x={xPos} y="180" fill="#FFFFFF" fontFamily="var(--font-mono), monospace" fontSize="12" fontWeight="bold" textAnchor="middle">
              {aisle.label}
            </text>

            {/* Balok Meja Fisik Lorong */}
            <rect
              x={xPos - 12}
              y="198"
              width="24"
              height="550"
              fill="#181D26"
              stroke="#2A3242"
              strokeWidth="1"
              rx="6"
            />
            {/* Sekat meja */}
            {Array.from({ length: 18 }).map((_, i) => (
              <line
                key={`line-c-${aisle.label}-${i}`}
                x1={xPos - 11}
                y1={198 + i * 30.5}
                x2={xPos + 11}
                y2={198 + i * 30.5}
                stroke="#252D3C"
                strokeWidth="1"
              />
            ))}

            {/* Header Lorong Bawah */}
            <rect x={xPos - 18} y="756" width="36" height="22" fill="#1F2533" stroke="#384357" strokeWidth="1" rx="4" />
            <text x={xPos} y="771" fill="#FFFFFF" fontFamily="var(--font-mono), monospace" fontSize="12" fontWeight="bold" textAnchor="middle">
              {aisle.label}
            </text>
          </g>
        );
      })}

      {/* ===================================================================== */}
      {/* AREA KORPORAT & SPONSOR UTAMA (TC BOOTHS - KANAN) */}
      {/* ===================================================================== */}
      <g transform="translate(940, 165)">
        <rect width="400" height="590" fill="#151821" stroke="#373D4D" strokeWidth="1.5" rx="12" strokeDasharray="6 6" />
        <text x="200" y="32" fill="#FF4838" fontFamily="var(--font-display), sans-serif" fontSize="18" fontWeight="bold" textAnchor="middle" letterSpacing="1">
          CORPORATE & COMMUNITY BOOTH (TC)
        </text>
        <text x="200" y="50" fill="#8A93A6" fontFamily="var(--font-sans), sans-serif" fontSize="10" textAnchor="middle">
          Official Gaming, VTuber Agencies, Publisher & Merchandise Partners
        </text>

        {/* Kotak-kotak Booth TC Korporat Besar */}
        {[
          { code: "TC-01", x: 20, y: 70, w: 75, h: 65 },
          { code: "TC-02", x: 110, y: 70, w: 75, h: 65 },
          { code: "TC-03", x: 205, y: 70, w: 75, h: 65 },
          { code: "TC-04", x: 300, y: 70, w: 75, h: 65 },

          { code: "TC-05", x: 20, y: 155, w: 75, h: 65 },
          { code: "TC-06", x: 110, y: 155, w: 75, h: 65 },
          { code: "TC-07", x: 205, y: 155, w: 75, h: 65 },
          { code: "TC-08", x: 300, y: 155, w: 75, h: 65 },

          { code: "TC-09", x: 20, y: 240, w: 75, h: 65 },
          { code: "TC-10", x: 110, y: 240, w: 75, h: 65 },
          { code: "TC-11", x: 205, y: 240, w: 75, h: 65 },
          { code: "TC-12", x: 300, y: 240, w: 75, h: 65 },

          { code: "TC-13", x: 20, y: 325, w: 75, h: 65 },
          { code: "TC-14", x: 110, y: 325, w: 75, h: 65 },
          { code: "TC-15", x: 205, y: 325, w: 75, h: 65 },
          { code: "TC-16", x: 300, y: 325, w: 75, h: 65 },

          { code: "TC-17", x: 20, y: 410, w: 75, h: 65 },
          { code: "TC-18", x: 110, y: 410, w: 75, h: 65 },
          { code: "TC-19", x: 205, y: 410, w: 75, h: 65 },
          { code: "TC-20", x: 300, y: 410, w: 75, h: 65 }
        ].map((tc) => (
          <g key={tc.code}>
            <rect
              x={tc.x}
              y={tc.y}
              width={tc.w}
              height={tc.h}
              fill="#1F2432"
              stroke="#3D475C"
              strokeWidth="1.5"
              rx="8"
            />
            <text
              x={tc.x + tc.w / 2}
              y={tc.y + tc.h / 2 + 5}
              fill="#A2B1CC"
              fontFamily="var(--font-mono), monospace"
              fontSize="12"
              fontWeight="bold"
              textAnchor="middle"
            >
              {tc.code}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}
