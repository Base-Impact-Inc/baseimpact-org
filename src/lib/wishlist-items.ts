// Curated Base Impact donation wish-list items.
// Source of truth: the parent task t_df341fa2 item doc (2026-11-20).
// Every Amazon link is a verified canonical /dp/ ASIN product page from that doc.
// No URL here is invented — the only unverified link on the site is the single
// Amazon Wish List placeholder on the /wishlist page itself.

export type Tier = "critical" | "high" | "nice-to-have";

export interface WishlistItem {
  id: number;
  /** The doc's category label (Douglas item / researched addition / transport). */
  category: string;
  item: string;
  asin: string;
  amazonUrl: string;
  /** Optional "or" alternative product — rarely populated on the card. */
  altItem?: string;
  altUrl?: string;
  tier: Tier;
  /** Starter packs needed (from the doc). */
  qty: number;
  /** Observed US Amazon price on 2026-11-20. */
  unitCost: number;
  /** Why this is needed, dignity-first, one line. */
  why: string;
  /** 'amazon' => buy this item on Amazon; 'bike' => used-bike donation / contact us. */
  ctaKind: "amazon" | "bike";
}

export const TIERS: Tier[] = ["critical", "high", "nice-to-have"];

export const TIER_LABELS: Record<Tier, string> = {
  critical: "Critical",
  high: "High",
  "nice-to-have": "Nice to have",
};

export const TIER_TINT: Record<Tier, string> = {
  critical: "rgba(220, 53, 69, 0.16)",
  high: "rgba(243, 112, 33, 0.14)",
  "nice-to-have": "rgba(138, 138, 142, 0.16)",
};

export const TIER_TEXT: Record<Tier, string> = {
  critical: "var(--color-on-critical)",
  high: "var(--color-on-high)",
  "nice-to-have": "var(--color-on-nice)",
};

