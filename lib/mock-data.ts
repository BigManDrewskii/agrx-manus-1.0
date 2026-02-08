// AGRX Mock Data — Complete ATHEX market (135 stocks), portfolio, social, gamification
// All data is deterministic and uses realistic ATHEX tickers and prices
// This serves as the fallback when the live Yahoo Finance API is unavailable

export interface Asset {
  id: string;
  name: string;
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
  sparkline: number[];
  category: "blue-chip" | "growth" | "dividend";
  marketCap?: string;
}

export interface Holding {
  asset: Asset;
  shares: number;
  avgCost: number;
  currentValue: number;
  pnl: number;
  pnlPercent: number;
}

export interface SocialPost {
  id: string;
  username: string;
  avatar: string;
  content: string;
  assetTag?: string;
  likes: number;
  comments: number;
  timestamp: string;
  pnlPercent?: number;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  avatar: string;
  returnPercent: number;
  trades: number;
  streak: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  total: number;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  reward: string;
  progress: number;
  total: number;
  completed: boolean;
}

// Helper to generate sparkline data
function generateSparkline(base: number, volatility: number, points: number = 24): number[] {
  const data: number[] = [];
  let current = base;
  for (let i = 0; i < points; i++) {
    current += (Math.random() - 0.48) * volatility;
    data.push(Math.round(current * 100) / 100);
  }
  return data;
}

// ─── Complete ATHEX Stock List (135 verified symbols) ───────────────────────
// IDs match the server stockService.ts ATHEX_SYMBOLS keys exactly
// Prices are representative demo values; live data replaces these when available

