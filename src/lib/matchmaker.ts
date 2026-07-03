// matchmaker.ts
// Pure scoring logic. No Supabase imports here — keep this testable in isolation.

export type MatchPreferences = {
  bodyTypes: string[]      // e.g. ['sedan', 'suv']
  fuelType: string         // 'petrol' | 'hybrid' | 'electric' | 'any'
  maxBudget: number        // USD
  condition: string        // 'used' | 'certified' | 'new' | 'any'
}

export type ScoredListing = {
  id: string
  title: string
  make: string
  model: string
  year: number
  price: number
  mileage: number
  fuel_type: string
  transmission: string
  body_type: string
  colour: string
  condition: string
  description: string
  location: string
  views: number
  image_url: string | null
  score: number           // 0–100
  score_reasons: string[] // human-readable explanation
}

/**
 * Scores a single listing against the user's preferences.
 * Returns a score 0–100 and a short list of reasons.
 *
 * Scoring breakdown:
 *   Body type match     → 35 pts
 *   Budget fit          → 30 pts (scaled: closer to budget = more pts)
 *   Fuel type match     → 20 pts
 *   Condition match     → 15 pts
 */
export function scoreListing(
  listing: Omit<ScoredListing, 'score' | 'score_reasons'>,
  prefs: MatchPreferences
): { score: number; score_reasons: string[] } {
  let score = 0
  const reasons: string[] = []

  // Body type (35 pts)
  if (prefs.bodyTypes.length === 0 || prefs.bodyTypes.includes(listing.body_type)) {
    score += 35
    reasons.push(`${capitalize(listing.body_type)} matches your preference`)
  }

  // Budget (30 pts — not binary, scaled)
  if (listing.price <= prefs.maxBudget) {
    // Full 30 pts if price is ≤ 100% of budget.
    // Bonus feel: listings at 80–95% of budget score a bit higher than rock-bottom ones
    // (signals the listing is priced to the range, not just cheap).
    const ratio = listing.price / prefs.maxBudget
    let budgetPts: number
    if (ratio <= 0.60) {
      budgetPts = 18 // well under budget — might be lower spec
    } else if (ratio <= 0.80) {
      budgetPts = 24
    } else {
      budgetPts = 30 // sweet spot: close to but under budget
    }
    score += budgetPts
    const saving = prefs.maxBudget - listing.price
    reasons.push(`$${saving.toLocaleString()} under your budget`)
  }
  // Over budget → 0 pts (these listings are filtered out before scoring anyway)

  // Fuel type (20 pts)
  if (prefs.fuelType === 'any' || listing.fuel_type === prefs.fuelType) {
    score += 20
    if (prefs.fuelType !== 'any') {
      reasons.push(`${capitalize(prefs.fuelType)} fuel as requested`)
    }
  }

  // Condition (15 pts)
  if (prefs.condition === 'any' || listing.condition === prefs.condition) {
    score += 15
    if (prefs.condition !== 'any') {
      reasons.push(`${capitalize(listing.condition)} condition`)
    }
  }

  return { score, score_reasons: reasons }
}

/**
 * Takes raw listings from Supabase, scores and sorts them.
 * Returns only listings within budget, sorted by score desc.
 */
export function rankListings(
  listings: Omit<ScoredListing, 'score' | 'score_reasons'>[],
  prefs: MatchPreferences
): ScoredListing[] {
  return listings
    .filter((l) => l.price <= prefs.maxBudget)
    .map((l) => {
      const { score, score_reasons } = scoreListing(l, prefs)
      return { ...l, score, score_reasons }
    })
    .sort((a, b) => b.score - a.score)
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
