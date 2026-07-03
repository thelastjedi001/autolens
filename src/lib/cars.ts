// AutoLens trusted-car data + finance helpers.
// 15 models, 3 generations each. Edit prices, ratings, and copy here.

export type Ratings = { Reliability: number; Value: number; Comfort: number; Drive: number }
export type CarStyle = 'daily' | 'enthusiast' | 'family' | 'luxury'

export type Car = {
  id: string
  name: string          // Make & Model
  years: string         // Year & Gen
  body: string          // Category tag
  price: number         // Est. used price (USD)
  tags: CarStyle[]      // drives the budget matcher
  verdict: string       // The Verdict (short, punchy)
  mechanicsTake: string // The Mechanic's Take (detailed)
  ratings: Ratings
  image?: string        // optional real photo URL; falls back to a silhouette
}

const base: Car[] = [
  { id: 'corolla10', name: 'Toyota Corolla', years: '2010 · 10th gen', body: 'Compact sedan', price: 8500, tags: ['daily'],
    verdict: 'Boring in the best possible way. It just keeps going.',
    mechanicsTake: 'The used car cliche, for good reason. The 1.8L is close to unkillable and any mechanic can fix it blindfolded.',
    ratings: { Reliability: 4.9, Value: 4.7, Comfort: 3.5, Drive: 3.1 } },
  { id: 'corolla17', name: 'Toyota Corolla', years: '2017 · 11th gen', body: 'Compact sedan', price: 15000, tags: ['daily'],
    verdict: 'The safe choice, now with legroom.',
    mechanicsTake: 'Bigger and quieter than the car it replaced, with a roomier back seat. Same unkillable reputation, slightly more grown up.',
    ratings: { Reliability: 4.8, Value: 4.6, Comfort: 3.8, Drive: 3.3 } },
  { id: 'corolla22', name: 'Toyota Corolla', years: '2022 · 12th gen', body: 'Compact sedan', price: 21000, tags: ['daily'],
    verdict: 'First Corolla that is not just sensible.',
    mechanicsTake: 'The 12th gen finally drives with some interest, rides better, and adds standard safety tech. The hybrid barely sips fuel.',
    ratings: { Reliability: 4.8, Value: 4.4, Comfort: 4.0, Drive: 3.7 } },

  { id: 'camry09', name: 'Toyota Camry', years: '2009 · 6th gen', body: 'Midsize sedan', price: 8500, tags: ['daily'],
    verdict: 'Runs forever, asks for nothing.',
    mechanicsTake: 'Old-school Camry: soft, quiet, and near indestructible. The 2GR V6 is a genuine gem that also tunes well.',
    ratings: { Reliability: 4.7, Value: 4.6, Comfort: 4.0, Drive: 3.2 } },
  { id: 'camry15', name: 'Toyota Camry', years: '2015 · 7th gen', body: 'Midsize sedan', price: 14000, tags: ['daily'],
    verdict: 'The used-car default, upgraded.',
    mechanicsTake: 'Sharper looks, same bulletproof 2.5L four and optional V6. The sweet spot of value and reliability in the range.',
    ratings: { Reliability: 4.8, Value: 4.5, Comfort: 4.2, Drive: 3.4 } },
  { id: 'camry21', name: 'Toyota Camry', years: '2021 · 8th gen', body: 'Midsize sedan', price: 24000, tags: ['daily'],
    verdict: 'Proof a Camry can actually be interesting.',
    mechanicsTake: 'The TNGA platform gave the Camry a real chassis. Genuinely good to drive, and the hybrid is superb on fuel.',
    ratings: { Reliability: 4.8, Value: 4.3, Comfort: 4.4, Drive: 3.9 } },

  { id: 'accord14', name: 'Honda Accord', years: '2014 · 9th gen', body: 'Midsize sedan', price: 12000, tags: ['daily', 'enthusiast'],
    verdict: 'The safe Accord. Nothing clever, everything durable.',
    mechanicsTake: "The last Accord you could buy with Honda's 3.5L V6, and the reliability sweet spot of the three. The four cylinder is frugal, the V6 is quietly quick, and parts sit on every shelf.",
    ratings: { Reliability: 4.7, Value: 4.6, Comfort: 4.1, Drive: 3.9 } },
  { id: 'accord18', name: 'Honda Accord', years: '2018 · 10th gen', body: 'Midsize sedan', price: 19000, tags: ['daily', 'enthusiast'],
    verdict: 'The enthusiast pick, if you can find a 2.0T.',
    mechanicsTake: 'Honda dropped the V6 here and went turbo. The 1.5T is efficient; the 2.0T borrows the Civic Type R engine and turns the Accord into a real sport sedan. Sharpest chassis of the three. Watch for oil dilution on 1.5T cars in cold climates.',
    ratings: { Reliability: 4.3, Value: 4.4, Comfort: 4.4, Drive: 4.3 } },
  { id: 'accord25', name: 'Honda Accord', years: '2025 · 11th gen', body: 'Midsize sedan', price: 29500, tags: ['daily'],
    verdict: 'Buy it as a hybrid, or not at all.',
    mechanicsTake: 'The current car, and the one to buy as a hybrid. The 2.0L hybrid is smooth and frugal on a powertrain that has proven itself. Prices sit close to new, so it is the least value-heavy pick on this list.',
    ratings: { Reliability: 4.5, Value: 4.0, Comfort: 4.6, Drive: 4.1 } },

  { id: 'rx350-10', name: 'Lexus RX 350', years: '2010 · 3rd gen', body: 'Luxury SUV', price: 13500, tags: ['daily'],
    verdict: 'Luxury without the workshop bills.',
    mechanicsTake: 'Highlander mechanicals under a hushed luxury cabin. The 2GR V6 is smooth and, for a luxury SUV, cheap to keep.',
    ratings: { Reliability: 4.7, Value: 4.3, Comfort: 4.5, Drive: 3.5 } },
  { id: 'rx350-17', name: 'Lexus RX 350', years: '2017 · 4th gen', body: 'Luxury SUV', price: 27000, tags: ['daily'],
    verdict: 'German polish, Japanese upkeep.',
    mechanicsTake: 'Sharper styling, a quieter cabin, the same dependable V6 and Toyota running costs. The value pick of the modern RX.',
    ratings: { Reliability: 4.7, Value: 4.2, Comfort: 4.6, Drive: 3.6 } },
  { id: 'rx350-23', name: 'Lexus RX 350', years: '2023 · 5th gen', body: 'Luxury SUV', price: 46000, tags: ['daily'],
    verdict: 'Impressive, if you can stomach the price.',
    mechanicsTake: 'The V6 is gone, replaced by a 2.4L turbo four. Quick and modern, but the new tech has less of a track record and pricing sits near new.',
    ratings: { Reliability: 4.4, Value: 3.9, Comfort: 4.6, Drive: 3.7 } },

  { id: 'highlander-10', name: 'Toyota Highlander', years: '2010 · 2nd gen', body: '3-row SUV', price: 11000, tags: ['daily'],
    verdict: 'Outlasts the kids it carries.',
    mechanicsTake: 'A three row family hauler on a proven Toyota V6. Roomy, unstressed, cheap to run for a decade.',
    ratings: { Reliability: 4.8, Value: 4.4, Comfort: 4.1, Drive: 3.4 } },
  { id: 'highlander-17', name: 'Toyota Highlander', years: '2017 · 3rd gen', body: '3-row SUV', price: 22000, tags: ['daily'],
    verdict: 'The default family SUV, and it earns it.',
    mechanicsTake: 'More space, a quieter cabin, the same V6 durability. The version most families should target used.',
    ratings: { Reliability: 4.7, Value: 4.3, Comfort: 4.3, Drive: 3.5 } },
  { id: 'highlander-22', name: 'Toyota Highlander', years: '2022 · 4th gen', body: '3-row SUV', price: 38000, tags: ['daily'],
    verdict: 'Buy the hybrid for the fuel bills alone.',
    mechanicsTake: 'The TNGA platform sharpened it up, and the hybrid returns fuel numbers a big SUV has no business hitting. Third row is still tight.',
    ratings: { Reliability: 4.5, Value: 4.0, Comfort: 4.4, Drive: 3.6 } },

  { id: 'sienna-08', name: 'Toyota Sienna', years: '2008 · 2nd gen', body: 'Minivan', price: 8000, tags: ['daily'],
    verdict: 'Uncool, unkillable.',
    mechanicsTake: 'An honest workhorse minivan, and one of the few with optional all wheel drive. Cheap now, still dependable.',
    ratings: { Reliability: 4.6, Value: 4.4, Comfort: 4.3, Drive: 3.1 } },
  { id: 'sienna-15', name: 'Toyota Sienna', years: '2015 · 3rd gen', body: 'Minivan', price: 16000, tags: ['daily'],
    verdict: 'The smartest way to move seven people.',
    mechanicsTake: 'The peak sensible people-mover. The available AWD is genuinely useful on rough roads, and the V6 lasts forever.',
    ratings: { Reliability: 4.7, Value: 4.3, Comfort: 4.5, Drive: 3.2 } },
  { id: 'sienna-22', name: 'Toyota Sienna', years: '2022 · 4th gen', body: 'Minivan', price: 40000, tags: ['daily'],
    verdict: 'A minivan that sips fuel like a Corolla.',
    mechanicsTake: 'Hybrid-only now, and remarkably frugal for its size. Pricey used, but the running costs defy the segment.',
    ratings: { Reliability: 4.5, Value: 3.9, Comfort: 4.6, Drive: 3.4 } },

  { id: 'civic-08', name: 'Honda Civic', years: '2008 · 8th gen', body: 'Compact', price: 7500, tags: ['daily', 'enthusiast'],
    verdict: 'A blank canvas that still returns 40 mpg.',
    mechanicsTake: 'A tuner staple: light, frugal, and endlessly modifiable. The Si is the enthusiast sweet spot.',
    ratings: { Reliability: 4.6, Value: 4.6, Comfort: 3.6, Drive: 3.9 } },
  { id: 'civic-15', name: 'Honda Civic', years: '2015 · 9th gen', body: 'Compact', price: 11000, tags: ['daily', 'enthusiast'],
    verdict: 'Sensible now, project later.',
    mechanicsTake: 'A refined, dependable daily with the same huge parts scene. Uneventful in the best way, easy to own.',
    ratings: { Reliability: 4.6, Value: 4.6, Comfort: 3.8, Drive: 3.8 } },
  { id: 'civic-20', name: 'Honda Civic', years: '2020 · 10th gen', body: 'Compact', price: 18000, tags: ['daily', 'enthusiast'],
    verdict: 'The one enthusiasts actually queue for.',
    mechanicsTake: 'The turbo era. The 1.5T is efficient and quick; the Si and Type R are proper enthusiast cars. Sharpest Civic yet.',
    ratings: { Reliability: 4.5, Value: 4.4, Comfort: 4.0, Drive: 4.2 } },

  { id: 'eclass-12', name: 'Mercedes-Benz E-Class', years: '2012 · W212', body: 'Luxury sedan', price: 13000, tags: ['daily'],
    verdict: 'Cheap to buy, not cheap to keep.',
    mechanicsTake: 'Serious comfort for the money, but German maintenance applies. Buy on service history, not on price.',
    ratings: { Reliability: 3.9, Value: 4.0, Comfort: 4.6, Drive: 4.0 } },
  { id: 'eclass-18', name: 'Mercedes-Benz E-Class', years: '2018 · W213', body: 'Luxury sedan', price: 28000, tags: ['daily'],
    verdict: 'Buy the best example, then maintain it properly.',
    mechanicsTake: 'The cabin and ride sit a clear step above anything else on this list. Budget for specialist labour and pricier parts.',
    ratings: { Reliability: 3.8, Value: 3.9, Comfort: 4.7, Drive: 4.2 } },
  { id: 'eclass-24', name: 'Mercedes-Benz E-Class', years: '2024 · W214', body: 'Luxury sedan', price: 60000, tags: ['daily'],
    verdict: 'A lovely car to lease, a brave one to keep.',
    mechanicsTake: 'Superb to travel in, loaded with tech. Near-new pricing and an unproven long-term record keep the value score honest.',
    ratings: { Reliability: 3.7, Value: 3.6, Comfort: 4.8, Drive: 4.2 } },

  { id: 'rav4-10', name: 'Toyota RAV4', years: '2010 · 3rd gen', body: 'Compact SUV', price: 10000, tags: ['daily'],
    verdict: 'The crossover that refuses to break.',
    mechanicsTake: 'A right sized crossover with an optional V6 that is quietly quick. Simple, tough, and cheap to keep.',
    ratings: { Reliability: 4.7, Value: 4.4, Comfort: 3.9, Drive: 3.5 } },
  { id: 'rav4-17', name: 'Toyota RAV4', years: '2017 · 4th gen', body: 'Compact SUV', price: 18000, tags: ['daily'],
    verdict: 'Boring, and completely trustworthy.',
    mechanicsTake: 'The sensible-shoes RAV4: efficient, roomy enough, dead reliable. The used crossover most people should buy.',
    ratings: { Reliability: 4.7, Value: 4.4, Comfort: 4.0, Drive: 3.5 } },
  { id: 'rav4-22', name: 'Toyota RAV4', years: '2022 · 5th gen', body: 'Compact SUV', price: 30000, tags: ['daily'],
    verdict: 'Buy the hybrid and forget the fuel station.',
    mechanicsTake: 'Tougher looks, a better drive, and a hybrid that returns hatchback fuel numbers. The class benchmark for a reason.',
    ratings: { Reliability: 4.6, Value: 4.1, Comfort: 4.1, Drive: 3.7 } },

  { id: 'es350-10', name: 'Lexus ES 350', years: '2010 · 5th gen', body: 'Luxury sedan', price: 11000, tags: ['daily'],
    verdict: 'Quiet money. Everything lasts.',
    mechanicsTake: 'A Camry V6 in a tailored suit. Serene, quiet, and about as dependable as a luxury sedan gets.',
    ratings: { Reliability: 4.8, Value: 4.5, Comfort: 4.5, Drive: 3.2 } },
  { id: 'es350-16', name: 'Lexus ES 350', years: '2016 · 6th gen', body: 'Luxury sedan', price: 20000, tags: ['daily'],
    verdict: 'Luxury that never sends a scary bill.',
    mechanicsTake: 'More style, the same hushed cabin and bulletproof V6. The value sweet spot of the modern ES.',
    ratings: { Reliability: 4.8, Value: 4.4, Comfort: 4.6, Drive: 3.3 } },
  { id: 'es350-22', name: 'Lexus ES 350', years: '2022 · 7th gen', body: 'Luxury sedan', price: 34000, tags: ['daily'],
    verdict: "The thinking person's luxury sedan.",
    mechanicsTake: 'Bigger, quieter, and better to drive, with a superb hybrid option. Still Toyota-cheap to maintain.',
    ratings: { Reliability: 4.7, Value: 4.1, Comfort: 4.7, Drive: 3.5 } },

  { id: 'prado-08', name: 'Toyota Prado', years: '2008 · J120', body: 'Body-on-frame SUV', price: 18000, tags: ['daily'],
    verdict: 'Pays you back the day you sell it.',
    mechanicsTake: 'Old-school Land Cruiser tough, and it holds value hard across West Africa. A proven base for an overland build.',
    ratings: { Reliability: 4.7, Value: 4.1, Comfort: 3.9, Drive: 3.3 } },
  { id: 'prado-16', name: 'Toyota Prado', years: '2016 · J150', body: 'Body-on-frame SUV', price: 34000, tags: ['daily'],
    verdict: 'Expensive, and worth every cent.',
    mechanicsTake: 'More comfort and tech, the same unbreakable underpinnings. The Prado most buyers want, and prices reflect it.',
    ratings: { Reliability: 4.7, Value: 4.0, Comfort: 4.2, Drive: 3.4 } },
  { id: 'prado-24', name: 'Toyota Prado', years: '2024 · J250', body: 'Body-on-frame SUV', price: 62000, tags: ['daily'],
    verdict: 'The future-proof Prado, at a price.',
    mechanicsTake: 'All new platform, shared with the latest Land Cruiser. Modern and capable, priced like it, and too fresh for a long reliability record.',
    ratings: { Reliability: 4.4, Value: 3.9, Comfort: 4.4, Drive: 3.6 } },

  { id: 'gx470-08', name: 'Lexus GX', years: '2008 · GX 470 · J120', body: 'Luxury 4x4', price: 20000, tags: ['daily'],
    verdict: 'A tank in a suit.',
    mechanicsTake: 'Land Cruiser Prado underneath, Lexus polish on top, with a V8. Thirsty but tough, and cheap to fix for a luxury 4x4.',
    ratings: { Reliability: 4.6, Value: 4.1, Comfort: 4.2, Drive: 3.2 } },
  { id: 'gx460-16', name: 'Lexus GX', years: '2016 · GX 460 · J150', body: 'Luxury 4x4', price: 32000, tags: ['daily'],
    verdict: 'A 4x4 that ages like it was engineered to.',
    mechanicsTake: 'The GX 460 ran largely unchanged for over a decade because it worked. Real off-road ability with Lexus refinement.',
    ratings: { Reliability: 4.6, Value: 4.1, Comfort: 4.4, Drive: 3.3 } },
  { id: 'gx550-24', name: 'Lexus GX', years: '2024 · GX 550 · J250', body: 'Luxury 4x4', price: 68000, tags: ['daily'],
    verdict: 'The GX finally feels current.',
    mechanicsTake: 'All new, twin-turbo V6, and far more modern to drive. Seriously capable, seriously priced, and too fresh to judge long term.',
    ratings: { Reliability: 4.4, Value: 3.9, Comfort: 4.6, Drive: 3.6 } },

  { id: 'venza-10', name: 'Toyota Venza', years: '2010 · 1st gen', body: 'Crossover', price: 10000, tags: ['daily'],
    verdict: 'The smart contrarian pick.',
    mechanicsTake: 'A Camry underneath with a taller wagon body. Comfortable, practical, and overlooked, which keeps prices low.',
    ratings: { Reliability: 4.6, Value: 4.3, Comfort: 4.1, Drive: 3.4 } },
  { id: 'venza-14', name: 'Toyota Venza', years: '2014 · 1st gen facelift', body: 'Crossover', price: 13000, tags: ['daily'],
    verdict: 'Still the quiet bargain.',
    mechanicsTake: 'The late first-gen Venza with minor updates. Same Camry reliability, same under-the-radar value.',
    ratings: { Reliability: 4.6, Value: 4.3, Comfort: 4.2, Drive: 3.4 } },
  { id: 'venza-22', name: 'Toyota Venza', years: '2022 · 2nd gen', body: 'Crossover', price: 32000, tags: ['daily'],
    verdict: "The RAV4's classier, thriftier cousin.",
    mechanicsTake: 'Reborn as a hybrid-only crossover. Plush, frugal, and quietly upmarket, sharing hybrid tech with the RAV4.',
    ratings: { Reliability: 4.6, Value: 4.0, Comfort: 4.5, Drive: 3.5 } },

  { id: 'avalon-10', name: 'Toyota Avalon', years: '2010 · 3rd gen', body: 'Full-size sedan', price: 9000, tags: ['daily'],
    verdict: 'First class legroom, economy class upkeep.',
    mechanicsTake: 'A big, soft, dependable sedan on proven V6 power. Limousine space for compact-car money used.',
    ratings: { Reliability: 4.7, Value: 4.4, Comfort: 4.4, Drive: 3.3 } },
  { id: 'avalon-14', name: 'Toyota Avalon', years: '2014 · 4th gen', body: 'Full-size sedan', price: 15000, tags: ['daily'],
    verdict: 'The sensible person\'s luxury sedan.',
    mechanicsTake: 'Sharper styling, the same serene ride and V6 durability. A lot of comfortable, quiet car for the money.',
    ratings: { Reliability: 4.7, Value: 4.3, Comfort: 4.6, Drive: 3.4 } },
  { id: 'avalon-21', name: 'Toyota Avalon', years: '2021 · 5th gen', body: 'Full-size sedan', price: 28000, tags: ['daily'],
    verdict: "Toyota's forgotten flagship, and a gem.",
    mechanicsTake: 'The final Avalon, and the best of them. Genuinely good to drive, hushed, and the hybrid is superb. Discontinued now, so grab one.',
    ratings: { Reliability: 4.7, Value: 4.1, Comfort: 4.6, Drive: 3.7 } },

  { id: 'crv-14', name: 'Honda CR-V', years: '2014 · 4th gen', body: 'Compact SUV', price: 12000, tags: ['daily', 'enthusiast'],
    verdict: 'The crossover that never overreaches.',
    mechanicsTake: 'Space efficient, frugal, and dead simple to service. A dependable daily with an active owner community.',
    ratings: { Reliability: 4.6, Value: 4.5, Comfort: 3.9, Drive: 3.4 } },
  { id: 'crv-19', name: 'Honda CR-V', years: '2019 · 5th gen', body: 'Compact SUV', price: 20000, tags: ['daily', 'enthusiast'],
    verdict: 'More pace, one thing to check.',
    mechanicsTake: 'The turbo 1.5T added pep and economy. Watch for oil dilution on early cold-climate cars; otherwise a strong used pick.',
    ratings: { Reliability: 4.4, Value: 4.3, Comfort: 4.1, Drive: 3.6 } },
  { id: 'crv-24', name: 'Honda CR-V', years: '2024 · 6th gen', body: 'Compact SUV', price: 32000, tags: ['daily'],
    verdict: 'Buy it hybrid and stop thinking about it.',
    mechanicsTake: 'Roomier and more grown up, with an excellent hybrid. Near-new pricing, but the running costs are hard to beat.',
    ratings: { Reliability: 4.5, Value: 4.0, Comfort: 4.3, Drive: 3.6 } },
]

