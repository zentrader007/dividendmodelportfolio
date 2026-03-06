import XLSX from "xlsx";
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

const XLSX_PATH = resolve(__dirname, "../data/DIVIDEND MODEL PORTFOLIO.xlsx");

function parseExcelDate(serial) {
  if (!serial || typeof serial !== "number" || serial < 1000) return null;
  const epoch = new Date(1899, 11, 30);
  epoch.setDate(epoch.getDate() + serial);
  return epoch;
}

function safeFloat(val) {
  if (val == null || val === "" || val === "-" || typeof val === "string") return null;
  const n = Number(val);
  return isNaN(n) ? null : n;
}

function safeStr(val) {
  if (val == null) return null;
  return String(val).trim() || null;
}

async function seedSecurities(wb) {
  const ws = wb.Sheets["Model Portfolio"];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });

  const securities = [];
  let sortOrder = 0;

  for (let i = 7; i < rows.length; i++) {
    const row = rows[i];
    if (!row) continue;
    const ticker = safeStr(row[1]);
    if (!ticker || ticker.length > 10 || !/^[A-Z]/.test(ticker)) continue;
    if (["Core 1", "Core 2", "Cons 1", "Cons 2", "Cons 3", "Ticker"].includes(ticker)) continue;

    const buyUnderRaw = row[11];
    const buyUnder = safeFloat(buyUnderRaw);
    const buyUnderText = (typeof buyUnderRaw === "string" && !buyUnder) ? buyUnderRaw.trim() : null;

    sortOrder++;
    securities.push({
      ticker,
      name: safeStr(row[2]) || ticker,
      divFreq: safeStr(row[4]),
      risk: safeStr(row[5])?.trim(),
      issuesK1: safeStr(row[6])?.trim() === "Y" || false,
      suggestedAlloc: safeFloat(row[7]),
      maxAlloc: safeFloat(row[8]),
      description: safeStr(row[9]),
      buyUnder,
      buyUnderText,
      alertDate: parseExcelDate(row[15]),
      alertPrice: safeFloat(row[17]),
      articleLink: safeStr(row[16]),
      sector: safeStr(row[22]),
      portfolioSection: safeStr(row[24]),
      sortOrder,
      jan1Price: safeFloat(row[25]),
      notes: safeStr(row[23]),
    });
  }

  for (const s of securities) {
    await prisma.security.upsert({
      where: { ticker: s.ticker },
      update: s,
      create: s,
    });
  }
  console.log(`Seeded ${securities.length} securities`);
  return securities;
}

async function seedDividendData(wb) {
  const ws = wb.Sheets["DivData"];
  if (!ws) { console.log("No DivData sheet found"); return; }
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });

  let count = 0;
  // Annual dividend data starts around row 5 (0-indexed=4), columns Q-U
  for (let i = 4; i < rows.length; i++) {
    const row = rows[i];
    if (!row) continue;
    const ticker = safeStr(row[16]); // Q column = index 16
    if (!ticker || !/^[A-Z]/.test(ticker)) continue;

    const annualDiv = safeFloat(row[18]); // S column
    const earnedYtd = safeFloat(row[26]); // AA column (from earned div section)
    const earnedTotal = safeFloat(row[30]); // AE column

    // Match earned divs by ticker from Z column area
    const earnedTicker = safeStr(row[25]); // Z column

    if (annualDiv != null) {
      await prisma.dividendData.upsert({
        where: { ticker },
        update: { annualDiv, divFreq: safeStr(row[19]) },
        create: { ticker, annualDiv, divFreq: safeStr(row[19]) },
      });
      count++;
    }
  }

  // Earned dividends are in a separate column range (Z-AE)
  for (let i = 4; i < rows.length; i++) {
    const row = rows[i];
    if (!row) continue;
    const ticker = safeStr(row[25]); // Z column
    if (!ticker || !/^[A-Z]/.test(ticker)) continue;

    const earnedYtd = safeFloat(row[26]); // AA
    const earnedTotal = safeFloat(row[30]); // AE

    try {
      await prisma.dividendData.upsert({
        where: { ticker },
        update: { earnedYtd, earnedTotal },
        create: { ticker, annualDiv: null, earnedYtd, earnedTotal },
      });
    } catch (e) {
      // Ticker may not exist in securities, that's ok
    }
  }

  console.log(`Seeded ${count} dividend data records`);
}

