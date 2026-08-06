# FeeSeal — PRD

**The menu price is the bill price. Verified.**

Working name. Team: Diego + Aaroha. Cursor Miami Ship Night, Aug 6 2026.

---

## What it is

A digital menu platform for restaurants. Restaurants publish their prices and fee disclosures to FeeSeal, which records them on-chain. Customers scan the physical menu and the receipt to check whether all three match.

Around that sits the rest of the app: price history, a map of restaurants with profiles and trust scores, reviews, reservations, and bill payment.

---

## The problem

Prices live in three places that should agree and often don't: what the restaurant publishes, the printed menu on the table, and the final bill. Printed menus go stale. Service charges show up on the bill that weren't disclosed up front. When someone questions a charge, both sides are arguing from memory.

## Why now — the law

Florida Senate Bill 606, signed June 2, 2025 as Chapter 2025-113, rewrote **Fla. Stat. § 509.214**, effective **July 1, 2026**.

Primary source: [flsenate.gov/Laws/Statutes/2025/0509.214](https://www.flsenate.gov/Laws/Statutes/2025/0509.214)

The statute defines an <cite index="22-1">"operations charge" as an automatic fee or charge, other than a government-imposed tax, that a customer is required to pay in addition to the cost of the food and beverage purchased — including service charges, automatic gratuities, credit card surcharges, and delivery fees</cite>.

It then sets three disclosure checkpoints, which map directly onto FeeSeal's three sources:

| Statute | Requirement | FeeSeal source |
|---|---|---|
| **§ 509.214(2)** | <cite index="22-1">A notice on the food menu, written contract, and website or mobile app where orders are placed, stating the amount or percentage of the charge and its purpose — in a font equal to or greater than the one used for menu item descriptions</cite> | **A** (published menu) and **B** (physical menu) |
| **§ 509.214(3)** | <cite index="22-1">A notice on the face of the bill that an operations charge is included, clearly stating the percentage or amount</cite> | **C** (bill) |
| **§ 509.214(4)** | <cite index="22-1">Separate lines on the receipt for gratuity, operations charge, and sales tax; if the operations charge includes an automatic gratuity, that must be stated separately</cite> | **C** (receipt) |

Two limits worth building around:

- <cite index="22-1">The section creates no private cause of action</cite>. <cite index="19-1">Enforcement runs through DBPR, with administrative fines up to $1,000 per offense, remedial education, and possible license suspension under § 509.261</cite>. A customer can't sue over this, which is exactly why the product must report differences and never imply a remedy.
- <cite index="22-1">It doesn't apply to a dining plan, package, or fixed-price meal where the price was disclosed before purchase</cite>. Comparison rules need to handle prix-fixe as an exception, not a discrepancy.

The statute is the reason restaurants now need a system of record for what they disclosed and when. FeeSeal's menu versioning gives them one. That's the pitch to the supply side.

Confirm current statutory language with counsel before making any compliance claim in marketing.

---

## Restaurants can

- Create a profile: name, location, hours, photos
- Upload menus and fee disclosures
- Get a website and digital menu generated from that
- Update prices and fees; each update publishes a new on-chain version
- See a dashboard: scans, match rate, flagged discrepancies, reservations

Profile scope is deliberately small for v1. No POS integration, no staff accounts, no multi-location.

---

## Users can

- See everything the restaurant published — menu, prices, fees, hours, photos
- Run a price check on the physical menu and the receipt
- See price history and average price change
- See a map of restaurants, each with a profile, trust score, reviews, and photos
- See a heat map of what's happening around them: where the crowd is, whether it skews young or old, what events are on
- Reserve a table
- Pay the bill

---

## The three-way check

| Source | What | Authority |
|---|---|---|
| **A** | Published menu, signed by the restaurant, on-chain | Baseline |
| **B** | Physical menu photo | Observed |
| **C** | Bill or receipt photo | Observed |

| Comparison | Meaning if they differ |
|---|---|
| A vs B | Printed menu is stale or was changed without publishing |
| A vs C | Billed something other than what was published |
| B vs C | Billed differently from what was on the table |
| All match | ✅ Verified. This is the expected outcome |

**Findings:** item price difference · fee on the bill with no matching disclosure · fee disclosed without a stated purpose · rate mismatch · gratuity, operations charge, and tax on separate receipt lines (a check that can pass) · version drift, where the paper menu matches an older published version

**Exception to handle:** prix-fixe, packages, and dining plans priced up front are carved out of the statute. Flag them as excluded, not as discrepancies.

**Later:** § 509.214(2) requires the disclosure font to be at least as large as menu item descriptions. Rough font-size comparison is a P2 signal, not a v1 finding.

A vision model handles extraction only. Comparison and arithmetic are deterministic TypeScript. Every extracted value is editable before comparison runs.

**Language rules.** Say "potential discrepancy," "no matching disclosure found," "review recommended." Never say "illegal fee," "fraud," "violation," or "you can sue." Findings screens carry a visible disclaimer: *FeeSeal identifies observable differences between documents. It does not determine legal liability or provide legal advice.*

---

## Trust score and reviews

Trust score is computed from objective signals only: match rate across scans, whether fee disclosures include amount and purpose, menu freshness, dispute response time, correction rate.

Rules that keep this defensible:
- No score until there's enough scan volume. New restaurants show "insufficient data," not a low score
- The operator sees a flag before it's public and can respond or mark it explained
- Score inputs are itemized, not a black-box number
- No rankings, no worst-offender lists

Reviews are separate from the trust score. Reviews are opinion; the score is arithmetic. Verified badge for reviewers with a scan or settled bill on file. Ship reviews after a moderation policy exists.

---

## Heat map

Where the crowd is right now, how it skews by age, and what events are on nearby. Basic view free. Paid tier adds the detail: demographic breakdown, tourist vs. local split, busy-time patterns, and how a neighborhood's activity is trending.

Sold to both sides — as a going-out tool for customers, and as area analytics for restaurants.

**Open question:** where does the underlying data come from at launch? Scan and reservation volume gives real signal but only after adoption. Before that it needs a seed source (public event calendars, foot-traffic data, or a partner). Worth deciding before this gets demoed, because a heat map with no data behind it is the easiest thing for a judge to poke.

---

## Dietary filters

Halal, kosher, vegetarian, vegan, gluten-free, and common allergens. Filter the map and search by them.

Since tags publish on-chain with the menu, a halal or kosher tag is a dated, versioned claim rather than a sign in a window. Open question: does the restaurant self-declare, or upload a certificate? Self-declaration is easier and is what most platforms do; a wrong tag here causes more harm than a wrong price.

---

## Tourists

<cite index="19-1">Florida drew 143.3 million visitors in 2025</cite>, and visitors are the group least likely to know local pricing norms or expect a mandatory service charge. Published prices, a map, and dietary filters are all more useful when you don't know the area. This is a segment to design for, not a separate product.

---

## Reservations and payment

Reserve a table: search by location, cuisine, availability, dietary filter. Book, confirm, remind, cancel. Restaurant sets capacity and blackout dates.

Pay the bill in-app. The useful version checks the bill against the published menu *before* payment, so the discrepancy surfaces while it can still be fixed at the table.

**Constraint:** holding customer funds is money transmission. This needs a licensed payments partner (Stripe Connect or similar) or the licensing itself. Devnet settlement only until that's sorted, and it should be labeled as a demo.

---

## Agents

The plan is for on-chain agents to handle routine tasks. This is the least defined item in the document and needs a concrete first use case before it's built or pitched.

Candidates, in rough order of feasibility:
- Re-check a restaurant's published menu against its live website on a schedule and flag drift
- Watch for a menu version change and notify customers with an upcoming reservation
- Run the three-way comparison automatically when a bill is settled in-app
- Route a flagged discrepancy to the restaurant and escalate if there's no response in the window

Pick one. An agent that does something specific and verifiable is worth more in a demo than a general claim about agents.

---

## What's on chain

**On:** menu version hash, restaurant key, version number, timestamp, effective-from date, jurisdiction, fee disclosure flags, dietary tags, settlement record hash

**Off:** item names and descriptions, images, menu and receipt photos, extracted text, customer identity, scan history, reviews, payment data, all demographic data

Menu and receipt photos never go on-chain. Publishing is a memo transaction, not storage, so it costs the restaurant nothing perceptible.

---

## Revenue

- **Platform fee from restaurants** — subscription for the dashboard, analytics, and reservations. The menu, website, and QR stay free; that's what gets restaurants on
- **Advertising** — promoted placement in search and on the map, the OpenTable model
- **Customer paid plan** — heat map detail, demographics, what's happening nearby
- **Reservation and settlement fees** once payments are live

One thing to think through: ads and the trust score sit in the same app. If a restaurant can pay for placement, someone will ask whether it can pay for a better score. The answer needs to be structurally obvious — promoted results visibly labeled, score inputs published, ad spend never an input. Worth having a clean answer ready, because a judge will ask.

Pricing is a hypothesis, not validated: free menu tier · paid restaurant tier · consumer subscription for heat map detail.

---

## Scope

### Tonight (P0, ~4.5 hours)
1. Restaurant publishes a menu with prices and fee disclosures (fixture is fine)
2. Menu hashed and committed to Solana devnet via QuickNode + Memo Program
3. Public menu page renders from the record, with version and verified badge
4. Scan physical menu → A vs B
5. Scan receipt → A vs C and B vs C
6. Findings screen: itemized differences, one passing check, visible disclaimer
7. Original file verifies against chain; a modified copy fails
8. Deployed URL that works on someone else's phone

Demo climax: three sources, three findings, one pass, then a one-pixel edit breaks verification.

### Week one
Restaurant sign-up and auth · profile with photos and hours · menu builder · QR generation · version history · price history and average change · map and profiles · dietary tags and filters · trust score v1 · restaurant dashboard · flag response workflow

### Later
Reservations · in-app bill payment · heat map free tier · paid demographic tier · reviews with moderation · advertising placement · one agent task · Spanish

---

## Screens

1. Landing — two doors: diner / restaurant
2. Restaurant onboarding — name, location, hours, photos
3. Menu builder — items, prices, sections, dietary tags, and a required fee-disclosure block (amount or rate **and** purpose)
4. Publish confirmation — canonical JSON, hash, version, transaction status, explorer link
5. Public menu page — the restaurant's website. Verified badge, version, last updated, QR
6. Restaurant dashboard — scans, match rate, flags, reservations
7. Map — restaurants, heat map layer, dietary and cuisine filters
8. Restaurant profile — menu, photos, trust score with itemized inputs, price history, reviews, reserve
9. Scan capture — framing and glare guidance
10. Review extraction — image beside editable values
11. Findings — A/B/C columns, before/after cards, passing checks, mark-explained, disclaimer
12. Verification — file + signature → match or mismatch

**Look:** trust product, not a coupon app or a crypto lobby. Ink `#0F172A`, surface `#F8FAFC`, accent `#0F766E`, verified `#15803D`, review `#B45309`, difference `#B91C1C`. Inter or Geist, 16px minimum on mobile, monospace for hashes. No gavels or scales of justice.

---

## Non-goals

Legal advice or liability findings · worst-offender lists · scoring restaurants with no scan volume · proving a photo shows a real scene (we prove file integrity and menu provenance, nothing more) · real-money payments before a licensed partner · scraping restaurant sites · custom Solana program or token for the hackathon · native apps in v1

---

## Risks

| Risk | Response |
|---|---|
| Cold start — no restaurants, nothing to verify | Free menu and website has standalone value; hand-seed 10–20 Miami restaurants |
| Heat map has no data early on | Seed from public event calendars or a data partner; don't demo an empty map |
| Trust score becomes a defamation surface | Objective inputs, volume thresholds, operator sees flags first, no rankings, counsel review |
| Ads seen as compromising the score | Label promoted results, publish score inputs, keep ad spend out of the computation |
| Restaurants see it as adversarial | Lead with the free website; most scans come back green |
| Payments licensing | Partner or don't ship |
| OCR errors | Human confirmation before comparison |
| Partial menu capture | Completeness prompt; qualify findings as "in the captured evidence" |
| Restaurant publishes a fake cheap menu | Versioning makes a last-minute change visible and dated |
| Chain latency on stage | Retries, hotspot, one pre-confirmed fallback transaction |
| Scope collapse tonight | Fixture-first vertical slice, fixed build order |

---

## Metrics

**Tonight:** full flow under 90 seconds · transaction confirmed · expected findings appear · original verifies, modified fails · works on an unfamiliar phone · demo under 3 minutes

**Product:** verified meals (bill matched, or discrepancy resolved) as the north star · restaurants published · scans per restaurant · network match rate · resolution time · extraction false-positive rate · reservation and payment volume · paid conversion on the customer tier

---

## Open questions

1. Does the restaurant hold its own wallet, or does FeeSeal sign with a delegated key?
2. Where does heat map data come from before there's scan volume?
3. Who verifies halal and kosher tags?
4. Does demographic data need explicit consent beyond terms, and what's the opt-out?
5. Trust score public at launch, or operator-only until volume is fair?
6. Which single agent task ships first?

---

## Sources

- Fla. Stat. § 509.214, Florida Senate: https://www.flsenate.gov/Laws/Statutes/2025/0509.214
- SB 606 (2025 session), signed June 2, 2025 · session law Chapter 2025-113 · effective July 1, 2026
- Enforcement and penalties: Fla. Stat. § 509.261
- BakerHostetler, "Florida Expands Mandatory Fee Disclosure Requirements for Restaurants and Hospitality Businesses in 'Operations Charge' Statute," April 17, 2026
- VISIT FLORIDA, 2025 visitation estimates (143.3M visitors)

---

## Build order tonight

Fixture flow → publish and seal → public menu page → menu extraction → receipt extraction → three-way comparison → verification and tamper test → deploy → rehearse.

Everything else is optional.

---

*FeeSeal identifies observable differences between documents. It does not determine legal liability, establish that every applicable disclosure was captured, or provide legal advice.*
