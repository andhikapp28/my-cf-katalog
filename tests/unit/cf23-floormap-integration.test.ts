import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

// Function matching the booth parsing logic
function expandCircleBooths(codeStr?: string | null, dayStr?: string | null): Array<{ code: string; day: string }> {
  if (!codeStr) return [];
  let a = codeStr.trim();
  let s: string | null = null;
  const r = a.match(/^(.+?)\s*\((?:SAT|SUN)\)$/);
  if (r) {
    a = r[1].trim();
    s = codeStr.includes("(SAT)") ? "SAT" : "SUN";
  }
  const o = s || dayStr || "Both Days";
  const n: string[] = [];
  const isTwoLetter = /^[A-Z]{2}-/.test(a);

  if (a.includes("/")) {
    a.split("/").forEach((l) => {
      const part = l.trim();
      if (isTwoLetter) {
        n.push(part);
      } else {
        const d = part.match(/^(.+?)([ab]+)$/);
        if (d) {
          const f = d[1];
          d[2].split("").forEach((c) => n.push(`${f}${c}`));
        } else {
          n.push(part);
        }
      }
    });
  } else if (isTwoLetter) {
    n.push(a);
  } else {
    const u = a.match(/^(.+?)([ab]+)$/);
    if (u) {
      const l = u[1];
      u[2].split("").forEach((c) => n.push(`${l}${c}`));
    } else {
      n.push(a);
    }
  }

  const res: Array<{ code: string; day: string }> = [];
  const upperO = o.toUpperCase();
  if (upperO.includes("BOTH") || upperO === "ALL_DAYS") {
    n.forEach((code) => {
      res.push({ code, day: "SAT" });
      res.push({ code, day: "SUN" });
    });
  } else {
    const dayMap = upperO.includes("SAT") || upperO.includes("DAY 1") || upperO.includes("DAY_1") ? "SAT" : "SUN";
    n.forEach((code) => {
      res.push({ code, day: dayMap });
    });
  }
  return res;
}

describe("CF23 Floor Map Integration", () => {
  it("expands standard dual booths into individual sub-booths", () => {
    const booths = expandCircleBooths("G-20ab", "Both Days");
    expect(booths).toEqual([
      { code: "G-20a", day: "SAT" },
      { code: "G-20a", day: "SUN" },
      { code: "G-20b", day: "SAT" },
      { code: "G-20b", day: "SUN" }
    ]);
  });

  it("handles single-day split booths accurately", () => {
    const satBooth = expandCircleBooths("C-31a (SAT)", "Day 1");
    expect(satBooth).toEqual([{ code: "C-31a", day: "SAT" }]);

    const sunBooth = expandCircleBooths("C-31a (SUN)", "Day 2");
    expect(sunBooth).toEqual([{ code: "C-31a", day: "SUN" }]);
  });

  it("handles double-letter enterprise and special rows", () => {
    const aaBooths = expandCircleBooths("AA-01/AA-02", "Both Days");
    expect(aaBooths).toEqual([
      { code: "AA-01", day: "SAT" },
      { code: "AA-01", day: "SUN" },
      { code: "AA-02", day: "SAT" },
      { code: "AA-02", day: "SUN" }
    ]);
  });

  it("verifies public/cf23_circle_positions.json and floormap image exist", () => {
    const positionsPath = path.join(process.cwd(), "public", "cf23_circle_positions.json");
    const mapPath = path.join(process.cwd(), "public", "cf23_floormap.jpg");
    expect(fs.existsSync(positionsPath)).toBe(true);
    expect(fs.existsSync(mapPath)).toBe(true);

    const positionsData = JSON.parse(fs.readFileSync(positionsPath, "utf-8"));
    expect(Array.isArray(positionsData)).toBe(true);
    expect(positionsData.length).toBeGreaterThan(3000);
  });
});