async function seedDividendEvents(wb) {
  const ws = wb.Sheets["DivData"];
  if (!ws) return;
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });

  const events = [];

  for (let i = 4; i < rows.length; i++) {
    const row = rows[i];
    if (!row) continue;

    // Recent ex-div (columns B-E, indices 1-4)
    const recentTicker = safeStr(row[1]);
    if (recentTicker && /^[A-Z]/.test(recentTicker)) {
      events.push({
        ticker: recentTicker,
        eventType: "recent",
        exDivDate: parseExcelDate(row[2]),
        amount: safeFloat(row[3]),
        payDate: parseExcelDate(row[4]),
      });
    }

    // Upcoming declared (columns G-K, indices 6-10)
    const upcomingTicker = safeStr(row[6]);
    if (upcomingTicker && /^[A-Z]/.test(upcomingTicker)) {
      events.push({
        ticker: upcomingTicker,
        eventType: "upcoming",
        exDivDate: parseExcelDate(row[7]),
        amount: safeFloat(row[8]),
        payDate: parseExcelDate(row[9]),
        declarationDate: parseExcelDate(row[10]),
      });
    }

    // Anticipated (columns L-O, indices 11-14)
    const anticipatedTicker = safeStr(row[11]);
    if (anticipatedTicker && /^[A-Z]/.test(anticipatedTicker)) {
      events.push({
        ticker: anticipatedTicker,
        eventType: "anticipated",
        exDivDate: parseExcelDate(row[12]) || parseExcelDate(row[13]),
        amount: safeFloat(row[14]),
      });
    }
  }

  await prisma.dividendEvent.deleteMany();
  if (events.length > 0) {
    await prisma.dividendEvent.createMany({ data: events });
  }
  console.log(`Seeded ${events.length} dividend events`);
}

async function seedPreferreds(wb) {
  const ws = wb.Sheets["Preferreds"];
  if (!ws) return;
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });

  const preferreds = [];
  let sortOrder = 0;
  let currentCategory = "term-preferred";

  for (let i = 3; i < rows.length; i++) {
    const row = rows[i];
    if (!row) continue;

    // Detect category headers
    const cellC = safeStr(row[2]);
    if (cellC) {
      const lower = cellC.toLowerCase();
      if (lower.includes("term-preferred")) currentCategory = "term-preferred";
      else if (lower.includes("fixed") && lower.includes("perpetual")) currentCategory = "fixed-perpetual";
      else if (lower.includes("float")) currentCategory = "float-rate";
      else if (lower.includes("convertible")) currentCategory = "convertible";
    }

    const ticker = safeStr(row[1]);
    if (!ticker || ticker.length > 12 || !/^[A-Z]/.test(ticker)) continue;
    if (["Ticker"].includes(ticker)) continue;

    sortOrder++;
    preferreds.push({
      ticker,
      name: safeStr(row[2]) || ticker,
      couponRate: safeFloat(row[10]), // K column
      callDate: parseExcelDate(row[11]), // L column
      maturityDate: parseExcelDate(row[12]), // M column
      creditRating: safeStr(row[9]), // J column
      divFreq: safeStr(row[15]), // P column
      risk: safeStr(row[8]), // I column
      buyUnder: safeFloat(row[7]), // H column
      alertDate: parseExcelDate(row[25]), // Z column
      alertPrice: safeFloat(row[26]), // AA column
      articleLink: safeStr(row[13]), // N column
      qdi: safeStr(row[20]), // U column
      k1: safeStr(row[21]), // V column
      jan1Price: safeFloat(row[30]), // AE column
      category: currentCategory,
      sortOrder,
    });
  }

  for (const p of preferreds) {
    await prisma.preferred.upsert({
      where: { ticker: p.ticker },
      update: p,
      create: p,
    });
  }
  console.log(`Seeded ${preferreds.length} preferreds`);
}