// Derive family and luxury tags from body type and make so the four-way
// matcher returns results without hand-tagging every entry.
for (const c of base) {
  const b = c.body.toLowerCase()
  if ((/suv|minivan|4x4|crossover/.test(b) || b.includes('full-size')) && !c.tags.includes('family')) c.tags.push('family')
  if (/lexus|mercedes/i.test(c.name) && !c.tags.includes('luxury')) c.tags.push('luxury')
}

export const CARS: Car[] = base

// Per-generation paint and angle. The three cards for a model each pull a
// different slot, so even when imagin serves a near-match body the three read
// as distinct cars.
const GEN_LOOKS = [
  { paint: 'imagin-blue', angle: '23' },
  { paint: 'radiant-red', angle: '01' },
  { paint: 'soul-black', angle: '29' },
]

// Which generation slot a car sits in within its model group (0, 1, or 2).
function genSlot(car: Car): number {
  const sameModel = base.filter((c) => c.name === car.name)
  const i = sameModel.findIndex((c) => c.id === car.id)
  return i < 0 ? 0 : i % GEN_LOOKS.length
}

// Builds a deterministic imagin.studio render URL from make, model, and year.
// 'img' is the shared demo customer key, so renders carry an imagin watermark.
// Swap for your own paid key to drop it.
export function carImageUrl(car: Car): string {
  const yearMatch = car.years.match(/\d{4}/)
  const look = GEN_LOOKS[genSlot(car)]
  const params = new URLSearchParams({
    customer: 'img',
    make: car.name.split(' ')[0].toLowerCase(),
    modelFamily: (car.name.split(' ')[1] || '').toLowerCase(),
    zoomType: 'fullscreen',
    angle: look.angle,
    paintDescription: look.paint,
  })
  if (yearMatch) params.set('modelYear', yearMatch[0])
  return `https://cdn.imagin.studio/getimage?${params.toString()}`
}

