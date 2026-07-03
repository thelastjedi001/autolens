'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import './autolens.css'
import {
  CARS,
  STYLE_OPTIONS,
  formatUSD,
  monthlyPayment,
  findMatches,
  carImageUrl,
  type Car,
  type CarStyle,
} from '@/lib/cars'

// ── car silhouette placeholder ────────────────────────────────────────────────
function CarGlyph() {
  return (
    <svg viewBox="0 0 120 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 34h108M14 34c0-4 3-7 7-7s7 3 7 7M92 34c0-4 3-7 7-7s7 3 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 34l4-13c1-3 3-4 6-4h42l18 10 22 3c4 1 6 3 6 7" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M30 17v10M50 17v10" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

// ── one catalog card ──────────────────────────────────────────────────────────
function CarCard({ car, matched }: { car: Car; matched: boolean }) {
  const [imgError, setImgError] = useState(false)
  const src = car.image ?? carImageUrl(car)
  const showImage = !imgError

  return (
    <article className={`card reveal${matched ? ' matched' : ''}`} id={`car-${car.id}`}>
      <div className="car-visual">
        <span className="badge">{car.body}</span>
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={car.name} style={{ objectFit: 'contain', padding: 8 }} onError={() => setImgError(true)} />
        ) : (
          <CarGlyph />
        )}
        <span className="years">{car.years}</span>
      </div>
      <div className="card-body">
        <h3>{car.name}</h3>
        <p className="verdict">{car.verdict}</p>
        <span className="take-label">The Mechanic&apos;s Take</span>
        <p className="take">{car.mechanicsTake}</p>
        <div className="ratings">
          {(Object.entries(car.ratings) as [string, number][]).map(([label, val]) => (
            <div className="rating" key={label}>
              <div className="r-top">
                <span className="r-label">{label}</span>
                <span className="r-val">{val.toFixed(1)}</span>
              </div>
              <div className="bar"><i style={{ width: `${(val / 5) * 100}%` }} /></div>
            </div>
          ))}
        </div>
        <div className="price">
          <span className="p-cap">Est. used price</span>
          <span className="p-num">{formatUSD(car.price)}</span>
        </div>
      </div>
    </article>
  )
}

type Screen = 'intro' | 'mechanics' | 'mechAdvice' | 'newcar' | 'newcarNote' | 'financeCap' | 'matches'
const DOTS: Record<Screen, number[]> = {
  intro: [0], mechanics: [0, 1], mechAdvice: [0, 1], newcar: [0, 1, 2],
  newcarNote: [0, 1, 2], financeCap: [0, 1, 2], matches: [0, 1, 2],
}
const STYLE_LABELS: Record<CarStyle, string> = {
  daily: 'daily commuters', enthusiast: 'project cars', family: 'family haulers', luxury: 'luxury picks',
}

