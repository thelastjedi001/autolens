/**
 * HOMEPAGE INTEGRATION
 * ─────────────────────────────────────────────────────────────────────────────
 * Add this import at the top of src/app/page.tsx:
 *
 *   import SmartMatchmaker from '@/components/SmartMatchmaker'
 *
 * Then paste the <MatchmakerSection /> component below into the file,
 * and drop <MatchmakerSection /> wherever you want it on the page
 * (recommended: just below the hero, before the featured listings grid).
 *
 * Example placement in page.tsx:
 *
 *   export default async function HomePage() {
 *     return (
 *       <main>
 *         <HeroSection />          ← your existing hero
 *         <MatchmakerSection />    ← ADD THIS
 *         <FeaturedListings />     ← your existing listings
 *       </main>
 *     )
 *   }
 */

// ─── Paste this component into src/app/page.tsx ──────────────────────────────

function MatchmakerSection() {
  return (
    <section className="w-full border-t border-zinc-800/60">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <SmartMatchmaker />
      </div>
    </section>
  )
}