export const ITEMS: WishlistItem[] = [
  // ── Douglas's named items (7) ─────────────────────────────────────────────
  {
    id: 1,
    category: "Douglas's named items",
    item: "Coleman Sundome 2-Person Dome Tent with Rainfly",
    asin: "B0D6FVR2BX",
    amazonUrl: "https://www.amazon.com/dp/B0D6FVR2BX",
    altItem: "Coleman Sundome 4-Person (more room for gear)",
    altUrl: "https://www.amazon.com/dp/B004J2KDH0",
    tier: "critical",
    qty: 10,
    unitCost: 65.99,
    why:
      "A fully enclosed, pitched-in-seconds shelter for neighbors who must sleep outside in Florida rain.",
    ctaKind: "amazon",
  },
  {
    id: 2,
    category: "Douglas's named items",
    item: "Bearhard 10x10 ft Waterproof Camping Tarp / Rain Fly",
    asin: "B07RW9CK59",
    amazonUrl: "https://www.amazon.com/dp/B07RW9CK59",
    altItem: "NoCry 10x10 Rain Fly (stakes + carabiners included)",
    altUrl: "https://www.amazon.com/dp/B0BN79L5BH",
    tier: "critical",
    qty: 15,
    unitCost: 33.97,
    why:
      "A 10x10 tarp gives a raised, dry bed and snug shelter where the ground floods after a storm.",
    ctaKind: "amazon",
  },
  {
    id: 3,
    category: "Douglas's named items",
    item: "ENO DoubleNest Camping Hammock (Navy)",
    asin: "B09KNX51D2",
    amazonUrl: "https://www.amazon.com/dp/B09KNX51D2",
    altItem: "FIRINER hammock with bug net + rain fly + straps",
    altUrl: "https://www.amazon.com/dp/B0998D7PXG",
    tier: "high",
    qty: 6,
    unitCost: 74.95,
    why:
      "A hammock needs a full system — net, fly and pad — or a bare swing leaves a sleeper cold and exposed.",
    ctaKind: "amazon",
  },
  {
    id: 4,
    category: "Douglas's named items",
    item: "SOTO Amicus Backpacking Stove with Igniter",
    asin: "B073YC1DWZ",
    amazonUrl: "https://www.amazon.com/dp/B073YC1DWZ",
    altItem: "SOTO Amicus stove + pot set",
    altUrl: "https://www.amazon.com/dp/B01GWVEX8K",
    tier: "high",
    qty: 6,
    unitCost: 64.95,
    why:
      "A pocket stove lets neighbors cook hot meals outdoors where a shelter's flame is banned.",
    ctaKind: "amazon",
  },
  {
    id: 5,
    category: "Douglas's named items",
    item: "BIC Mini Pocket Lighters, 50-Count Tray",
    asin: "B00711YQN8",
    amazonUrl: "https://www.amazon.com/dp/B00711YQN8",
    altItem: "BIC Classic 50-count tray",
    altUrl: "https://www.amazon.com/dp/B07FM9D4CJ",
    tier: "high",
    qty: 2,
    unitCost: 45.72,
    why:
      "A child-resistant, wind-wise lighter is a reliable spark for a winter day in the open.",
    ctaKind: "amazon",
  },
  {
    id: 6,
    category: "Douglas's named items",
    item: "Osprey Daylite Plus Commuter Backpack (Black)",
    asin: "B08LP1WWPT",
    amazonUrl: "https://www.amazon.com/dp/B08LP1WWPT",
    altItem: "Osprey Daylite Plus (Grey)",
    altUrl: "https://www.amazon.com/dp/B0DSQM6PZH",
    tier: "critical",
    qty: 10,
    unitCost: 64.25,
    why:
      "A light, 20L pack for carrying everything they own — the right size stops injury and theft.",
    ctaKind: "amazon",
  },
  {
    id: 7,
    category: "Douglas's named items",
    item: "ThruNite Archer 2A V3 AA Flashlight",
    asin: "B08H1NTK82",
    amazonUrl: "https://www.amazon.com/dp/B08H1NTK82",
    altItem: "Fenix PD36R V2.0 (rechargeable premium)",
    altUrl: "https://www.amazon.com/dp/B0H73HZH2Y",
    tier: "critical",
    qty: 20,
    unitCost: 22.95,
    why:
      "A tough, water-safe light with replaceable AA batteries that keeps working when there is no charging.",
    ctaKind: "amazon",
  },
  // ── Researched additions (17) ─────────────────────────────────────────────
  {
    id: 8,
    category: "Researched additions",
    item: "TETON Sports Celsius XL 0°F Sleeping Bag",
    asin: "B006J7ZLPC",
    amazonUrl: "https://www.amazon.com/dp/B006J7ZLPC",
    altItem: "TETON Celsius Regular (lighter, more portable)",
    altUrl: "https://www.amazon.com/dp/B0D892GGMP",
    tier: "high",
    qty: 8,
    unitCost: 94.99,
    why:
      "A synthetic-fill bag rated 0°F keeps a sleeper warm even when Brevard rain wets everything.",
    ctaKind: "amazon",
  },
  {
    id: 9,
    category: "Researched additions",
    item: "Klymit Insulated Static V Inflatable Sleeping Pad",
    asin: "B07YP8MLNN",
    amazonUrl: "https://www.amazon.com/dp/B07YP8MLNN",
    altItem: "Klymit Static V Base (budget)",
    altUrl: "https://www.amazon.com/dp/B0HBZ4YCTK",
    tier: "high",
    qty: 8,
    unitCost: 83.59,
    why:
      "An insulated pad works as hard as the bag — it is the ground insulation that stops heat loss.",
    ctaKind: "amazon",
  },
  {
    id: 10,
    category: "Researched additions",
    item: "Mylar Emergency Blankets, 50-Pack",
    asin: "B0CS6YNG94",
    amazonUrl: "https://www.amazon.com/dp/B0CS6YNG94",
    altItem: "Altland 50-pack (marketed for homeless care packages)",
    altUrl: "https://www.amazon.com/dp/B0BDKX97HM",
    tier: "critical",
    qty: 2,
    unitCost: 28.49,
    why:
      "An ultra-cheap, individually sealed blanket that reflects body heat in a cold snap.",
    ctaKind: "amazon",
  },
  {
    id: 11,
    category: "Researched additions",
    item: "Energizer MAX AA Batteries, 24-Count",
    asin: "B004U429AQ",
    amazonUrl: "https://www.amazon.com/dp/B004U429AQ",
    altItem: "Energizer Ultimate Lithium AA, 24-count",
    altUrl: "https://www.amazon.com/dp/B01C4PP8FK",
    tier: "critical",
    qty: 10,
    unitCost: 17.96,
    why:
      "Alkaline AA at ~$0.75 each is the cheapest way to keep donated lights running.",
    ctaKind: "amazon",
  },
  {
    id: 12,
    category: "Researched additions",
    item: "Sawyer SP128 MINI Water Filtration System",
    asin: "B00FA2RLX2",
    amazonUrl: "https://www.amazon.com/dp/B00FA2RLX2",
    altItem: "LifeStraw-style personal filter (alternative)",
    altUrl: "https://www.amazon.com/dp/B000FAGUKO",
    tier: "critical",
    qty: 10,
    unitCost: 28.99,
    why:
      "A 0.1-micron personal filter removes bacteria and protozoa — ideal when tap water is unavailable.",
    ctaKind: "amazon",
  },
  {
    id: 13,
    category: "Researched additions",
    item: "Nalgene 32 oz Wide-Mouth Water Bottle",
    asin: "B0DDV12ZMJ",
    amazonUrl: "https://www.amazon.com/dp/B0DDV12ZMJ",
    altItem: "Nalgene Sustain 32 oz (Smoke Grey)",
    altUrl: "https://www.amazon.com/dp/B08XWNR6H9",
    tier: "critical",
    qty: 20,
    unitCost: 16.25,
    why:
      "A nearly unbreakable bottle ends the daily cost and hassle of bottled water.",
    ctaKind: "amazon",
  },
  {
    id: 14,
    category: "Researched additions",
    item: "FROGG TOGGS Ultra-Lite2 Waterproof Poncho",
    asin: "B007X5Z67W",
    amazonUrl: "https://www.amazon.com/dp/B007X5Z67W",
    altItem: "FROGG TOGGS Ultra-Lite emergency poncho",
    altUrl: "https://www.amazon.com/dp/B007SE13SE",
    tier: "critical",
    qty: 20,
    unitCost: 21.99,
    why:
      "A reusable, breathable poncho keeps gear and skin dry through Brevard's daily summer rain.",
    ctaKind: "amazon",
  },
  {
    id: 15,
    category: "Researched additions",
    item: "Thermacell ZoneGuard Backpacker Mosquito Repeller",
    asin: "B077ZMVMGD",
    amazonUrl: "https://www.amazon.com/dp/B077ZMVMGD",
    altItem: "Thermacell Patio Shield (lower cost)",
    altUrl: "https://www.amazon.com/dp/B075SBMTQL",
    tier: "high",
    qty: 6,
    unitCost: 40.98,
    why:
      "A mosquito-free zone lets a neighbor rest through Florida's year-round bugs without spray on skin.",
    ctaKind: "amazon",
  },
  {
    id: 16,
    category: "Researched additions",
    item: "Equip Outdoors No-See-Um Hammock Mosquito Net",
    asin: "B076M92NDC",
    amazonUrl: "https://www.amazon.com/dp/B076M92NDC",
    altItem: "Hammock Bliss reversible bug-net hammock",
    altUrl: "https://www.amazon.com/dp/B002COCF3M",
    tier: "high",
    qty: 6,
    unitCost: 22.0,
    why:
      "A full mesh net keeps awake-carrying insects off a sleeper's face all night.",
    ctaKind: "amazon",
  },
  {
    id: 17,
    category: "Researched additions",
    item: "Sawyer SP657 Premium Permethrin, 24 oz",
    asin: "B001ANQVYU",
    amazonUrl: "https://www.amazon.com/dp/B001ANQVYU",
    altItem: "Sawyer permethrin 6-pack trigger spray",
    altUrl: "https://www.amazon.com/dp/B08HJTXGS3",
    tier: "high",
    qty: 6,
    unitCost: 17.55,
    why:
      "Treating clothing and gear with permethrin beats repellent — it lasts through several washes.",
    ctaKind: "amazon",
  },
  {
    id: 18,
    category: "Researched additions",
    item: "Dickies Dri-Tech Moisture-Control Crew Socks, 6 Pairs",
    asin: "B07FK82PBS",
    amazonUrl: "https://www.amazon.com/dp/B07FK82PBS",
    altItem: "Darn Tough Merino Hiker Micro Crew (lifetime guarantee)",
    altUrl: "https://www.amazon.com/dp/B074ZGVXVK",
    tier: "high",
    qty: 20,
    unitCost: 15.0,
    why:
      "Moisture-wicking socks are the highest-turnover item in outreach — you cannot change what you do not have.",
    ctaKind: "amazon",
  },
  {
    id: 19,
    category: "Researched additions",
    item: "Adventure Medical Kits Ultralight/Watertight .5",
    asin: "B0DV6PDY9R",
    amazonUrl: "https://www.amazon.com/dp/B0DV6PDY9R",
    altItem: "Adventure Medical .7 (3-person)",
    altUrl: "https://www.amazon.com/dp/B0DV6NTJBK",
    tier: "critical",
    qty: 10,
    unitCost: 31.95,
    why:
      "A waterproof kit with bandages and blister care for the cuts and blisters that happen outdoors.",
    ctaKind: "amazon",
  },
  {
    id: 20,
    category: "Researched additions",
    item: "FIRINER Hammock with Bug Net + Rain Fly + Straps",
    asin: "B0998D7PXG",
    amazonUrl: "https://www.amazon.com/dp/B0998D7PXG",
    altItem: "ANDVANA hammock with mosquito net",
    altUrl: "https://www.amazon.com/dp/B0GL18H87K",
    tier: "nice-to-have",
    qty: 4,
    unitCost: 46.99,
    why:
      "An all-in-one hammock system with net and fly means no missing component.",
    ctaKind: "amazon",
  },
  {
    id: 21,
    category: "Researched additions",
    item: "Fenix PD36R V2.0 USB-C Rechargeable Flashlight",
    asin: "B0H73HZH2Y",
    amazonUrl: "https://www.amazon.com/dp/B0H73HZH2Y",
    altItem: "Fenix PD35R (lower-cost rechargeable)",
    altUrl: "https://www.amazon.com/dp/B07TJ9PYB8",
    tier: "nice-to-have",
    qty: 4,
    unitCost: 99.95,
    why:
      "A high-lumen, USB-C rechargeable light is for outreach volunteers who need a serious light.",
    ctaKind: "amazon",
  },
  {
    id: 22,
    category: "Researched additions",
    item: "Energizer Ultimate Lithium AA Batteries, 24-Count",
    asin: "B01C4PP8FK",
    amazonUrl: "https://www.amazon.com/dp/B01C4PP8FK",
    altItem: "Energizer MAX AA (budget alkaline)",
    altUrl: "https://www.amazon.com/dp/B004U429AQ",
    tier: "nice-to-have",
    qty: 6,
    unitCost: 46.35,
    why:
      "Lightweight, leak-proof lithium cells handle the cold and keep the AA lights running.",
    ctaKind: "amazon",
  },
  {
    id: 23,
    category: "Researched additions",
    item: "49800mAh Solar Power Bank with USB Charging",
    asin: "B0FSS56BYQ",
    amazonUrl: "https://www.amazon.com/dp/B0FSS56BYQ",
    tier: "nice-to-have",
    qty: 6,
    unitCost: 39.99,
    why:
      "A chargeable power bank keeps a phone alive for benefits appointments and job searches.",
    ctaKind: "amazon",
  },
  {
    id: 24,
    category: "Researched additions",
    item: "Darn Tough Merino Hiker Micro Crew Sock",
    asin: "B074ZGVXVK",
    amazonUrl: "https://www.amazon.com/dp/B074ZGVXVK",
    altItem: "Dickies Dri-Tech 6-pair multipack (budget)",
    altUrl: "https://www.amazon.com/dp/B07FK82PBS",
    tier: "nice-to-have",
    qty: 10,
    unitCost: 25.95,
    why:
      "A seamless merino sock resists blisters and stays warm when damp — a small luxury for walkers.",
    ctaKind: "amazon",
  },
  // ── Bicycles + bike locks (transport) (7) ────────────────────────────────
  {
    id: 25,
    category: "Bicycles + bike locks (transport)",
    item: "Huffy Stone Mountain 26\" Adult Bike (21-Speed)",
    asin: "B0CCSM7VNF",
    amazonUrl: "https://www.amazon.com/dp/B0CCSM7VNF",
    altItem: "Huffy Stone Mountain Amazon Resale (serviced used)",
    altUrl: "https://www.amazon.com/dp/B0CCSM7VNF",
    tier: "high",
    qty: 6,
    unitCost: 259.99,
    why:
      "A durable, common-parts bike is often the difference between keeping a job and losing it.",
    ctaKind: "bike",
  },
  {
    id: 26,
    category: "Bicycles + bike locks (transport)",
    item: "ROCKBROS SKN 20\" Folding Bike with Rear Rack",
    asin: "B0HN1LNB41",
    amazonUrl: "https://www.amazon.com/dp/B0HN1LNB41",
    altItem: "LIAPDG 20-inch folding bike (budget)",
    altUrl: "https://www.amazon.com/dp/B0DDKLHV56",
    tier: "nice-to-have",
    qty: 2,
    unitCost: 349.99,
    why:
      "A foldable bike is the answer for a neighbor with no secure storage or who must carry it inside.",
    ctaKind: "bike",
  },
  {
    id: 27,
    category: "Bicycles + bike locks (transport)",
    item: "MarKnig Adult Tricycle, 24-inch, Large Basket (7-speed / 1-speed variants)",
    asin: "B0D1VKFC5Z",
    amazonUrl: "https://www.amazon.com/dp/B0D1VKFC5Z",
    altItem: "MOPHOTO folding adult tricycle (budget)",
    altUrl: "https://www.amazon.com/dp/B0GS2BVM9P",
    tier: "nice-to-have",
    qty: 2,
    unitCost: 219.98,
    why:
      "Three wheels and a low step-through make a bike that fits a rider with balance or mobility limits.",
    ctaKind: "bike",
  },
  {
    id: 28,
    category: "Bicycles + bike locks (transport)",
    item: "Kryptonite Evolution Mini-5 U-Lock, 13mm",
    asin: "B06XCTDYS6",
    amazonUrl: "https://www.amazon.com/dp/B06XCTDYS6",
    altItem: "Kryptonite Evolution Mini-7 + 4 ft cable",
    altUrl: "https://www.amazon.com/dp/B06XZT8KZ1",
    tier: "critical",
    qty: 12,
    unitCost: 80.47,
    why:
      "A hardened U-lock actually deters theft — a cheap cable lock is cut in seconds.",
    ctaKind: "bike",
  },
  {
    id: 29,
    category: "Bicycles + bike locks (transport)",
    item: "Bell Soquel Adult Bike Helmet",
    asin: "B078HZJFWD",
    amazonUrl: "https://www.amazon.com/dp/B078HZJFWD",
    altItem: "Bell Reflex adult helmet (budget)",
    altUrl: "https://www.amazon.com/dp/B00TS3FWR6",
    tier: "critical",
    qty: 15,
    unitCost: 29.99,
    why:
      "A correctly fitted, CPSC-compliant helmet is the one safety piece that must never be reused after a crash.",
    ctaKind: "bike",
  },
  {
    id: 30,
    category: "Bicycles + bike locks (transport)",
    item: "Ascher USB Rechargeable Bike Light Set (Front + Rear)",
    asin: "B07FC9NRRR",
    amazonUrl: "https://www.amazon.com/dp/B07FC9NRRR",
    altItem: "Ascher front/rear + 2 taillights bundle",
    altUrl: "https://www.amazon.com/dp/B0GXFM122X",
    tier: "critical",
    qty: 20,
    unitCost: 14.53,
    why:
      "Front and rear lights make a cyclist visible from a distance on Florida's dark, wet roads.",
    ctaKind: "bike",
  },
  {
    id: 31,
    category: "Bicycles + bike locks (transport)",
    item: "Mobi Lock 24-Piece Bicycle Tire Patch / Repair Kit",
    asin: "B0C5TJ3TQ8",
    amazonUrl: "https://www.amazon.com/dp/B0C5TJ3TQ8",
    altItem: "Bike repair kit with mini pump + 16-in-1 tool",
    altUrl: "https://www.amazon.com/dp/B0CC8598DV",
    tier: "high",
    qty: 20,
    unitCost: 7.99,
    why:
      "A compact patch kit turns a flat tire into a ten-minute fix on the way to a job or shelter.",
    ctaKind: "amazon",
  },
];