export const GREEK_STOCKS: Asset[] = [
  // ── Blue-Chip (18 stocks, >3B market cap) ─────────────────────────────
  { id: "eee",      name: "Coca-Cola HBC",         ticker: "EEE",      price: 49.58, change: 0.82, changePercent: 1.68, sparkline: generateSparkline(48.76, 0.8), category: "blue-chip", marketCap: "€17.9B" },
  { id: "eurob",    name: "Eurobank",               ticker: "EUROB",    price: 4.19,  change: 0.07, changePercent: 1.58, sparkline: generateSparkline(4.12, 0.06), category: "blue-chip", marketCap: "€15.2B" },
  { id: "ete",      name: "National Bank of Greece", ticker: "ETE",      price: 15.25, change: -0.08, changePercent: -0.52, sparkline: generateSparkline(15.33, 0.2), category: "blue-chip", marketCap: "€13.8B" },
  { id: "tpeir",    name: "Piraeus Bank",            ticker: "TPEIR",    price: 8.85,  change: 0.17, changePercent: 1.91, sparkline: generateSparkline(8.68, 0.12), category: "blue-chip", marketCap: "€10.9B" },
  { id: "alpha",    name: "Alpha Bank",              ticker: "ALPHA",    price: 4.43,  change: 0.10, changePercent: 2.31, sparkline: generateSparkline(4.33, 0.06), category: "blue-chip", marketCap: "€10.1B" },
  { id: "ppc",      name: "Public Power Corp",       ticker: "PPC",      price: 19.85, change: 0.13, changePercent: 0.66, sparkline: generateSparkline(19.72, 0.3), category: "blue-chip", marketCap: "€6.9B" },
  { id: "hto",      name: "Hellenic Telecom (OTE)",  ticker: "HTO",      price: 16.35, change: 0.08, changePercent: 0.49, sparkline: generateSparkline(16.27, 0.2), category: "blue-chip", marketCap: "€6.5B" },
  { id: "opap",     name: "OPAP S.A.",               ticker: "OPAP",     price: 17.55, change: -0.20, changePercent: -1.13, sparkline: generateSparkline(17.75, 0.3), category: "blue-chip", marketCap: "€6.3B" },
  { id: "mtln",     name: "Metlen Energy & Metals",  ticker: "MTLN",     price: 38.50, change: -5.90, changePercent: -13.25, sparkline: generateSparkline(44.40, 1.5), category: "blue-chip", marketCap: "€5.5B" },
  { id: "bochgr",   name: "Bank of Cyprus",          ticker: "BOCHGR",   price: 9.80,  change: 0.24, changePercent: 2.51, sparkline: generateSparkline(9.56, 0.15), category: "blue-chip", marketCap: "€4.3B" },
  { id: "cener",    name: "Cenergy Holdings",        ticker: "CENER",    price: 19.16, change: -0.34, changePercent: -1.74, sparkline: generateSparkline(19.50, 0.35), category: "blue-chip", marketCap: "€4.1B" },
  { id: "titc",     name: "Titan Cement",            ticker: "TITC",     price: 54.70, change: 0.00, changePercent: 0.00, sparkline: generateSparkline(54.70, 0.8), category: "blue-chip", marketCap: "€4.1B" },
  { id: "moh",      name: "Motor Oil Hellas",        ticker: "MOH",      price: 36.30, change: 0.48, changePercent: 1.34, sparkline: generateSparkline(35.82, 0.5), category: "blue-chip", marketCap: "€3.9B" },
  { id: "gekterna", name: "GEK TERNA",               ticker: "GEKTERNA", price: 35.42, change: 0.88, changePercent: 2.55, sparkline: generateSparkline(34.54, 0.6), category: "blue-chip", marketCap: "€3.5B" },
  { id: "aia",      name: "Athens Intl Airport",      ticker: "AIA",      price: 11.41, change: -0.03, changePercent: -0.26, sparkline: generateSparkline(11.44, 0.15), category: "blue-chip", marketCap: "€3.5B" },
  { id: "bela",     name: "Jumbo S.A.",              ticker: "BELA",     price: 26.00, change: -0.18, changePercent: -0.69, sparkline: generateSparkline(26.18, 0.4), category: "blue-chip", marketCap: "€3.5B" },
  { id: "vio",      name: "Viohalco",                ticker: "VIO",      price: 12.70, change: -0.38, changePercent: -2.91, sparkline: generateSparkline(13.08, 0.25), category: "blue-chip", marketCap: "€3.3B" },
  { id: "elpe",     name: "HELLENiQ Energy",         ticker: "ELPE",     price: 9.34,  change: -0.03, changePercent: -0.27, sparkline: generateSparkline(9.37, 0.12), category: "blue-chip", marketCap: "€2.9B" },

  // ── Dividend / REITs / Utilities (15 stocks) ─────────────────────────
  { id: "credia",    name: "CrediaBank",              ticker: "CREDIA",    price: 1.43,  change: -0.02, changePercent: -1.38, sparkline: generateSparkline(1.45, 0.02), category: "dividend", marketCap: "€2.3B" },
  { id: "prodea",    name: "Prodea REIC",             ticker: "PRODEA",    price: 5.75,  change: -0.10, changePercent: -1.71, sparkline: generateSparkline(5.85, 0.08), category: "dividend", marketCap: "€1.5B" },
  { id: "kare",      name: "Karelia Tobacco",         ticker: "KARE",      price: 366.00, change: 0.00, changePercent: 0.00, sparkline: generateSparkline(366.00, 5.0), category: "dividend", marketCap: "€1.0B" },
  { id: "ppa",       name: "Piraeus Port Authority",  ticker: "PPA",       price: 39.65, change: -0.05, changePercent: -0.13, sparkline: generateSparkline(39.70, 0.5), category: "dividend", marketCap: "€991M" },
  { id: "eydap",     name: "Athens Water (EYDAP)",    ticker: "EYDAP",     price: 7.33,  change: 0.03, changePercent: 0.41, sparkline: generateSparkline(7.30, 0.1), category: "dividend", marketCap: "€781M" },
  { id: "kri",       name: "Kri-Kri Milk Industry",   ticker: "KRI",       price: 22.95, change: -0.05, changePercent: -0.22, sparkline: generateSparkline(23.00, 0.3), category: "dividend", marketCap: "€757M" },
  { id: "admie",     name: "ADMIE Holdings",          ticker: "ADMIE",     price: 2.97,  change: -0.07, changePercent: -2.31, sparkline: generateSparkline(3.04, 0.04), category: "dividend", marketCap: "€687M" },
  { id: "noval",     name: "Noval Property REIC",     ticker: "NOVAL",     price: 2.78,  change: 0.02, changePercent: 0.73, sparkline: generateSparkline(2.76, 0.03), category: "dividend", marketCap: "€351M" },
  { id: "trastor",   name: "Trastor REIC",            ticker: "TRASTOR",   price: 1.33,  change: 0.00, changePercent: 0.00, sparkline: generateSparkline(1.33, 0.02), category: "dividend", marketCap: "€326M" },
  { id: "briq",      name: "BriQ Properties REIC",    ticker: "BRIQ",      price: 2.95,  change: 0.03, changePercent: 1.03, sparkline: generateSparkline(2.92, 0.04), category: "dividend", marketCap: "€138M" },
  { id: "premia",    name: "Premia REIC",             ticker: "PREMIA",    price: 1.37,  change: -0.02, changePercent: -1.30, sparkline: generateSparkline(1.39, 0.02), category: "dividend", marketCap: "€129M" },
  { id: "orilina",   name: "Orilina Properties REIC", ticker: "ORILINA",   price: 0.84,  change: 0.00, changePercent: 0.48, sparkline: generateSparkline(0.84, 0.01), category: "dividend", marketCap: "€128M" },
  { id: "blekedros", name: "Ble Kedros REIC",         ticker: "BLEKEDROS", price: 4.29,  change: 0.00, changePercent: 0.00, sparkline: generateSparkline(4.29, 0.05), category: "dividend", marketCap: "€173M" },
  { id: "trestates", name: "Trade Estates REIC",      ticker: "TRESTATES", price: 1.98,  change: 0.02, changePercent: 1.02, sparkline: generateSparkline(1.96, 0.03), category: "dividend", marketCap: "€240M" },
  { id: "eyaps",     name: "Thessaloniki Water",      ticker: "EYAPS",     price: 3.61,  change: -0.09, changePercent: -2.43, sparkline: generateSparkline(3.70, 0.05), category: "dividend", marketCap: "€131M" },

  // ── Growth / Mid-Cap / Small-Cap (102 stocks) ────────────────────────
  { id: "aktr",      name: "Aktor Holdings",          ticker: "AKTR",      price: 11.20, change: 0.06, changePercent: 0.54, sparkline: generateSparkline(11.14, 0.15), category: "growth", marketCap: "€2.3B" },
  { id: "optima",    name: "Optima Bank",             ticker: "OPTIMA",    price: 9.66,  change: 0.11, changePercent: 1.15, sparkline: generateSparkline(9.55, 0.12), category: "growth", marketCap: "€2.1B" },
  { id: "bylot",     name: "Intralot (Bally's)",      ticker: "BYLOT",     price: 1.01,  change: -0.02, changePercent: -1.57, sparkline: generateSparkline(1.03, 0.02), category: "growth", marketCap: "€1.9B" },
  { id: "elha",      name: "Elvalhalcor",             ticker: "ELHA",      price: 4.94,  change: 0.17, changePercent: 3.67, sparkline: generateSparkline(4.77, 0.08), category: "growth", marketCap: "€1.9B" },
  { id: "aegn",      name: "Aegean Airlines",         ticker: "AEGN",      price: 15.00, change: -0.02, changePercent: -0.13, sparkline: generateSparkline(15.02, 0.2), category: "growth", marketCap: "€1.4B" },
  { id: "lamda",     name: "LAMDA Development",       ticker: "LAMDA",     price: 7.50,  change: -0.06, changePercent: -0.79, sparkline: generateSparkline(7.56, 0.1), category: "growth", marketCap: "€1.3B" },
  { id: "lamps",     name: "Lampsa Hotels",           ticker: "LAMPS",     price: 45.40, change: 0.00, changePercent: 0.00, sparkline: generateSparkline(45.40, 0.6), category: "growth", marketCap: "€970M" },
  { id: "sar",       name: "Sarantis Group",          ticker: "SAR",       price: 14.10, change: 0.10, changePercent: 0.71, sparkline: generateSparkline(14.00, 0.2), category: "growth", marketCap: "€896M" },
  { id: "quest",     name: "Quest Holdings",          ticker: "QUEST",     price: 6.95,  change: -0.05, changePercent: -0.72, sparkline: generateSparkline(7.00, 0.1), category: "growth", marketCap: "€735M" },
  { id: "otoel",     name: "Autohellas",              ticker: "OTOEL",     price: 12.80, change: 0.08, changePercent: 0.63, sparkline: generateSparkline(12.72, 0.15), category: "growth", marketCap: "€615M" },
  { id: "avax",      name: "Avax S.A.",               ticker: "AVAX",      price: 3.43,  change: 0.00, changePercent: 0.00, sparkline: generateSparkline(3.43, 0.05), category: "growth", marketCap: "€506M" },
  { id: "ellaktor",  name: "Ellaktor",                ticker: "ELLAKTOR",  price: 1.36,  change: -0.02, changePercent: -1.31, sparkline: generateSparkline(1.38, 0.02), category: "growth", marketCap: "€471M" },
  { id: "attica",    name: "Attica Holdings",         ticker: "ATTICA",    price: 1.81,  change: -0.03, changePercent: -1.63, sparkline: generateSparkline(1.84, 0.03), category: "growth", marketCap: "€440M" },
  { id: "qlco",      name: "Qualco Group",            ticker: "QLCO",      price: 6.00,  change: -0.19, changePercent: -3.07, sparkline: generateSparkline(6.19, 0.1), category: "growth", marketCap: "€420M" },
  { id: "plakr",     name: "Plastika Kritis",         ticker: "PLAKR",     price: 14.60, change: -0.90, changePercent: -5.81, sparkline: generateSparkline(15.50, 0.3), category: "growth", marketCap: "€400M" },
  { id: "olth",      name: "Thessaloniki Port",       ticker: "OLTH",      price: 37.10, change: -0.50, changePercent: -1.33, sparkline: generateSparkline(37.60, 0.5), category: "growth", marketCap: "€374M" },
  { id: "aem",       name: "Alter Ego Media",         ticker: "AEM",       price: 6.24,  change: -0.05, changePercent: -0.72, sparkline: generateSparkline(6.29, 0.08), category: "growth", marketCap: "€365M" },
  { id: "exae",      name: "Hellenic Exchanges",      ticker: "EXAE",      price: 5.79,  change: -0.05, changePercent: -0.86, sparkline: generateSparkline(5.84, 0.08), category: "growth", marketCap: "€335M" },
  { id: "intek",     name: "Ideal Holdings",          ticker: "INTEK",     price: 6.10,  change: -0.01, changePercent: -0.16, sparkline: generateSparkline(6.11, 0.08), category: "growth", marketCap: "€325M" },
  { id: "tell",      name: "Bank of Greece",          ticker: "TELL",      price: 16.35, change: -0.35, changePercent: -2.10, sparkline: generateSparkline(16.70, 0.25), category: "growth", marketCap: "€325M" },
  { id: "evr",       name: "Evropi Holdings",         ticker: "EVR",       price: 2.08,  change: -0.05, changePercent: -2.35, sparkline: generateSparkline(2.13, 0.03), category: "growth", marketCap: "€298M" },
  { id: "intrk",     name: "Intracom Holdings",       ticker: "INTRK",     price: 3.46,  change: -0.08, changePercent: -2.13, sparkline: generateSparkline(3.54, 0.05), category: "growth", marketCap: "€287M" },
  { id: "acag",      name: "Austriacard Holdings",    ticker: "ACAG",      price: 7.33,  change: -0.07, changePercent: -0.95, sparkline: generateSparkline(7.40, 0.1), category: "growth", marketCap: "€266M" },
  { id: "dimand",    name: "Dimand S.A.",             ticker: "DIMAND",    price: 12.90, change: 0.10, changePercent: 0.78, sparkline: generateSparkline(12.80, 0.15), category: "growth", marketCap: "€240M" },
  { id: "lavi",      name: "Lavipharm",               ticker: "LAVI",      price: 1.32,  change: 0.02, changePercent: 1.38, sparkline: generateSparkline(1.30, 0.02), category: "growth", marketCap: "€223M" },
  { id: "foyrk",     name: "Fourlis Holdings",        ticker: "FOYRK",     price: 4.32,  change: 0.04, changePercent: 1.05, sparkline: generateSparkline(4.28, 0.06), category: "growth", marketCap: "€213M" },
  { id: "prof",      name: "Profile Systems",         ticker: "PROF",      price: 7.89,  change: -0.11, changePercent: -1.38, sparkline: generateSparkline(8.00, 0.1), category: "growth", marketCap: "€194M" },
  { id: "almy",      name: "Alumil Aluminium",        ticker: "ALMY",      price: 5.82,  change: -0.18, changePercent: -3.00, sparkline: generateSparkline(6.00, 0.1), category: "growth", marketCap: "€189M" },
  { id: "plat",      name: "Thrace Plastics",         ticker: "PLAT",      price: 4.18,  change: -0.07, changePercent: -1.65, sparkline: generateSparkline(4.25, 0.06), category: "growth", marketCap: "€179M" },
  { id: "iatr",      name: "Athens Medical Centre",   ticker: "IATR",      price: 1.96,  change: -0.02, changePercent: -0.76, sparkline: generateSparkline(1.98, 0.03), category: "growth", marketCap: "€170M" },
  { id: "fais",      name: "Fais Holding",            ticker: "FAIS",      price: 3.65,  change: -0.05, changePercent: -1.35, sparkline: generateSparkline(3.70, 0.05), category: "growth", marketCap: "€165M" },
  { id: "merko",     name: "Mermeren Kombinat",       ticker: "MERKO",     price: 33.80, change: -1.20, changePercent: -3.43, sparkline: generateSparkline(35.00, 0.5), category: "growth", marketCap: "€158M" },
  { id: "realcons",  name: "Real Consulting",         ticker: "REALCONS",  price: 6.16,  change: 0.12, changePercent: 1.99, sparkline: generateSparkline(6.04, 0.08), category: "growth", marketCap: "€129M" },
  { id: "cairomez",  name: "Cairo Mezz",              ticker: "CAIROMEZ",  price: 0.40,  change: -0.02, changePercent: -4.90, sparkline: generateSparkline(0.42, 0.01), category: "growth", marketCap: "€123M" },
  { id: "mig",       name: "MIG Holdings",            ticker: "MIG",       price: 3.65,  change: -0.02, changePercent: -0.55, sparkline: generateSparkline(3.67, 0.05), category: "growth", marketCap: "€115M" },
  { id: "inlif",     name: "Interlife Insurance",     ticker: "INLIF",     price: 6.14,  change: -0.20, changePercent: -3.15, sparkline: generateSparkline(6.34, 0.1), category: "growth", marketCap: "€113M" },
  { id: "perf",      name: "Performance Technologies",ticker: "PERF",      price: 8.06,  change: -0.05, changePercent: -0.62, sparkline: generateSparkline(8.11, 0.1), category: "growth", marketCap: "€113M" },
  { id: "onyx",      name: "Onyx Touristiki",         ticker: "ONYX",      price: 1.60,  change: -0.01, changePercent: -0.31, sparkline: generateSparkline(1.61, 0.02), category: "growth", marketCap: "€110M" },
  { id: "ekter",     name: "Ekter S.A.",              ticker: "EKTER",     price: 3.90,  change: -0.02, changePercent: -0.38, sparkline: generateSparkline(3.92, 0.05), category: "growth", marketCap: "€108M" },
  { id: "moda",      name: "Moda Bagno",              ticker: "MODA",      price: 5.70,  change: -0.06, changePercent: -1.04, sparkline: generateSparkline(5.76, 0.08), category: "growth", marketCap: "€107M" },
  { id: "astak",     name: "Alpha Real Estate",       ticker: "ASTAK",     price: 7.28,  change: -0.08, changePercent: -1.09, sparkline: generateSparkline(7.36, 0.1), category: "growth", marketCap: "€102M" },
  { id: "meva",      name: "Mevaco",                  ticker: "MEVA",      price: 9.65,  change: 0.25, changePercent: 2.66, sparkline: generateSparkline(9.40, 0.15), category: "growth", marketCap: "€101M" },
  { id: "pap",       name: "Papoutsanis",             ticker: "PAP",       price: 3.75,  change: -0.01, changePercent: -0.27, sparkline: generateSparkline(3.76, 0.05), category: "growth", marketCap: "€101M" },
  { id: "olymp",     name: "Technical Olympic",       ticker: "OLYMP",     price: 2.44,  change: -0.02, changePercent: -0.81, sparkline: generateSparkline(2.46, 0.03), category: "growth", marketCap: "€97M" },
  { id: "flexo",     name: "Flexopack",               ticker: "FLEXO",     price: 8.00,  change: -0.30, changePercent: -3.61, sparkline: generateSparkline(8.30, 0.12), category: "growth", marketCap: "€95M" },
  { id: "daios",     name: "Daios Plastics",          ticker: "DAIOS",     price: 6.10,  change: -0.15, changePercent: -2.40, sparkline: generateSparkline(6.25, 0.1), category: "growth", marketCap: "€92M" },
  { id: "dotsoft",   name: "Dotsoft",                 ticker: "DOTSOFT",   price: 27.00, change: -1.00, changePercent: -3.57, sparkline: generateSparkline(28.00, 0.5), category: "growth", marketCap: "€84M" },
  { id: "ave",       name: "AVE S.A.",                ticker: "AVE",       price: 0.46,  change: -0.01, changePercent: -1.28, sparkline: generateSparkline(0.47, 0.01), category: "growth", marketCap: "€82M" },
  { id: "pvmezz",    name: "Phoenix Vega Mezz",       ticker: "PVMEZZ",    price: 0.063, change: -0.004, changePercent: -6.24, sparkline: generateSparkline(0.067, 0.002), category: "growth", marketCap: "€79M" },
  { id: "moto",      name: "Motodynamics",            ticker: "MOTO",      price: 2.57,  change: 0.00, changePercent: 0.00, sparkline: generateSparkline(2.57, 0.04), category: "growth", marketCap: "€75M" },
  { id: "ex",        name: "Euroxx Securities",       ticker: "EX",        price: 5.05,  change: 0.00, changePercent: 0.00, sparkline: generateSparkline(5.05, 0.07), category: "growth", marketCap: "€75M" },
  { id: "ilyda",     name: "Ilyda S.A.",              ticker: "ILYDA",     price: 5.00,  change: 0.06, changePercent: 1.22, sparkline: generateSparkline(4.94, 0.07), category: "growth", marketCap: "€71M" },
  { id: "kylo",      name: "Loulis Food Ingredients", ticker: "KYLO",      price: 3.90,  change: -0.07, changePercent: -1.76, sparkline: generateSparkline(3.97, 0.05), category: "growth", marketCap: "€67M" },
  { id: "gebka",     name: "General Commercial",      ticker: "GEBKA",     price: 2.36,  change: 0.03, changePercent: 1.29, sparkline: generateSparkline(2.33, 0.03), category: "growth", marketCap: "€57M" },
  { id: "elton",     name: "Elton International",     ticker: "ELTON",     price: 2.08,  change: 0.02, changePercent: 0.97, sparkline: generateSparkline(2.06, 0.03), category: "growth", marketCap: "€56M" },
  { id: "petro",     name: "Petros Petropoulos",      ticker: "PETRO",     price: 8.48,  change: -0.02, changePercent: -0.24, sparkline: generateSparkline(8.50, 0.1), category: "growth", marketCap: "€55M" },
  { id: "elin",      name: "Elinoil Petroleum",       ticker: "ELIN",      price: 2.33,  change: 0.00, changePercent: 0.00, sparkline: generateSparkline(2.33, 0.03), category: "growth", marketCap: "€55M" },
  { id: "evrof",     name: "Evrofarma",               ticker: "EVROF",     price: 4.00,  change: 0.02, changePercent: 0.50, sparkline: generateSparkline(3.98, 0.05), category: "growth", marketCap: "€55M" },
  { id: "asco",      name: "AS Company",              ticker: "ASCO",      price: 4.00,  change: -0.08, changePercent: -1.96, sparkline: generateSparkline(4.08, 0.06), category: "growth", marketCap: "€52M" },
  { id: "frigo",     name: "Frigoglass",              ticker: "FRIGO",     price: 0.42,  change: 0.01, changePercent: 1.71, sparkline: generateSparkline(0.41, 0.01), category: "growth", marketCap: "€51M" },
  { id: "space",     name: "Space Hellas",            ticker: "SPACE",     price: 7.80,  change: 0.00, changePercent: 0.00, sparkline: generateSparkline(7.80, 0.1), category: "growth", marketCap: "€50M" },
  { id: "qual",      name: "Quality & Reliability",   ticker: "QUAL",      price: 1.35,  change: 0.00, changePercent: 0.15, sparkline: generateSparkline(1.35, 0.02), category: "growth", marketCap: "€48M" },
  { id: "iktin",     name: "Iktinos Hellas",          ticker: "IKTIN",     price: 0.41,  change: -0.01, changePercent: -1.45, sparkline: generateSparkline(0.42, 0.01), category: "growth", marketCap: "€47M" },
  { id: "elstr",     name: "Elastron Steel",          ticker: "ELSTR",     price: 2.53,  change: -0.02, changePercent: -0.78, sparkline: generateSparkline(2.55, 0.03), category: "growth", marketCap: "€46M" },
  { id: "biosk",     name: "Unibios Holdings",        ticker: "BIOSK",     price: 2.71,  change: -0.07, changePercent: -2.52, sparkline: generateSparkline(2.78, 0.04), category: "growth", marketCap: "€46M" },
  { id: "bioka",     name: "Biokarpet",               ticker: "BIOKA",     price: 1.83,  change: -0.02, changePercent: -1.08, sparkline: generateSparkline(1.85, 0.03), category: "growth", marketCap: "€44M" },
  { id: "foodl",     name: "Foodlink",                ticker: "FOODL",     price: 1.30,  change: -0.01, changePercent: -0.77, sparkline: generateSparkline(1.31, 0.02), category: "growth", marketCap: "€42M" },
  { id: "atrust",    name: "Alpha Trust Holdings",    ticker: "ATRUST",    price: 12.95, change: -0.05, changePercent: -0.39, sparkline: generateSparkline(13.00, 0.15), category: "growth", marketCap: "€40M" },
  { id: "kekr",      name: "Kekrops",                 ticker: "KEKR",      price: 2.02,  change: -0.01, changePercent: -0.49, sparkline: generateSparkline(2.03, 0.03), category: "growth", marketCap: "€40M" },
  { id: "gcmezz",    name: "Galaxy Cosmos Mezz",      ticker: "GCMEZZ",    price: 0.46,  change: -0.02, changePercent: -5.11, sparkline: generateSparkline(0.48, 0.01), category: "growth", marketCap: "€40M" },
  { id: "centr",     name: "Centric Holdings",        ticker: "CENTR",     price: 0.38,  change: -0.01, changePercent: -3.59, sparkline: generateSparkline(0.39, 0.01), category: "growth", marketCap: "€37M" },
  { id: "domik",     name: "Domiki Kritis",           ticker: "DOMIK",     price: 2.34,  change: -0.01, changePercent: -0.43, sparkline: generateSparkline(2.35, 0.03), category: "growth", marketCap: "€37M" },
  { id: "revoil",    name: "Revoil",                  ticker: "REVOIL",    price: 1.69,  change: -0.01, changePercent: -0.59, sparkline: generateSparkline(1.70, 0.02), category: "growth", marketCap: "€37M" },
  { id: "sunmezz",   name: "SunriseMezz",             ticker: "SUNMEZZ",   price: 0.19,  change: -0.005, changePercent: -2.37, sparkline: generateSparkline(0.195, 0.005), category: "growth", marketCap: "€34M" },
  { id: "eis",       name: "European Innovation",     ticker: "EIS",       price: 1.87,  change: 0.01, changePercent: 0.75, sparkline: generateSparkline(1.86, 0.03), category: "growth", marketCap: "€29M" },
  { id: "sidma",     name: "Sidma Steel",             ticker: "SIDMA",     price: 2.00,  change: 0.05, changePercent: 2.56, sparkline: generateSparkline(1.95, 0.03), category: "growth", marketCap: "€27M" },
  { id: "moyzk",     name: "Mouzakis",                ticker: "MOYZK",     price: 0.61,  change: 0.00, changePercent: 0.00, sparkline: generateSparkline(0.61, 0.01), category: "growth", marketCap: "€24M" },
  { id: "nakas",     name: "Philippos Nakas",         ticker: "NAKAS",     price: 3.60,  change: -0.08, changePercent: -2.17, sparkline: generateSparkline(3.68, 0.05), category: "growth", marketCap: "€23M" },
  { id: "atek",      name: "Attica Publications",     ticker: "ATEK",      price: 1.40,  change: 0.00, changePercent: 0.00, sparkline: generateSparkline(1.40, 0.02), category: "growth", marketCap: "€21M" },
  { id: "elbe",      name: "Elve S.A.",               ticker: "ELBE",      price: 5.50,  change: 0.00, changePercent: 0.00, sparkline: generateSparkline(5.50, 0.07), category: "growth", marketCap: "€18M" },
  { id: "nayp",      name: "Nafpaktos Textile",       ticker: "NAYP",      price: 1.48,  change: 0.02, changePercent: 1.37, sparkline: generateSparkline(1.46, 0.02), category: "growth", marketCap: "€17M" },
  { id: "softweb",   name: "SOFTWeb",                 ticker: "SOFTWEB",   price: 3.01,  change: -0.03, changePercent: -0.99, sparkline: generateSparkline(3.04, 0.04), category: "growth", marketCap: "€15M" },
  { id: "yknot",     name: "Y/Knot Invest",           ticker: "YKNOT",     price: 1.92,  change: -0.05, changePercent: -2.54, sparkline: generateSparkline(1.97, 0.03), category: "growth", marketCap: "€15M" },
  { id: "vosys",     name: "Vogiatzoglou Systems",    ticker: "VOSYS",     price: 2.22,  change: 0.00, changePercent: 0.00, sparkline: generateSparkline(2.22, 0.03), category: "growth", marketCap: "€14M" },
  { id: "akrit",     name: "Akritas",                 ticker: "AKRIT",     price: 1.08,  change: 0.00, changePercent: 0.00, sparkline: generateSparkline(1.08, 0.02), category: "growth", marketCap: "€14M" },
  { id: "drome",     name: "Dromeas",                 ticker: "DROME",     price: 0.37,  change: -0.01, changePercent: -2.12, sparkline: generateSparkline(0.38, 0.01), category: "growth", marketCap: "€13M" },
  { id: "xylek",     name: "Interwood-Xylemporia",    ticker: "XYLEK",     price: 0.25,  change: 0.00, changePercent: -1.17, sparkline: generateSparkline(0.25, 0.005), category: "growth", marketCap: "€12M" },
  { id: "medic",     name: "Medicon Hellas",          ticker: "MEDIC",     price: 2.62,  change: -0.03, changePercent: -1.13, sparkline: generateSparkline(2.65, 0.04), category: "growth", marketCap: "€12M" },
  { id: "intet",     name: "Intertech",               ticker: "INTET",     price: 0.68,  change: -0.01, changePercent: -1.45, sparkline: generateSparkline(0.69, 0.01), category: "growth", marketCap: "€11M" },
  { id: "varnh",     name: "Varvaressos Mills",       ticker: "VARNH",     price: 0.38,  change: 0.00, changePercent: 0.00, sparkline: generateSparkline(0.38, 0.01), category: "growth", marketCap: "€10M" },
  { id: "cpi",       name: "CPI Computer",            ticker: "CPI",       price: 0.94,  change: -0.01, changePercent: -1.27, sparkline: generateSparkline(0.95, 0.01), category: "growth", marketCap: "€7M" },
  { id: "haide",     name: "Haidemenos Printing",     ticker: "HAIDE",     price: 0.75,  change: 0.02, changePercent: 2.76, sparkline: generateSparkline(0.73, 0.01), category: "growth", marketCap: "€6M" },
  { id: "aaak",      name: "Wool Industry Tria Alfa", ticker: "AAAK",      price: 6.00,  change: 0.00, changePercent: 0.00, sparkline: generateSparkline(6.00, 0.08), category: "growth", marketCap: "€6M" },
  { id: "kysa",      name: "Flour Mills Sarantopoulos",ticker: "KYSA",     price: 1.40,  change: 0.00, changePercent: 0.00, sparkline: generateSparkline(1.40, 0.02), category: "growth", marketCap: "€6M" },
  { id: "profk",     name: "Pipe Works Girakian",     ticker: "PROFK",     price: 1.77,  change: 0.00, changePercent: 0.00, sparkline: generateSparkline(1.77, 0.03), category: "growth", marketCap: "€5M" },
  { id: "cnlcap",    name: "CNL Capital AIFM",        ticker: "CNLCAP",    price: 7.10,  change: 0.00, changePercent: 0.00, sparkline: generateSparkline(7.10, 0.1), category: "growth", marketCap: "€5M" },
  { id: "min",       name: "Minerva (Ladenis Bros)",  ticker: "MIN",       price: 0.74,  change: 0.03, changePercent: 3.92, sparkline: generateSparkline(0.71, 0.01), category: "growth", marketCap: "€5M" },
  { id: "spir",      name: "House of Agriculture",    ticker: "SPIR",      price: 0.14,  change: 0.00, changePercent: 0.00, sparkline: generateSparkline(0.14, 0.003), category: "growth", marketCap: "€4M" },
  { id: "biot",      name: "Bioter",                  ticker: "BIOT",      price: 0.21,  change: 0.00, changePercent: 0.00, sparkline: generateSparkline(0.21, 0.005), category: "growth", marketCap: "€3M" },
  { id: "lebek",     name: "N. Leventeris (Common)",  ticker: "LEBEK",     price: 0.28,  change: 0.00, changePercent: 0.00, sparkline: generateSparkline(0.28, 0.005), category: "growth", marketCap: "€2M" },
  { id: "lebep",     name: "N. Leventeris (Pref)",    ticker: "LEBEP",     price: 0.18,  change: 0.00, changePercent: 0.00, sparkline: generateSparkline(0.18, 0.004), category: "growth", marketCap: "€2M" },
  { id: "yalco",     name: "YALCO",                   ticker: "YALCO",     price: 0.16,  change: 0.00, changePercent: 0.00, sparkline: generateSparkline(0.16, 0.003), category: "growth", marketCap: "€2M" },
];