export default function AutoLensHome() {
  const rootRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const catalogRef = useRef<HTMLDivElement>(null)

  const [tucked, setTucked] = useState(false)
  const [highlighted, setHighlighted] = useState<Set<string>>(new Set())

  // interview flow
  const [screen, setScreen] = useState<Screen>('intro')
  const [capBudget, setCapBudget] = useState('')
  const [capStyle, setCapStyle] = useState<CarStyle | null>(null)
  const [capMatches, setCapMatches] = useState<{ car: Car; pay: number }[]>([])

  // mechanics advice
  const [mechText, setMechText] = useState('')
  const [mechReply, setMechReply] = useState('')
  const [mechLoading, setMechLoading] = useState(false)

  // header tuck on scroll past hero
  useEffect(() => {
    const el = sentinelRef.current
    if (!el || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(
      ([e]) => setTucked(!e.isIntersecting),
      { rootMargin: '-64px 0px 0px 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // reveal on scroll
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const els = root.querySelectorAll('.reveal')
    if (!('IntersectionObserver' in window)) {
      els.forEach((e) => e.classList.add('in'))
      return
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }),
      { threshold: 0.1 }
    )
    els.forEach((e) => io.observe(e))
    return () => io.disconnect()
  }, [])

  function scrollToCatalog() {
    catalogRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  function runCapMatch() {
    if (!capStyle) return
    const max = Number(capBudget) || 0
    const matches = findMatches(max, capStyle)
    setCapMatches(matches)
    setHighlighted(new Set(matches.map((m) => m.car.id)))
    setScreen('matches')
  }

  async function submitMechanics() {
    if (!mechText.trim() || mechLoading) return
    setMechLoading(true)
    setMechReply('')
    try {
      const res = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: mechText.trim() }] }),
      })
      const data = await res.json()
      const text = data?.content?.[0]?.text ?? data?.error ?? 'No response. Try again.'
      setMechReply(text)
    } catch {
      setMechReply('Something went wrong reaching the advisor. Try again.')
    } finally {
      setMechLoading(false)
    }
  }

  // group catalog by model so each model keeps its own row
  const groups = useMemo(() => {
    const out: { name: string; cars: Car[] }[] = []
    for (const c of CARS) {
      const last = out[out.length - 1]
      if (last && last.name === c.name) last.cars.push(c)
      else out.push({ name: c.name, cars: [c] })
    }
    return out
  }, [])

  return (
    <div className="al" ref={rootRef}>
      {/* Header */}
      <header className={`header${tucked ? ' tucked' : ''}`}>
        <div className="wrap nav">
          <div className="brand"><span className="dot" />AutoLens</div>
          <nav className="nav-links">
            <a onClick={scrollToCatalog}>Trusted cars</a>
            <a onClick={() => document.getElementById('finance')?.scrollIntoView({ behavior: 'smooth' })}>Finance</a>
          </nav>
          <button className="btn btn-primary" onClick={scrollToCatalog}>Browse cars</button>
        </div>
      </header>

      {/* Hero */}
      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <h1>Buy a used car without getting taken for a ride.</h1>
            <p className="lede">Get mechanic-grade judgment on what to buy, what breaks, and what it actually costs.</p>
          </div>

          <div className="panel" aria-live="polite">
            <div className="progress">
              {[0, 1, 2].map((i) => (
                <i key={i} className={DOTS[screen].includes(i) ? 'on' : ''} />
              ))}
            </div>

            {screen === 'intro' && (
              <div className="screen">
                <div className="q">Where do you want to start?</div>
                <div className="sub">Jump straight to the cars we trust, or answer a few questions and we will match you to one.</div>
                <div className="choices">
                  <button className="btn btn-primary" onClick={scrollToCatalog}>Browse the Trusted List</button>
                  <button className="btn btn-outline" onClick={() => setScreen('mechanics')}>Match Me to a Car</button>
                </div>
                <div className="foot"><span /><span className="mono">Step 1</span></div>
              </div>
            )}

            {screen === 'mechanics' && (
              <div className="screen">
                <div className="q">Do you need general mechanics advice?</div>
                <div className="sub">A symptom you want explained before you spend money at a workshop.</div>
                <div className="choices">
                  <button className="btn btn-primary" onClick={() => setScreen('mechAdvice')}>Yes</button>
                  <button className="btn btn-outline" onClick={() => setScreen('newcar')}>No</button>
                </div>
                <div className="foot"><button className="link-back" onClick={() => setScreen('intro')}>Back</button><span className="mono">Step 2</span></div>
              </div>
            )}

            {screen === 'mechAdvice' && (
              <div className="screen">
                <div className="q">Tell us what the car is doing.</div>
                <div className="field">
                  <label htmlFor="mech-car">Car and symptom</label>
                  <textarea
                    className="input" id="mech-car" rows={3}
                    value={mechText} onChange={(e) => setMechText(e.target.value)}
                    placeholder="2011 VW Jetta, tach needle jumps on the highway, will not go past 80, no check engine light"
                  />
                </div>
                {mechReply && <div className="note">{mechReply}</div>}
                <div className="choices">
                  <button className="btn btn-primary" onClick={submitMechanics} disabled={mechLoading || !mechText.trim()}>
                    {mechLoading ? 'Thinking...' : 'Get advice'}
                  </button>
                  <button className="btn btn-ghost" onClick={scrollToCatalog}>Browse cars instead</button>
                </div>
                <div className="foot"><button className="link-back" onClick={() => setScreen('mechanics')}>Back</button><span className="mono">Advisor</span></div>
              </div>
            )}

            {screen === 'newcar' && (
              <div className="screen">
                <div className="q">Are you looking to buy a new car?</div>
                <div className="sub">Brand new, off the showroom floor.</div>
                <div className="choices">
                  <button className="btn btn-primary" onClick={() => setScreen('newcarNote')}>Yes</button>
                  <button className="btn btn-outline" onClick={() => setScreen('financeCap')}>No</button>
                </div>
                <div className="foot"><button className="link-back" onClick={() => setScreen('mechanics')}>Back</button><span className="mono">Step 3</span></div>
              </div>
            )}

            {screen === 'newcarNote' && (
              <div className="screen">
                <div className="q">We stick to used cars.</div>
                <div className="note"><b>New cars lose value fast.</b> Our whole list is used, because that is where reliability meets a sensible price. If you still want new, a franchised dealer is your move. Otherwise, let us match a used one to your budget.</div>
                <div className="choices">
                  <button className="btn btn-primary" onClick={() => setScreen('financeCap')}>Match me a used car</button>
                  <button className="btn btn-ghost" onClick={scrollToCatalog}>Just show the list</button>
                </div>
                <div className="foot"><button className="link-back" onClick={() => setScreen('newcar')}>Back</button><span className="mono">Step 3</span></div>
              </div>
            )}

            {screen === 'financeCap' && (
              <div className="screen">
                <div className="q">Let us match your budget.</div>
                <div className="field input-money">
                  <label htmlFor="cap-budget">How much can you spend per month?</label>
                  <div className="input-money"><span>$</span>
                    <input className="input" id="cap-budget" type="number" min={0} step={10} placeholder="350"
                      value={capBudget} onChange={(e) => setCapBudget(e.target.value)} />
                  </div>
                </div>
                <div className="field">
                  <label>What type of vehicle are you after?</label>
                  <div className="toggle-group">
                    {STYLE_OPTIONS.map((s) => (
                      <button key={s.id} className={`toggle${capStyle === s.id ? ' sel' : ''}`} onClick={() => setCapStyle(s.id)}>
                        <span className="tick" />
                        <span><span className="t-title">{s.title}</span><span className="t-desc">{s.desc}</span></span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="choices">
                  <button className="btn btn-primary" onClick={runCapMatch} disabled={!capStyle}>See my matches</button>
                </div>
                <div className="foot"><button className="link-back" onClick={() => setScreen('newcar')}>Back</button><span className="mono">Step 3</span></div>
              </div>
            )}

            {screen === 'matches' && (
              <div className="screen">
                <div className="q">{capMatches.length ? 'Your matches' : 'No matches yet'}</div>
                <div className="sub">
                  {capMatches.length
                    ? `${Number(capBudget) ? `Under ${formatUSD(Number(capBudget))}/mo, ` : ''}ranked cheapest first.`
                    : `Nothing in the ${capStyle ? STYLE_LABELS[capStyle] : 'chosen'} group fits that budget. Raise it or switch style.`}
                </div>
                <div className="matches-out">
                  {capMatches.slice(0, 5).map((m) => (
                    <div className="mini-match" key={m.car.id}>
                      <div><div className="mm-name">{m.car.name}</div><div className="mm-years">{m.car.years}</div></div>
                      <div className="mm-pay">{formatUSD(m.pay)}/mo</div>
                    </div>
                  ))}
                </div>
                <div className="choices">
                  <button className="btn btn-primary" onClick={scrollToCatalog}>See them in the catalog</button>
                  <button className="btn btn-ghost" onClick={() => setScreen('financeCap')}>Change budget</button>
                </div>
                <div className="foot"><button className="link-back" onClick={() => setScreen('financeCap')}>Back</button><span className="mono">Result</span></div>
              </div>
            )}
          </div>
        </div>
      </section>

      <div ref={sentinelRef} style={{ height: 1 }} />

      {/* Catalog */}
      <section className="section" id="catalog" ref={catalogRef}>
        <div className="wrap">
          <div className="section-head reveal">
            <div className="mono" style={{ marginBottom: 14 }}>The AutoLens 15 · 45 listings</div>
            <h2>The AutoLens 15: Cars We Actually Trust.</h2>
            <p>Every vehicle here earned its spot through proven mechanicals, abundant parts, and a reputation for outliving the odometer. No margin pushes, no fluff. Ratings are out of 5.</p>
          </div>
          <div className="catalog">
            {groups.map((g) => (
              <div className="model-row" key={g.name}>
                {g.cars.map((c) => <CarCard key={c.id} car={c} matched={highlighted.has(c.id)} />)}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Finance */}
      <FinanceSection onMatch={(ids) => setHighlighted(new Set(ids))} />

      <footer>
        <div className="wrap foot-row">
          <div className="brand"><span className="dot" />AutoLens</div>
          <div className="mono">Prototype · Estimates only, not financial advice</div>
        </div>
      </footer>
    </div>
  )
}

// ── Finance section (calculator + matcher) ────────────────────────────────────
function FinanceSection({ onMatch }: { onMatch: (ids: string[]) => void }) {
  // calculator
  const [carId, setCarId] = useState(CARS[0].id)
  const [price, setPrice] = useState(CARS[0].price)
  const [down, setDown] = useState(2000)
  const [apr, setApr] = useState(8.5)
  const [term, setTerm] = useState(60)

  function selectCar(id: string) {
    setCarId(id)
    const car = CARS.find((c) => c.id === id)
    if (car) setPrice(car.price)
  }

  const principal = Math.max(0, price - down)
  const monthly = monthlyPayment(principal, apr, term)
  const totalCost = monthly * term + down
  const interest = Math.max(0, monthly * term - principal)

  // matcher
  const [matchBudget, setMatchBudget] = useState('')
  const [matchStyle, setMatchStyle] = useState<CarStyle | null>(null)
  const [matchResults, setMatchResults] = useState<{ car: Car; pay: number }[] | null>(null)

  function runMatch() {
    if (!matchStyle) { setMatchResults([]); return }
    const results = findMatches(Number(matchBudget) || 0, matchStyle)
    setMatchResults(results)
    onMatch(results.map((m) => m.car.id))
  }

  return (
    <section className="section section-gray" id="finance">
      <div className="wrap">
        <div className="section-head reveal">
          <div className="mono" style={{ marginBottom: 14 }}>Run the numbers</div>
          <h2>Shop your reality, not the sticker price.</h2>
          <p>Dealers sell monthly payments; we show you the reality. Estimate your terms below, or give us your strict monthly ceiling and we will show you exactly which trusted cars fit your life.</p>
        </div>

        <div className="finance-grid">
          {/* Calculator */}
          <div className="fin-card reveal">
            <h3>Estimate a payment</h3>
            <p>Pick a car from the trusted list, adjust the terms, and see your true monthly cost.</p>

            <div className="field">
              <label htmlFor="calc-car">Select vehicle</label>
              <select className="input" id="calc-car" value={carId} onChange={(e) => selectCar(e.target.value)}>
                {CARS.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.years})</option>)}
              </select>
            </div>
            <div className="field input-money">
              <label htmlFor="calc-price">Vehicle price</label>
              <div className="input-money"><span>$</span>
                <input className="input" id="calc-price" type="number" min={0} step={100} value={price} onChange={(e) => setPrice(Number(e.target.value))} />
              </div>
              <span className="hint">Prefilled with an estimated used price. Adjust to a real listing.</span>
            </div>
            <div className="row2">
              <div className="field input-money">
                <label htmlFor="calc-down">Down payment</label>
                <div className="input-money"><span>$</span>
                  <input className="input" id="calc-down" type="number" min={0} step={100} value={down} onChange={(e) => setDown(Number(e.target.value))} />
                </div>
              </div>
              <div className="field">
                <label htmlFor="calc-apr">Interest rate (APR)</label>
                <input className="input" id="calc-apr" type="number" min={0} step={0.1} value={apr} onChange={(e) => setApr(Number(e.target.value))} />
              </div>
            </div>
            <div className="field">
              <label htmlFor="calc-term">Term length</label>
              <select className="input" id="calc-term" value={term} onChange={(e) => setTerm(Number(e.target.value))}>
                {[24, 36, 48, 60, 72].map((t) => <option key={t} value={t}>{t} months</option>)}
              </select>
            </div>

            <div className="result">
              <div className="big">{formatUSD(monthly)}<small>/mo</small></div>
              <div className="side">
                <div>Total interest paid <b>{formatUSD(interest)}</b></div>
                <div>Total cost of car <b>{formatUSD(totalCost)}</b></div>
              </div>
            </div>
          </div>

          {/* Matcher */}
          <div className="fin-card reveal">
            <h3>Match my budget</h3>
            <p>Give us a monthly ceiling and a style. We assume standard terms: 10% down, 7.9% APR, 60 months.</p>

            <div className="field input-money">
              <label htmlFor="match-budget">Max per month</label>
              <div className="input-money"><span>$</span>
                <input className="input" id="match-budget" type="number" min={0} step={10} placeholder="350" value={matchBudget} onChange={(e) => setMatchBudget(e.target.value)} />
              </div>
            </div>
            <div className="field">
              <label>Vehicle style</label>
              <div className="toggle-group">
                {STYLE_OPTIONS.map((s) => (
                  <button key={s.id} className={`toggle${matchStyle === s.id ? ' sel' : ''}`} onClick={() => setMatchStyle(s.id)}>
                    <span className="tick" />
                    <span><span className="t-title">{s.title}</span><span className="t-desc">{s.desc}</span></span>
                  </button>
                ))}
              </div>
            </div>
            <button className="btn btn-primary" style={{ marginTop: 20, width: '100%' }} onClick={runMatch}>Find matches</button>

            <div className="matches-out">
              {matchResults === null ? null : matchResults.length === 0 ? (
                <div className="empty">{matchStyle ? 'Nothing fits that monthly target yet. Try raising it, or switch the vehicle style.' : 'Pick a vehicle style first.'}</div>
              ) : (
                matchResults.map((m) => (
                  <div className="mini-match" key={m.car.id}>
                    <div><div className="mm-name">{m.car.name}</div><div className="mm-years">{m.car.years}</div></div>
                    <div className="mm-pay">{formatUSD(m.pay)}/mo</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
