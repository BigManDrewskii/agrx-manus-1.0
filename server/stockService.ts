/**
 * AGRX Stock Data Service
 * 
 * Server-side service that fetches live ATHEX stock data from Yahoo Finance
 * via the built-in data API. Includes an in-memory cache to respect rate limits
 * and provide fast responses. Covers the complete ATHEX listing (135 verified symbols).
 */
import { callDataApi } from "./_core/dataApi";

// ─── Symbol Mapping ─────────────────────────────────────────────────────────
// Maps our internal AGRX stock IDs to Yahoo Finance ATHEX symbols (.AT suffix)
// 135 verified symbols as of Feb 2026, sorted by market cap descending
export const ATHEX_SYMBOLS: Record<string, { yahoo: string; name: string; category: "blue-chip" | "growth" | "dividend" }> = {
  // ── Blue-Chip (>3B market cap) ──────────────────────────────────────────
  eee:       { yahoo: "EEE.AT",       name: "Coca-Cola HBC",                  category: "blue-chip" },
  eurob:     { yahoo: "EUROB.AT",     name: "Eurobank",                       category: "blue-chip" },
  ete:       { yahoo: "ETE.AT",       name: "National Bank of Greece",        category: "blue-chip" },
  tpeir:     { yahoo: "TPEIR.AT",     name: "Piraeus Bank",                   category: "blue-chip" },
  alpha:     { yahoo: "ALPHA.AT",     name: "Alpha Bank",                     category: "blue-chip" },
  ppc:       { yahoo: "PPC.AT",       name: "Public Power Corp",              category: "blue-chip" },
  hto:       { yahoo: "HTO.AT",       name: "Hellenic Telecom (OTE)",         category: "blue-chip" },
  opap:      { yahoo: "OPAP.AT",      name: "OPAP S.A.",                      category: "blue-chip" },
  mtln:      { yahoo: "MTLN.AT",      name: "Metlen Energy & Metals",         category: "blue-chip" },
  bochgr:    { yahoo: "BOCHGR.AT",    name: "Bank of Cyprus",                 category: "blue-chip" },
  cener:     { yahoo: "CENER.AT",     name: "Cenergy Holdings",               category: "blue-chip" },
  titc:      { yahoo: "TITC.AT",      name: "Titan Cement",                   category: "blue-chip" },
  moh:       { yahoo: "MOH.AT",       name: "Motor Oil Hellas",               category: "blue-chip" },
  gekterna:  { yahoo: "GEKTERNA.AT",  name: "GEK TERNA",                      category: "blue-chip" },
  aia:       { yahoo: "AIA.AT",       name: "Athens Intl Airport",             category: "blue-chip" },
  bela:      { yahoo: "BELA.AT",      name: "Jumbo S.A.",                      category: "blue-chip" },
  vio:       { yahoo: "VIO.AT",       name: "Viohalco",                        category: "blue-chip" },
  elpe:      { yahoo: "ELPE.AT",      name: "HELLENiQ Energy",                category: "blue-chip" },

  // ── Dividend / REITs / Utilities ────────────────────────────────────────
  credia:    { yahoo: "CREDIA.AT",    name: "CrediaBank",                     category: "dividend" },
  prodea:    { yahoo: "PRODEA.AT",    name: "Prodea REIC",                    category: "dividend" },
  kare:      { yahoo: "KARE.AT",      name: "Karelia Tobacco",                category: "dividend" },
  ppa:       { yahoo: "PPA.AT",       name: "Piraeus Port Authority",         category: "dividend" },
  eydap:     { yahoo: "EYDAP.AT",     name: "Athens Water (EYDAP)",           category: "dividend" },
  kri:       { yahoo: "KRI.AT",       name: "Kri-Kri Milk Industry",          category: "dividend" },
  admie:     { yahoo: "ADMIE.AT",     name: "ADMIE Holdings",                 category: "dividend" },
  noval:     { yahoo: "NOVAL.AT",     name: "Noval Property REIC",            category: "dividend" },
  trastor:   { yahoo: "TRASTOR.AT",   name: "Trastor REIC",                   category: "dividend" },
  briq:      { yahoo: "BRIQ.AT",      name: "BriQ Properties REIC",           category: "dividend" },
  premia:    { yahoo: "PREMIA.AT",    name: "Premia REIC",                    category: "dividend" },
  orilina:   { yahoo: "ORILINA.AT",   name: "Orilina Properties REIC",        category: "dividend" },
  blekedros: { yahoo: "BLEKEDROS.AT", name: "Ble Kedros REIC",                category: "dividend" },
  trestates: { yahoo: "TRESTATES.AT", name: "Trade Estates REIC",             category: "dividend" },
  eyaps:     { yahoo: "EYAPS.AT",     name: "Thessaloniki Water (EYATH)",     category: "dividend" },

  // ── Growth / Mid-Cap / Small-Cap ────────────────────────────────────────
  aktr:      { yahoo: "AKTR.AT",      name: "Aktor Holdings",                 category: "growth" },
  optima:    { yahoo: "OPTIMA.AT",    name: "Optima Bank",                    category: "growth" },
  bylot:     { yahoo: "BYLOT.AT",     name: "Intralot (Bally's)",             category: "growth" },
  elha:      { yahoo: "ELHA.AT",      name: "Elvalhalcor",                    category: "growth" },
  aegn:      { yahoo: "AEGN.AT",      name: "Aegean Airlines",                category: "growth" },
  lamda:     { yahoo: "LAMDA.AT",     name: "LAMDA Development",              category: "growth" },
  lamps:     { yahoo: "LAMPS.AT",     name: "Lampsa Hotels",                  category: "growth" },
  sar:       { yahoo: "SAR.AT",       name: "Sarantis Group",                 category: "growth" },
  quest:     { yahoo: "QUEST.AT",     name: "Quest Holdings",                 category: "growth" },
  otoel:     { yahoo: "OTOEL.AT",     name: "Autohellas",                     category: "growth" },
  avax:      { yahoo: "AVAX.AT",      name: "Avax S.A.",                      category: "growth" },
  ellaktor:  { yahoo: "ELLAKTOR.AT",  name: "Ellaktor",                       category: "growth" },
  attica:    { yahoo: "ATTICA.AT",    name: "Attica Holdings",                category: "growth" },
  qlco:      { yahoo: "QLCO.AT",      name: "Qualco Group",                   category: "growth" },
  plakr:     { yahoo: "PLAKR.AT",     name: "Plastika Kritis",                category: "growth" },
  olth:      { yahoo: "OLTH.AT",      name: "Thessaloniki Port",              category: "growth" },
  aem:       { yahoo: "AEM.AT",       name: "Alter Ego Media",                category: "growth" },
  exae:      { yahoo: "EXAE.AT",      name: "Hellenic Exchanges (ATHEX)",     category: "growth" },
  intek:     { yahoo: "INTEK.AT",     name: "Ideal Holdings",                 category: "growth" },
  tell:      { yahoo: "TELL.AT",      name: "Bank of Greece",                 category: "growth" },
  evr:       { yahoo: "EVR.AT",       name: "Evropi Holdings",                category: "growth" },
  intrk:     { yahoo: "INTRK.AT",     name: "Intracom Holdings",              category: "growth" },
  acag:      { yahoo: "ACAG.AT",      name: "Austriacard Holdings",           category: "growth" },
  dimand:    { yahoo: "DIMAND.AT",    name: "Dimand S.A.",                    category: "growth" },
  lavi:      { yahoo: "LAVI.AT",      name: "Lavipharm",                      category: "growth" },
  foyrk:     { yahoo: "FOYRK.AT",     name: "Fourlis Holdings",               category: "growth" },
  prof:      { yahoo: "PROF.AT",      name: "Profile Systems",                category: "growth" },
  almy:      { yahoo: "ALMY.AT",      name: "Alumil Aluminium",               category: "growth" },
  plat:      { yahoo: "PLAT.AT",      name: "Thrace Plastics",                category: "growth" },
  iatr:      { yahoo: "IATR.AT",      name: "Athens Medical Centre",          category: "growth" },
  fais:      { yahoo: "FAIS.AT",      name: "Fais Holding",                   category: "growth" },
  merko:     { yahoo: "MERKO.AT",     name: "Mermeren Kombinat",              category: "growth" },
  realcons:  { yahoo: "REALCONS.AT",  name: "Real Consulting",                category: "growth" },
  cairomez:  { yahoo: "CAIROMEZ.AT",  name: "Cairo Mezz",                     category: "growth" },
  mig:       { yahoo: "MIG.AT",       name: "MIG Holdings",                   category: "growth" },
  inlif:     { yahoo: "INLIF.AT",     name: "Interlife Insurance",            category: "growth" },
  perf:      { yahoo: "PERF.AT",      name: "Performance Technologies",       category: "growth" },
  onyx:      { yahoo: "ONYX.AT",      name: "Onyx Touristiki",                category: "growth" },
  ekter:     { yahoo: "EKTER.AT",     name: "Ekter S.A.",                     category: "growth" },
  moda:      { yahoo: "MODA.AT",      name: "Moda Bagno",                     category: "growth" },
  astak:     { yahoo: "ASTAK.AT",     name: "Alpha Real Estate",              category: "growth" },
  meva:      { yahoo: "MEVA.AT",      name: "Mevaco",                         category: "growth" },
  pap:       { yahoo: "PAP.AT",       name: "Papoutsanis",                    category: "growth" },
  olymp:     { yahoo: "OLYMP.AT",     name: "Technical Olympic",              category: "growth" },
  flexo:     { yahoo: "FLEXO.AT",     name: "Flexopack",                      category: "growth" },
  daios:     { yahoo: "DAIOS.AT",     name: "Daios Plastics",                 category: "growth" },
  dotsoft:   { yahoo: "DOTSOFT.AT",   name: "Dotsoft",                        category: "growth" },
  ave:       { yahoo: "AVE.AT",       name: "AVE S.A.",                       category: "growth" },
  pvmezz:    { yahoo: "PVMEZZ.AT",   name: "Phoenix Vega Mezz",              category: "growth" },
  moto:      { yahoo: "MOTO.AT",      name: "Motodynamics",                   category: "growth" },
  ex:        { yahoo: "EX.AT",        name: "Euroxx Securities",              category: "growth" },
  ilyda:     { yahoo: "ILYDA.AT",     name: "Ilyda S.A.",                     category: "growth" },
  kylo:      { yahoo: "KYLO.AT",      name: "Loulis Food Ingredients",        category: "growth" },
  gebka:     { yahoo: "GEBKA.AT",     name: "General Commercial & Industrial",category: "growth" },
  elton:     { yahoo: "ELTON.AT",     name: "Elton International Trading",    category: "growth" },
  petro:     { yahoo: "PETRO.AT",     name: "Petros Petropoulos",             category: "growth" },
  elin:      { yahoo: "ELIN.AT",      name: "Elinoil Hellenic Petroleum",     category: "growth" },
  evrof:     { yahoo: "EVROF.AT",     name: "Evrofarma",                      category: "growth" },
  asco:      { yahoo: "ASCO.AT",      name: "AS Company",                     category: "growth" },
  frigo:     { yahoo: "FRIGO.AT",     name: "Frigoglass",                     category: "growth" },
  space:     { yahoo: "SPACE.AT",     name: "Space Hellas",                   category: "growth" },
  qual:      { yahoo: "QUAL.AT",      name: "Quality & Reliability",          category: "growth" },
  iktin:     { yahoo: "IKTIN.AT",     name: "Iktinos Hellas",                 category: "growth" },
  elstr:     { yahoo: "ELSTR.AT",     name: "Elastron Steel",                 category: "growth" },
  biosk:     { yahoo: "BIOSK.AT",     name: "Unibios Holdings",               category: "growth" },
  bioka:     { yahoo: "BIOKA.AT",     name: "Biokarpet",                      category: "growth" },
  foodl:     { yahoo: "FOODL.AT",     name: "Foodlink",                       category: "growth" },
  atrust:    { yahoo: "ATRUST.AT",    name: "Alpha Trust Holdings",           category: "growth" },
  kekr:      { yahoo: "KEKR.AT",      name: "Kekrops",                        category: "growth" },
  gcmezz:    { yahoo: "GCMEZZ.AT",   name: "Galaxy Cosmos Mezz",             category: "growth" },
  centr:     { yahoo: "CENTR.AT",     name: "Centric Holdings",               category: "growth" },
  domik:     { yahoo: "DOMIK.AT",     name: "Domiki Kritis",                  category: "growth" },
  revoil:    { yahoo: "REVOIL.AT",    name: "Revoil",                         category: "growth" },
  sunmezz:   { yahoo: "SUNMEZZ.AT",  name: "SunriseMezz",                    category: "growth" },
  eis:       { yahoo: "EIS.AT",       name: "European Innovation Solutions",  category: "growth" },
  sidma:     { yahoo: "SIDMA.AT",     name: "Sidma Steel",                    category: "growth" },
  moyzk:     { yahoo: "MOYZK.AT",    name: "Mouzakis",                       category: "growth" },
  nakas:     { yahoo: "NAKAS.AT",     name: "Philippos Nakas",                category: "growth" },
  atek:      { yahoo: "ATEK.AT",      name: "Attica Publications",            category: "growth" },
  elbe:      { yahoo: "ELBE.AT",      name: "Elve S.A.",                      category: "growth" },
  nayp:      { yahoo: "NAYP.AT",      name: "Nafpaktos Textile",              category: "growth" },
  softweb:   { yahoo: "SOFTWEB.AT",   name: "SOFTWeb",                        category: "growth" },
  yknot:     { yahoo: "YKNOT.AT",     name: "Y/Knot Invest",                  category: "growth" },
  vosys:     { yahoo: "VOSYS.AT",     name: "Vogiatzoglou Systems",           category: "growth" },
  akrit:     { yahoo: "AKRIT.AT",     name: "Akritas",                        category: "growth" },
  drome:     { yahoo: "DROME.AT",     name: "Dromeas",                        category: "growth" },
  xylek:     { yahoo: "XYLEK.AT",     name: "Interwood-Xylemporia",           category: "growth" },
  medic:     { yahoo: "MEDIC.AT",     name: "Medicon Hellas",                 category: "growth" },
  intet:     { yahoo: "INTET.AT",     name: "Intertech",                      category: "growth" },
  varnh:     { yahoo: "VARNH.AT",     name: "Varvaressos Spinning Mills",     category: "growth" },
  cpi:       { yahoo: "CPI.AT",       name: "CPI Computer Peripherals",       category: "growth" },
  haide:     { yahoo: "HAIDE.AT",     name: "Haidemenos Printing",            category: "growth" },
  aaak:      { yahoo: "AAAK.AT",      name: "Wool Industry Tria Alfa",        category: "growth" },
  kysa:      { yahoo: "KYSA.AT",      name: "Flour Mills Sarantopoulos",      category: "growth" },
  profk:     { yahoo: "PROFK.AT",     name: "Pipe Works Girakian",            category: "growth" },
  cnlcap:    { yahoo: "CNLCAP.AT",    name: "CNL Capital AIFM",              category: "growth" },
  min:       { yahoo: "MIN.AT",       name: "Minerva (Ladenis Bros)",         category: "growth" },
  spir:      { yahoo: "SPIR.AT",      name: "House of Agriculture Spirou",    category: "growth" },
  biot:      { yahoo: "BIOT.AT",      name: "Bioter",                         category: "growth" },
  lebek:     { yahoo: "LEBEK.AT",     name: "N. Leventeris (Common)",         category: "growth" },
  lebep:     { yahoo: "LEBEP.AT",     name: "N. Leventeris (Preferred)",      category: "growth" },
  yalco:     { yahoo: "YALCO.AT",     name: "YALCO",                          category: "growth" },
};