export const TRENDING_STOCKS = GREEK_STOCKS.filter(
  (s) => s.changePercent > 2
).sort((a, b) => b.changePercent - a.changePercent);

export const TOP_GAINERS = [...GREEK_STOCKS]
  .filter((s) => s.change > 0)
  .sort((a, b) => b.changePercent - a.changePercent);

export const TOP_LOSERS = [...GREEK_STOCKS]
  .filter((s) => s.change < 0)
  .sort((a, b) => a.changePercent - b.changePercent);

export const PORTFOLIO_HOLDINGS: Holding[] = [
  {
    asset: GREEK_STOCKS.find(s => s.id === "opap")!,
    shares: 12,
    avgCost: 15.20,
    currentValue: 12 * 17.55,
    pnl: 12 * (17.55 - 15.20),
    pnlPercent: ((17.55 - 15.20) / 15.20) * 100,
  },
  {
    asset: GREEK_STOCKS.find(s => s.id === "ete")!,
    shares: 25,
    avgCost: 12.80,
    currentValue: 25 * 15.25,
    pnl: 25 * (15.25 - 12.80),
    pnlPercent: ((15.25 - 12.80) / 12.80) * 100,
  },
  {
    asset: GREEK_STOCKS.find(s => s.id === "mtln")!,
    shares: 5,
    avgCost: 36.50,
    currentValue: 5 * 38.50,
    pnl: 5 * (38.50 - 36.50),
    pnlPercent: ((38.50 - 36.50) / 36.50) * 100,
  },
  {
    asset: GREEK_STOCKS.find(s => s.id === "eurob")!,
    shares: 100,
    avgCost: 3.90,
    currentValue: 100 * 4.19,
    pnl: 100 * (4.19 - 3.90),
    pnlPercent: ((4.19 - 3.90) / 3.90) * 100,
  },
];