async function seedBonds(wb) {
  const ws = wb.Sheets["Bonds"];
  if (!ws) return;
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });

  const bonds = [];
  let sortOrder = 0;

  for (let i = 2; i < rows.length; i++) {
    const row = rows[i];
    if (!row) continue;
    const cusip = safeStr(row[1]);
    if (!cusip || cusip.length < 5) continue;
    if (cusip === "CUSIP") continue;

    const callableRaw = row[9];
    const callableDate = parseExcelDate(callableRaw);
    const callableText = (!callableDate && typeof callableRaw === "string") ? callableRaw.trim() : null;

    sortOrder++;
    bonds.push({
      cusip,
      name: safeStr(row[2]) || cusip,
      coupon: safeFloat(row[6]), // G column
      creditRating: safeStr(row[7]), // H column
      suggestedAlloc: safeFloat(row[8]), // I column
      callableDate,
      callableText,
      maturityDate: parseExcelDate(row[10]), // K column
      buyUnder: safeFloat(row[12]), // M column
      nextPayment: parseExcelDate(row[14]), // O column
      sector: safeStr(row[15]), // P column
      risk: safeStr(row[5]), // F column
      sortOrder,
    });
  }

  for (const b of bonds) {
    await prisma.bond.upsert({
      where: { cusip: b.cusip },
      update: b,
      create: b,
    });
  }
  console.log(`Seeded ${bonds.length} bonds`);
}

async function seedSoldSecurities(wb) {
  const ws = wb.Sheets["Sold Securities"];
  if (!ws) return;
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });

  const sold = [];
  const yearOffsets = [
    { year: 2026, col: 1 },
    { year: 2025, col: 18 },
    { year: 2024, col: 35 },
    { year: 2023, col: 52 },
    { year: 2022, col: 69 },
    { year: 2021, col: 87 },
    { year: 2020, col: 105 },
    { year: 2019, col: 123 },
    { year: 2018, col: 142 },
    { year: 2017, col: 161 },
  ];

  for (const { year, col } of yearOffsets) {
    for (let i = 4; i < rows.length; i++) {
      const row = rows[i];
      if (!row) continue;
      const ticker = safeStr(row[col]);
      if (!ticker || !/^[A-Z]/.test(ticker) || ticker === "Ticker") continue;

      sold.push({
        ticker,
        name: safeStr(row[col + 1]),
        description: safeStr(row[col + 2]),
        section: safeStr(row[col + 3]),
        buyAlertDate: parseExcelDate(row[col + 5]),
        buyArticle: safeStr(row[col + 6]),
        buyAlertPrice: safeFloat(row[col + 7]),
        lastBuyUnder: safeFloat(row[col + 9]),
        sellAlertPrice: safeFloat(row[col + 10]),
        sellAlertDate: parseExcelDate(row[col + 11]),
        sellArticle: safeStr(row[col + 12]),
        ytdGain: safeFloat(row[col + 13]),
        totalGain: safeFloat(row[col + 14]),
        status: safeStr(row[col + 15]),
        year,
      });
    }
  }

  await prisma.soldSecurity.deleteMany();
  if (sold.length > 0) {
    await prisma.soldSecurity.createMany({ data: sold });
  }
  console.log(`Seeded ${sold.length} sold securities`);
}

async function seedEarningsCalendar(wb) {
  const ws = wb.Sheets["Earnings Calendar"];
  if (!ws) return;
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });

  const events = [];

  for (let i = 7; i < rows.length; i++) {
    const row = rows[i];
    if (!row) continue;
    const ticker = safeStr(row[5]); // F column (By Ticker section)
    if (!ticker || !/^[A-Z]/.test(ticker)) continue;

    events.push({
      ticker,
      reportDate: parseExcelDate(row[6]), // G column
      timing: safeStr(row[7]), // H column
      notes: safeStr(row[8]), // I column
      fiscalNote: safeStr(row[9]), // J column
    });
  }

  await prisma.earningsEvent.deleteMany();
  if (events.length > 0) {
    await prisma.earningsEvent.createMany({ data: events });
  }
  console.log(`Seeded ${events.length} earnings events`);
}