export function formatUSD(n: number): string {
  return '$' + Math.round(n).toLocaleString('en-US')
}

// Standard amortized monthly payment.
export function monthlyPayment(principal: number, apr: number, months: number): number {
  if (principal <= 0) return 0
  const r = apr / 100 / 12
  if (r === 0) return principal / months
  const f = Math.pow(1 + r, months)
  return (principal * r * f) / (f - 1)
}

export type Match = { car: Car; pay: number }

// Budget matcher: assumes 10% down, 7.9% APR, 60 months.
export function findMatches(maxMonthly: number, style: CarStyle): Match[] {
  const APR = 7.9, TERM = 60, DOWN = 0.1
  return CARS
    .filter((c) => c.tags.includes(style))
    .map((c) => ({ car: c, pay: monthlyPayment(c.price * (1 - DOWN), APR, TERM) }))
    .filter((m) => !maxMonthly || m.pay <= maxMonthly)
    .sort((a, b) => a.pay - b.pay)
}

export const STYLE_OPTIONS: { id: CarStyle; title: string; desc: string }[] = [
  { id: 'daily', title: 'Daily commuter', desc: 'Efficient, low maintenance, uncomplicated.' },
  { id: 'enthusiast', title: 'Enthusiast / project', desc: 'Strong tuning and aftermarket community.' },
  { id: 'family', title: 'Family hauler', desc: 'Maximizes space, safety, and durability.' },
  { id: 'luxury', title: 'Luxury / refinement', desc: 'Premium build without the catastrophic repair bills.' },
]