export const PORTFOLIO_TOTAL_VALUE = PORTFOLIO_HOLDINGS.reduce(
  (sum, h) => sum + h.currentValue,
  0
);

export const PORTFOLIO_TOTAL_PNL = PORTFOLIO_HOLDINGS.reduce(
  (sum, h) => sum + h.pnl,
  0
);

export const PORTFOLIO_TOTAL_COST = PORTFOLIO_HOLDINGS.reduce(
  (sum, h) => sum + h.shares * h.avgCost,
  0
);

export const PORTFOLIO_PNL_PERCENT =
  (PORTFOLIO_TOTAL_PNL / PORTFOLIO_TOTAL_COST) * 100;

export const PORTFOLIO_SPARKLINE = generateSparkline(
  PORTFOLIO_TOTAL_VALUE * 0.92,
  PORTFOLIO_TOTAL_VALUE * 0.015,
  30
);

export const SOCIAL_FEED: SocialPost[] = [
  {
    id: "1",
    username: "MarketMaverick",
    avatar: "MM",
    content: "Just loaded up on $OPAP before earnings. The gaming revenue numbers are going to be insane this quarter.",
    assetTag: "OPAP",
    likes: 42,
    comments: 8,
    timestamp: "2h ago",
    pnlPercent: 12.4,
  },
  {
    id: "2",
    username: "AthensTrader",
    avatar: "AT",
    content: "Greek banks are on fire! $ALPHA and $ETE both breaking out. The NPL cleanup is finally paying off.",
    assetTag: "ALPHA",
    likes: 67,
    comments: 15,
    timestamp: "4h ago",
    pnlPercent: 8.7,
  },
  {
    id: "3",
    username: "DividendHunter",
    avatar: "DH",
    content: "Motor Oil just announced a special dividend. This is why I hold $MOH — consistent cash flow machines.",
    assetTag: "MOH",
    likes: 31,
    comments: 5,
    timestamp: "6h ago",
  },
  {
    id: "4",
    username: "NoviceInvestor",
    avatar: "NI",
    content: "Just made my first trade ever! Bought €10 of $BELA. Small start but it feels amazing to own a piece of Jumbo!",
    assetTag: "BELA",
    likes: 128,
    comments: 23,
    timestamp: "8h ago",
    pnlPercent: 2.0,
  },
  {
    id: "5",
    username: "TechAnalyst",
    avatar: "TA",
    content: "Metlen breaking above the 200-day MA. $MTLN has been my best performer this year. Target €45.",
    assetTag: "MTLN",
    likes: 55,
    comments: 11,
    timestamp: "12h ago",
    pnlPercent: 22.1,
  },
];