// ─── Types ──────────────────────────────────────────────────────────────────
export interface StockQuote {
  id: string;
  ticker: string;
  yahooSymbol: string;
  name: string;
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  dayHigh: number;
  dayLow: number;
  volume: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  marketCap: string;
  currency: string;
  exchange: string;
  category: "blue-chip" | "growth" | "dividend";
  sparkline: number[];
  lastUpdated: number;
}

export interface ChartDataPoint {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ChartResponse {
  symbol: string;
  interval: string;
  range: string;
  data: ChartDataPoint[];
  meta: {
    currency: string;
    exchange: string;
    regularMarketPrice: number;
  };
}

// ─── Cache ──────────────────────────────────────────────────────────────────
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const quoteCache = new Map<string, CacheEntry<StockQuote>>();
const chartCache = new Map<string, CacheEntry<ChartResponse>>();

// Cache TTLs in milliseconds
const QUOTE_CACHE_TTL = 60_000;       // 1 minute for quotes
const CHART_CACHE_TTL_1D = 60_000;    // 1 minute for intraday
const CHART_CACHE_TTL_OTHER = 300_000; // 5 minutes for longer ranges

// Concurrency limiter to avoid overwhelming the API
const MAX_CONCURRENT = 10;

function isCacheValid<T>(entry: CacheEntry<T> | undefined, ttl: number): entry is CacheEntry<T> {
  if (!entry) return false;
  return Date.now() - entry.timestamp < ttl;
}

// ─── Format Helpers ─────────────────────────────────────────────────────────
function formatMarketCap(value: number | undefined): string {
  if (!value) return "N/A";
  if (value >= 1e9) return `€${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `€${(value / 1e6).toFixed(0)}M`;
  return `€${value.toLocaleString()}`;
}

function mapIntervalToYahoo(interval: string): string {
  const mapping: Record<string, string> = {
    "1D": "5m",
    "1W": "15m",
    "1M": "1d",
    "3M": "1d",
    "1Y": "1wk",
    "ALL": "1mo",
  };
  return mapping[interval] || "1d";
}

function mapRangeToYahoo(range: string): string {
  const mapping: Record<string, string> = {
    "1D": "1d",
    "1W": "5d",
    "1M": "1mo",
    "3M": "3mo",
    "1Y": "1y",
    "ALL": "5y",
  };
  return mapping[range] || "1mo";
}

// ─── Concurrency Helper ────────────────────────────────────────────────────
async function runWithConcurrency<T>(
  tasks: (() => Promise<T>)[],
  limit: number,
): Promise<PromiseSettledResult<T>[]> {
  const results: PromiseSettledResult<T>[] = [];
  let index = 0;

  async function worker() {
    while (index < tasks.length) {
      const i = index++;
      try {
        const value = await tasks[i]();
        results[i] = { status: "fulfilled", value };
      } catch (reason: any) {
        results[i] = { status: "rejected", reason };
      }
    }
  }

  const workers = Array.from({ length: Math.min(limit, tasks.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

// ─── API Functions ──────────────────────────────────────────────────────────

/**
 * Fetch a single stock quote with sparkline data
 */
export async function getStockQuote(stockId: string): Promise<StockQuote | null> {
  const symbolInfo = ATHEX_SYMBOLS[stockId];
  if (!symbolInfo) return null;

  // Check cache
  const cached = quoteCache.get(stockId);
  if (isCacheValid(cached, QUOTE_CACHE_TTL)) {
    return cached.data;
  }

  try {
    const response = await callDataApi("YahooFinance/get_stock_chart", {
      query: {
        symbol: symbolInfo.yahoo,
        interval: "5m",
        range: "1d",
      },
    }) as any;

    if (!response?.chart?.result?.[0]) return null;

    const result = response.chart.result[0];
    const meta = result.meta;
    const quotes = result.indicators?.quote?.[0] || {};
    const closePrices = (quotes.close || []).filter((p: number | null) => p !== null);

    const price = meta.regularMarketPrice ?? closePrices[closePrices.length - 1] ?? 0;
    const previousClose = meta.chartPreviousClose ?? meta.previousClose ?? price;
    const change = price - previousClose;
    const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

    // Build sparkline from intraday close prices (sample every ~6 points for ~14 data points)
    const step = Math.max(1, Math.floor(closePrices.length / 14));
    const sparkline = closePrices.filter((_: number, i: number) => i % step === 0 || i === closePrices.length - 1);

    const quote: StockQuote = {
      id: stockId,
      ticker: symbolInfo.yahoo.replace(".AT", ""),
      yahooSymbol: symbolInfo.yahoo,
      name: meta.longName || meta.shortName || symbolInfo.name,
      price,
      previousClose,
      change,
      changePercent,
      dayHigh: meta.regularMarketDayHigh ?? Math.max(...closePrices),
      dayLow: meta.regularMarketDayLow ?? Math.min(...closePrices),
      volume: meta.regularMarketVolume ?? 0,
      fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh ?? 0,
      fiftyTwoWeekLow: meta.fiftyTwoWeekLow ?? 0,
      marketCap: formatMarketCap(meta.marketCap),
      currency: meta.currency ?? "EUR",
      exchange: meta.exchangeName ?? "ATH",
      category: symbolInfo.category,
      sparkline,
      lastUpdated: Date.now(),
    };

    quoteCache.set(stockId, { data: quote, timestamp: Date.now() });
    return quote;
  } catch (error) {
    console.error(`[StockService] Failed to fetch quote for ${stockId}:`, error);
    // Return stale cache if available
    const staleQuote = quoteCache.get(stockId);
    if (staleQuote) return staleQuote.data;
    return null;
  }
}

/**
 * Fetch quotes for multiple stocks in parallel with concurrency limiting.
 * When fetching all stocks, prioritizes blue-chips first for faster initial render.
 */
export async function getMultipleQuotes(stockIds?: string[]): Promise<StockQuote[]> {
  const allIds = stockIds ?? Object.keys(ATHEX_SYMBOLS);
  
  // Sort: blue-chips first, then dividends, then growth — so the most important
  // stocks are fetched first and appear in the UI sooner
  const sortedIds = [...allIds].sort((a, b) => {
    const catOrder = { "blue-chip": 0, "dividend": 1, "growth": 2 };
    const catA = ATHEX_SYMBOLS[a]?.category ?? "growth";
    const catB = ATHEX_SYMBOLS[b]?.category ?? "growth";
    return (catOrder[catA] ?? 2) - (catOrder[catB] ?? 2);
  });

  const tasks = sortedIds.map((id) => () => getStockQuote(id));
  const results = await runWithConcurrency(tasks, MAX_CONCURRENT);

  return results
    .filter((r): r is PromiseFulfilledResult<StockQuote | null> => r.status === "fulfilled")
    .map((r) => r.value)
    .filter((q): q is StockQuote => q !== null);
}

/**
 * Fetch chart data for a specific stock and time range
 */
export async function getStockChart(
  stockId: string,
  range: string = "1M",
): Promise<ChartResponse | null> {
  const symbolInfo = ATHEX_SYMBOLS[stockId];
  if (!symbolInfo) return null;

  const interval = mapIntervalToYahoo(range);
  const yahooRange = mapRangeToYahoo(range);
  const cacheKey = `${stockId}:${range}`;

  // Check cache
  const ttl = range === "1D" ? CHART_CACHE_TTL_1D : CHART_CACHE_TTL_OTHER;
  const cached = chartCache.get(cacheKey);
  if (isCacheValid(cached, ttl)) {
    return cached.data;
  }

  try {
    const response = await callDataApi("YahooFinance/get_stock_chart", {
      query: {
        symbol: symbolInfo.yahoo,
        interval,
        range: yahooRange,
      },
    }) as any;

    if (!response?.chart?.result?.[0]) return null;

    const result = response.chart.result[0];
    const meta = result.meta;
    const timestamps = result.timestamp || [];
    const quotes = result.indicators?.quote?.[0] || {};

    const data: ChartDataPoint[] = timestamps.map((ts: number, i: number) => ({
      timestamp: ts,
      open: quotes.open?.[i] ?? 0,
      high: quotes.high?.[i] ?? 0,
      low: quotes.low?.[i] ?? 0,
      close: quotes.close?.[i] ?? 0,
      volume: quotes.volume?.[i] ?? 0,
    })).filter((d: ChartDataPoint) => d.close > 0);

    const chartResponse: ChartResponse = {
      symbol: symbolInfo.yahoo,
      interval,
      range: yahooRange,
      data,
      meta: {
        currency: meta.currency ?? "EUR",
        exchange: meta.exchangeName ?? "ATH",
        regularMarketPrice: meta.regularMarketPrice ?? 0,
      },
    };

    chartCache.set(cacheKey, { data: chartResponse, timestamp: Date.now() });
    return chartResponse;
  } catch (error) {
    console.error(`[StockService] Failed to fetch chart for ${stockId}:`, error);
    const staleChart = chartCache.get(cacheKey);
    if (staleChart) return staleChart.data;
    return null;
  }
}

/**
 * Get all available stock IDs
 */
export function getAvailableStocks(): string[] {
  return Object.keys(ATHEX_SYMBOLS);
}

/**
 * Get stock count
 */
export function getStockCount(): number {
  return Object.keys(ATHEX_SYMBOLS).length;
}

/**
 * Clear all caches (useful for testing or forced refresh)
 */
export function clearCache(): void {
  quoteCache.clear();
  chartCache.clear();
}