async function seedTaxInfo(wb) {
  const ws = wb.Sheets["Tax Info"];
  if (!ws) return;
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });

  const taxRecords = [];
  const years = [2021, 2022, 2023, 2024, 2025];

  for (let i = 6; i < 60; i++) {
    const row = rows[i];
    if (!row) continue;
    const ticker = safeStr(row[1]); // B column
    if (!ticker || !/^[A-Z]/.test(ticker)) continue;

    const taxClass = safeStr(row[0]); // A column
    const name = safeStr(row[2]); // C column

    for (let y = 0; y < years.length; y++) {
      const ordIdx = 6 + y; // G-K columns (ordinary income)
      const s199Idx = 11 + y; // L-P columns (199a deduction)
      const qdiIdx = 16 + y; // Q-U columns (qualified dividends)
      const ltcgIdx = 21 + y; // V-Z columns (LTCG)
      const rocIdx = 26 + y; // AA-AE columns (return of capital)

      const ordinaryIncome = safeFloat(row[ordIdx]);
      const sec199a = safeFloat(row[s199Idx]);
      const qdi = safeFloat(row[qdiIdx]);
      const ltcg = safeFloat(row[ltcgIdx]);
      const roc = safeFloat(row[rocIdx]);

      if (ordinaryIncome != null || sec199a != null || qdi != null || ltcg != null || roc != null) {
        taxRecords.push({
          ticker,
          name,
          taxClass,
          year: years[y],
          ordinaryIncome,
          sec199aDeduction: sec199a,
          qualifiedDividends: qdi,
          ltcg,
          returnOfCapital: roc,
        });
      }
    }
  }

  for (const t of taxRecords) {
    await prisma.taxInfo.upsert({
      where: { ticker_year: { ticker: t.ticker, year: t.year } },
      update: t,
      create: t,
    });
  }
  console.log(`Seeded ${taxRecords.length} tax info records`);
}

async function seedUpdateLog(wb) {
  const ws = wb.Sheets["Update Log"];
  if (!ws) return;
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });

  const logs = [];

  for (let i = 4; i < rows.length; i++) {
    const row = rows[i];
    if (!row) continue;

    // Holdings changes (columns B-F)
    const rev = safeStr(row[1]);
    const date = parseExcelDate(row[2]);
    const ticker = safeStr(row[3]);
    const changeType = safeStr(row[4]);
    const note = safeStr(row[5]);

    if (rev || ticker || note) {
      logs.push({
        revNumber: rev,
        date,
        ticker,
        changeType,
        note,
        isDesign: false,
      });
    }

    // Design revisions (columns H-J)
    const designRev = safeStr(row[7]);
    const designDate = parseExcelDate(row[8]);
    const designNote = safeStr(row[9]);

    if (designRev || designNote) {
      logs.push({
        revNumber: designRev ? String(designRev) : null,
        date: designDate,
        note: designNote,
        isDesign: true,
      });
    }
  }

  await prisma.updateLog.deleteMany();
  if (logs.length > 0) {
    await prisma.updateLog.createMany({ data: logs });
  }
  console.log(`Seeded ${logs.length} update log entries`);
}

async function seedBabyBondDivs(wb) {
  const ws = wb.Sheets["Dividend Tracker"];
  if (!ws) return;
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });

  const bonds = [];

  for (let i = 5; i < rows.length; i++) {
    const row = rows[i];
    if (!row) continue;
    const ticker = safeStr(row[19]); // T column
    if (!ticker || !/^[A-Z]/.test(ticker) || ticker === "Ticker") continue;

    bonds.push({
      ticker,
      name: safeStr(row[20]) || ticker, // U column
      divFreq: safeStr(row[21]), // V column
      coupon: safeFloat(row[22]), // W column
      annualDiv: safeFloat(row[23]), // X column
      periodDiv: safeFloat(row[24]), // Y column
      exDivDate: safeStr(row[25]), // Z column
      exDivMonths: safeStr(row[26]), // AA column
      payDate: safeStr(row[27]), // AB column
      payMonths: safeStr(row[28]), // AC column
    });
  }

  for (const b of bonds) {
    await prisma.babyBondDiv.upsert({
      where: { ticker: b.ticker },
      update: b,
      create: b,
    });
  }
  console.log(`Seeded ${bonds.length} baby bond dividends`);
}

async function main() {
  console.log("Reading spreadsheet...");
  const buf = readFileSync(XLSX_PATH);
  const wb = XLSX.read(buf, { type: "buffer", cellDates: false });
  console.log("Sheets:", wb.SheetNames.join(", "));

  await seedSecurities(wb);
  await seedDividendData(wb);
  await seedDividendEvents(wb);
  await seedPreferreds(wb);
  await seedBonds(wb);
  await seedBabyBondDivs(wb);
  await seedSoldSecurities(wb);
  await seedEarningsCalendar(wb);
  await seedTaxInfo(wb);
  await seedUpdateLog(wb);

  console.log("\nSeed complete!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
