// AGRX Mock Data — Greek market assets, portfolio, social, gamification
// All data is deterministic and uses realistic ATHEX tickers and prices

export interface Asset {
  id: string;
  name: string;
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
  sparkline: number[];
  category: "blue-chip" | "growth" | "dividend" | "etf";
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

export const GREEK_STOCKS: Asset[] = [
  {
    id: "opap",
    name: "OPAP",
    ticker: "OPAP",
    price: 16.42,
    change: 0.68,
    changePercent: 4.32,
    sparkline: generateSparkline(15.74, 0.3),
    category: "blue-chip",
    marketCap: "€5.2B",
  },
  {
    id: "ote",
    name: "OTE Telecom",
    ticker: "HTO",
    price: 14.88,
    change: 0.22,
    changePercent: 1.50,
    sparkline: generateSparkline(14.66, 0.2),
    category: "blue-chip",
    marketCap: "€7.1B",
  },
  {
    id: "alpha",
    name: "Alpha Bank",
    ticker: "ALPHA",
    price: 1.92,
    change: 0.05,
    changePercent: 2.67,
    sparkline: generateSparkline(1.87, 0.04),
    category: "blue-chip",
    marketCap: "€4.5B",
  },
  {
    id: "eurobank",
    name: "Eurobank",
    ticker: "EUROB",
    price: 2.34,
    change: -0.03,
    changePercent: -1.27,
    sparkline: generateSparkline(2.37, 0.05),
    category: "blue-chip",
    marketCap: "€8.6B",
  },
  {
    id: "nbg",
    name: "National Bank",
    ticker: "ETE",
    price: 8.56,
    change: 0.32,
    changePercent: 3.88,
    sparkline: generateSparkline(8.24, 0.15),
    category: "blue-chip",
    marketCap: "€7.8B",
  },
  {
    id: "piraeus",
    name: "Piraeus Bank",
    ticker: "TPEIR",
    price: 4.18,
    change: -0.08,
    changePercent: -1.88,
    sparkline: generateSparkline(4.26, 0.08),
    category: "blue-chip",
    marketCap: "€5.4B",
  },
  {
    id: "motor-oil",
    name: "Motor Oil",
    ticker: "MOH",
    price: 22.60,
    change: 0.44,
    changePercent: 1.99,
    sparkline: generateSparkline(22.16, 0.4),
    category: "dividend",
    marketCap: "€2.5B",
  },
  {
    id: "mytilineos",
    name: "Mytilineos",
    ticker: "MYTIL",
    price: 38.92,
    change: 1.24,
    changePercent: 3.29,
    sparkline: generateSparkline(37.68, 0.7),
    category: "growth",
    marketCap: "€5.6B",
  },
  {
    id: "terna",
    name: "Terna Energy",
    ticker: "TENERGY",
    price: 19.74,
    change: -0.36,
    changePercent: -1.79,
    sparkline: generateSparkline(20.10, 0.35),
    category: "growth",
    marketCap: "€2.3B",
  },
  {
    id: "jumbo",
    name: "Jumbo",
    ticker: "BELA",
    price: 28.40,
    change: 0.56,
    changePercent: 2.01,
    sparkline: generateSparkline(27.84, 0.5),
    category: "dividend",
    marketCap: "€3.9B",
  },
  {
    id: "aegean",
    name: "Aegean Airlines",
    ticker: "AEGN",
    price: 12.30,
    change: 0.18,
    changePercent: 1.48,
    sparkline: generateSparkline(12.12, 0.25),
    category: "growth",
    marketCap: "€880M",
  },
  {
    id: "pp",
    name: "Public Power",
    ticker: "PPC",
    price: 11.86,
    change: -0.14,
    changePercent: -1.17,
    sparkline: generateSparkline(12.00, 0.2),
    category: "blue-chip",
    marketCap: "€4.4B",
  },
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
    asset: GREEK_STOCKS[0], // OPAP
    shares: 12,
    avgCost: 15.20,
    currentValue: 12 * 16.42,
    pnl: 12 * (16.42 - 15.20),
    pnlPercent: ((16.42 - 15.20) / 15.20) * 100,
  },
  {
    asset: GREEK_STOCKS[4], // National Bank
    shares: 25,
    avgCost: 7.80,
    currentValue: 25 * 8.56,
    pnl: 25 * (8.56 - 7.80),
    pnlPercent: ((8.56 - 7.80) / 7.80) * 100,
  },
  {
    asset: GREEK_STOCKS[7], // Mytilineos
    shares: 5,
    avgCost: 36.50,
    currentValue: 5 * 38.92,
    pnl: 5 * (38.92 - 36.50),
    pnlPercent: ((38.92 - 36.50) / 36.50) * 100,
  },
  {
    asset: GREEK_STOCKS[3], // Eurobank
    shares: 100,
    avgCost: 2.45,
    currentValue: 100 * 2.34,
    pnl: 100 * (2.34 - 2.45),
    pnlPercent: ((2.34 - 2.45) / 2.45) * 100,
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
    content: "Just loaded up on $OPAP before earnings. The gaming revenue numbers are going to be insane this quarter 🎰",
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
    content: "Mytilineos breaking above the 200-day MA. $MYTIL has been my best performer this year. Target €45.",
    assetTag: "MYTIL",
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
