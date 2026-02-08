/**
 * ATHEX Sector Classifications
 *
 * Real sector assignments for all 135 ATHEX stocks based on
 * FTSE/ATHEX industry classifications and company business activities.
 */

export const SECTORS = [
  "Banking",
  "Energy",
  "Real Estate",
  "Telecom & Tech",
  "Construction",
  "Industrials",
  "Consumer",
  "Travel & Leisure",
  "Shipping",
  "Healthcare",
  "Utilities",
  "Financial Services",
  "Media",
  "Agriculture",
  "Diversified",
] as const;

export type Sector = (typeof SECTORS)[number];

/** Map from internal stock ID → sector */
export const SECTOR_MAP: Record<string, Sector> = {
  // ── Banking ──────────────────────────────────────────────────────────
  eurob: "Banking",
  ete: "Banking",
  tpeir: "Banking",
  alpha: "Banking",
  bochgr: "Banking",
  credia: "Banking",
  optima: "Banking",
  tell: "Banking",

  // ── Energy ───────────────────────────────────────────────────────────
  ppc: "Energy",
  mtln: "Energy",
  elpe: "Energy",
  moh: "Energy",
  admie: "Energy",
  elin: "Energy",
  revoil: "Energy",

  // ── Real Estate ──────────────────────────────────────────────────────
  lamda: "Real Estate",
  prodea: "Real Estate",
  noval: "Real Estate",
  trastor: "Real Estate",
  briq: "Real Estate",
  premia: "Real Estate",
  orilina: "Real Estate",
  blekedros: "Real Estate",
  trestates: "Real Estate",
  dimand: "Real Estate",
  astak: "Real Estate",
  kekr: "Real Estate",
  ilyda: "Real Estate",

  // ── Telecom & Tech ───────────────────────────────────────────────────
  hto: "Telecom & Tech",
  quest: "Telecom & Tech",
  prof: "Telecom & Tech",
  realcons: "Telecom & Tech",
  perf: "Telecom & Tech",
  space: "Telecom & Tech",
  qual: "Telecom & Tech",
  dotsoft: "Telecom & Tech",
  centr: "Telecom & Tech",
  softweb: "Telecom & Tech",
  intet: "Telecom & Tech",
  cpi: "Telecom & Tech",
  qlco: "Telecom & Tech",
  intek: "Telecom & Tech",

  // ── Construction & Infrastructure ────────────────────────────────────
  gekterna: "Construction",
  aktr: "Construction",
  avax: "Construction",
  ellaktor: "Construction",
  ekter: "Construction",
  domik: "Construction",
  titc: "Construction",
  iktin: "Construction",

  // ── Industrials & Materials ──────────────────────────────────────────
  cener: "Industrials",
  vio: "Industrials",
  elha: "Industrials",
  plakr: "Industrials",
  plat: "Industrials",
  almy: "Industrials",
  merko: "Industrials",
  flexo: "Industrials",
  daios: "Industrials",
  meva: "Industrials",
  elstr: "Industrials",
  sidma: "Industrials",
  akrit: "Industrials",
  drome: "Industrials",
  xylek: "Industrials",
  varnh: "Industrials",
  nayp: "Industrials",
  profk: "Industrials",
  frigo: "Industrials",
  acag: "Industrials",

  // ── Consumer & Retail ────────────────────────────────────────────────
  eee: "Consumer",
  bela: "Consumer",
  foyrk: "Consumer",
  sar: "Consumer",
  kri: "Consumer",
  pap: "Consumer",
  kylo: "Consumer",
  elton: "Consumer",
  petro: "Consumer",
  evrof: "Consumer",
  asco: "Consumer",
  foodl: "Consumer",
  gebka: "Consumer",
  kare: "Consumer",
  moda: "Consumer",
  moyzk: "Consumer",
  nakas: "Consumer",
  kysa: "Consumer",
  yalco: "Consumer",
  vosys: "Consumer",
  elbe: "Consumer",
  min: "Consumer",

  // ── Travel & Leisure ─────────────────────────────────────────────────
  opap: "Travel & Leisure",
  aegn: "Travel & Leisure",
  aia: "Travel & Leisure",
  lamps: "Travel & Leisure",
  bylot: "Travel & Leisure",
  onyx: "Travel & Leisure",
  otoel: "Travel & Leisure",

  // ── Shipping & Transport ─────────────────────────────────────────────
  attica: "Shipping",
  ppa: "Shipping",
  olth: "Shipping",
  moto: "Shipping",

  // ── Healthcare ───────────────────────────────────────────────────────
  iatr: "Healthcare",
  medic: "Healthcare",
  lavi: "Healthcare",
  biosk: "Healthcare",
  bioka: "Healthcare",
  biot: "Healthcare",

  // ── Utilities ────────────────────────────────────────────────────────
  eydap: "Utilities",
  eyaps: "Utilities",

  // ── Financial Services (non-bank) ────────────────────────────────────
  exae: "Financial Services",
  intrk: "Financial Services",
  ex: "Financial Services",
  atrust: "Financial Services",
  cnlcap: "Financial Services",
  cairomez: "Financial Services",
  pvmezz: "Financial Services",
  gcmezz: "Financial Services",
  sunmezz: "Financial Services",
  mig: "Financial Services",
  evr: "Financial Services",
  yknot: "Financial Services",
  inlif: "Financial Services",
  eis: "Financial Services",

  // ── Media & Publishing ───────────────────────────────────────────────
  aem: "Media",
  atek: "Media",
  haide: "Media",

  // ── Agriculture ──────────────────────────────────────────────────────
  spir: "Agriculture",
  fais: "Agriculture",
  aaak: "Agriculture",
  lebek: "Agriculture",
  lebep: "Agriculture",

  // ── Diversified ──────────────────────────────────────────────────────
  olymp: "Diversified",
  ave: "Diversified",
};

/** Sector icon mapping for UI display */
export const SECTOR_ICONS: Record<Sector, string> = {
  Banking: "🏦",
  Energy: "⚡",
  "Real Estate": "🏢",
  "Telecom & Tech": "📡",
  Construction: "🏗️",
  Industrials: "🏭",
  Consumer: "🛒",
  "Travel & Leisure": "✈️",
  Shipping: "🚢",
  Healthcare: "🏥",
  Utilities: "💧",
  "Financial Services": "📊",
  Media: "📰",
  Agriculture: "🌾",
  Diversified: "🔀",
};

/** Get the sector for a stock ID, defaulting to "Diversified" */
export function getSector(stockId: string): Sector {
  return SECTOR_MAP[stockId] ?? "Diversified";
}