export const LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, username: "OracleOfAthens", avatar: "OA", returnPercent: 34.2, trades: 156, streak: 12 },
  { rank: 2, username: "MarketMaverick", avatar: "MM", returnPercent: 28.7, trades: 89, streak: 8 },
  { rank: 3, username: "BullishOnGreece", avatar: "BG", returnPercent: 24.1, trades: 203, streak: 15 },
  { rank: 4, username: "AthensTrader", avatar: "AT", returnPercent: 21.5, trades: 67, streak: 5 },
  { rank: 5, username: "DividendHunter", avatar: "DH", returnPercent: 18.9, trades: 42, streak: 22 },
  { rank: 6, username: "TechAnalyst", avatar: "TA", returnPercent: 16.3, trades: 134, streak: 3 },
  { rank: 7, username: "GreekAlpha", avatar: "GA", returnPercent: 14.8, trades: 78, streak: 7 },
  { rank: 8, username: "IndexFundFan", avatar: "IF", returnPercent: 12.1, trades: 12, streak: 30 },
  { rank: 9, username: "OptionsKing", avatar: "OK", returnPercent: 11.4, trades: 245, streak: 2 },
  { rank: 10, username: "NoviceInvestor", avatar: "NI", returnPercent: 8.6, trades: 15, streak: 4 },
];

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first-trade", title: "First Trade", description: "Execute your first trade", icon: "🎯", unlocked: true, progress: 1, total: 1 },
  { id: "diversified", title: "Diversified", description: "Own 5 different stocks", icon: "🌐", unlocked: false, progress: 4, total: 5 },
  { id: "diamond-hands", title: "Diamond Hands", description: "Hold a position for 30 days", icon: "💎", unlocked: false, progress: 18, total: 30 },
  { id: "social-butterfly", title: "Social Butterfly", description: "Get 50 likes on a post", icon: "🦋", unlocked: false, progress: 23, total: 50 },
  { id: "streak-master", title: "Streak Master", description: "Maintain a 7-day login streak", icon: "🔥", unlocked: true, progress: 7, total: 7 },
  { id: "profit-taker", title: "Profit Taker", description: "Close a trade with 10%+ profit", icon: "💰", unlocked: true, progress: 1, total: 1 },
  { id: "athex-explorer", title: "ATHEX Explorer", description: "View 20 different stocks", icon: "🔍", unlocked: false, progress: 12, total: 20 },
  { id: "options-rookie", title: "Options Rookie", description: "Place your first options trade", icon: "📊", unlocked: false, progress: 0, total: 1 },
];

export const DAILY_CHALLENGE: DailyChallenge = {
  id: "dc-today",
  title: "Market Explorer",
  description: "View 3 different stock detail pages",
  reward: "€2 credit",
  progress: 1,
  total: 3,
  completed: false,
};

export const USER_STREAK = 5;

export const QUICK_AMOUNTS = [1, 5, 10, 25, 50, 100];

export const DEMO_BALANCE = 100000;

// Chart data for asset detail
export function generateChartData(
  base: number,
  volatility: number,
  points: number
): { time: string; value: number }[] {
  const data: { time: string; value: number }[] = [];
  let current = base;
  for (let i = 0; i < points; i++) {
    current += (Math.random() - 0.48) * volatility;
    const hour = Math.floor((i / points) * 24);
    data.push({
      time: `${hour.toString().padStart(2, "0")}:00`,
      value: Math.round(current * 100) / 100,
    });
  }
  return data;
}
