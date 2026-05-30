# PickASlot — Brand & Design System
**Version 1.0 · MVP · Sunrise Village**

---

## Contents

1. [Brand Principles](#1-brand-principles)
2. [Logo & Wordmark](#2-logo--wordmark)
3. [Color System](#3-color-system)
4. [Typography](#4-typography)
5. [Spacing Scale](#5-spacing-scale)
6. [Border Radius](#6-border-radius)
7. [Motion](#7-motion)
8. [Components](#8-components)
9. [Slot States](#9-slot-states)
10. [Booking Status](#10-booking-status)

---

## 1. Brand Principles

Four principles that guide every design decision in PickASlot. When in doubt, come back to these.

### 01 — Clarity of Action
The user should always know what to do next. Available slots look tappable. The Reserve button is unmissable. Nothing competes for primary attention.

### 02 — Accessible Confidence
Designed for all ages, including older homeowners. Large tap targets, high contrast, clear labels. Simple without being patronizing.

### 03 — Native to the Sport
The deep court-green palette, the court line texture in the hero, the slot grid layout — the app feels like it belongs on a pickleball court without being a billboard for it.

### 04 — Neighborhood Scale
This is not a SaaS product. No landing page, no onboarding, no gamification. Open the app, pick a slot, done. Every feature earns its place.

---

## 2. Logo & Wordmark

PickASlot uses a text-only wordmark. No icon, no badge, no tagline. The name does the work.

- **"PickA"** — `#F0F7F2` (near-white)
- **"Slot"** — `#4ADE80` (court green)

### Rules
- Never alter the color split
- Never add a drop shadow
- Never place on a light background
- Minimum rendered size: 16px
- Nav size: 18px / weight 800 / tracking −0.02em

---

## 3. Color System

All colors derive from a deep court-green base. Surfaces layer progressively lighter. Status colors are the only vivid colors and carry strict semantic meaning.

### Surfaces

| Token | Hex | Usage |
|---|---|---|
| `--base` | `#0F2418` | App background |
| `--card` | `#162E20` | Cards, sections |
| `--elevated` | `#1C3828` | Available slots, modals, sheets |
| `--accent` | `#F0F7F2` | Reserve button, primary CTA |

### Borders

| Token | Hex | Usage |
|---|---|---|
| `--border` | `#2A4A35` | Primary borders, dividers |
| `--border2` | `#1F3D29` | Subtle separators |

### Text

| Token | Hex | Usage |
|---|---|---|
| `--txt1` | `#F0F7F2` | Primary text |
| `--txt2` | `#8AAF95` | Secondary text, body copy |
| `--txt3` | `#4A6B55` | Labels, hints, section headers |
| `--txt4` | `#2E4D38` | Disabled, ghost text |

### Status Colors
> Color is always paired with a text label. Never use color alone to communicate slot state.

| Token | Hex | Usage |
|---|---|---|
| `--avail` | `#4ADE80` | Available slots, confirmed bookings |
| `--avail-dim` | `rgba(74,222,128,.12)` | Available slot tint backgrounds |
| `--pend` | `#FBBF24` | Pending slots and bookings |
| `--pend-dim` | `rgba(251,191,36,.1)` | Pending tint backgrounds |
| `--taken` | `#F87171` | Taken slots, rejected bookings |
| `--taken-dim` | `rgba(248,113,113,.1)` | Taken tint backgrounds |

---

## 4. Typography

Two typefaces only. **Plus Jakarta Sans** for all UI and body text. **DM Mono** for data — codes, prices, durations, timestamps.

### Typefaces

| Typeface | Role | Weights |
|---|---|---|
| Plus Jakarta Sans | UI, headings, body, labels | 400 · 500 · 600 · 700 · 800 |
| DM Mono | Booking codes, prices, durations, timestamps | 400 · 500 |

### Type Scale

| Role | Size | Weight | Tracking | Case | Color |
|---|---|---|---|---|---|
| Display | 52px | 800 | −0.03em | — | `--txt1` |
| Heading 1 | 28px | 800 | −0.03em | — | `--txt1` |
| Heading 2 | 22px | 800 | −0.02em | — | `--txt1` |
| Heading 3 | 18px | 800 | −0.02em | — | `--txt1` |
| Body Large | 16px | 700 | −0.01em | — | `--txt1` |
| Body | 14px | 500 | — | — | `--txt2` |
| Body Small | 13px | 500 | — | — | `--txt2` |
| Label | 10px | 700 | 0.12em | UPPERCASE | `--txt3` |
| Hint / Italic | 12px | 500 | — | italic | `--txt3` |
| Nav Tab | 12px | 600 | 0.04em | — | `--txt3` / `--txt1` |
| Slot Time | 16px | 800 | −0.02em | — | varies by state |
| Section Label | 10px | 700 | 0.12em | UPPERCASE | `--txt3` |

### Mono Scale

| Role | Size | Weight | Tracking | Color |
|---|---|---|---|---|
| Booking Code (large) | 42px | 500 | 0.06em | `--avail` |
| Booking Code (input) | 18px | 500 | 0.06em | `--txt1` |
| Price / Duration | 11–13px | 400 | 0.02em | `--txt3` |
| Timestamp / Week | 11px | 400 | 0.02em | `--txt2` |

---

## 5. Spacing Scale

Base unit is 4px. All spacing is a multiple of 4.

| Token | Value | Usage |
|---|---|---|
| xs | 4px | Gap between icon and text |
| sm | 8px | Slot grid gap, small component gaps |
| md | 12px | Card internal gaps |
| lg | 16px | Section padding, page margin |
| xl | 20px | Nav padding, card padding |
| 2xl | 24px | Section top padding |
| 3xl | 32px | Confirmation screen padding |
| 4xl | 48–52px | Sheet and full-screen top padding |

---

## 6. Border Radius

| Value | Usage |
|---|---|
| 6px | Calendar day cells, small buttons, chevron icon backgrounds |
| 8px | Court info row icons, small icon containers |
| 10px | Week day cards, form inputs, small cards |
| 12px | Reservation cards, booking sheet CTA button |
| 14px | Slot cards, date trigger, reserve button, court info card |
| 20px | Court Hero card, nav tab pills |
| 22px | Bottom sheets (top corners only) |
| 50% | Check circles, status dots, week active day |

---

## 7. Motion

Motion is functional, never decorative. Every animation confirms an action or reveals new content.

### Timing Tokens

| Token | Value | Usage |
|---|---|---|
| fast | 130ms ease | Button press, hover states, color transitions |
| base | 180ms ease | Tab switches, card state changes, input focus |
| medium | 250ms ease | Chevron rotation, calendar day selection |
| reveal | 300ms cubic-bezier(.4,0,.2,1) | Calendar dropdown, accordion expand |
| sheet | 320ms cubic-bezier(.32,.72,0,1) | Bottom sheet slide up, confirm screen entry |
| bar | 300ms cubic-bezier(.32,.72,0,1) | Reserve bar slide up from bottom |
| stagger | 200ms ease · 30ms delay per item | Slot grid entrance on date change |

### Rules
- Active/pressed states: `scale(.96–.98)` + `opacity(.9)`
- Never use bounce easing
- Keep all animations under 350ms
- Slot cards stagger in from index 1 to 16, 30ms apart

---

## 8. Components

### Navigation Bar
- Position: sticky top, z-index 40
- Background: `--base`
- Padding: 18px 20px top
- Wordmark: 18px / 800 / tracking −0.02em
- Active tab: `--elevated` background, `--txt1` text, border-radius 20px
- Inactive tab: `--txt3` text, no background
- Max shell width: 430px

### Court Hero Card
- Margin: 16px from edges, 0 top
- Background: `--card`
- Border: 1px solid `--border`
- Border radius: 20px
- Padding: 20px
- Contains: court name, location, open/closed status, rate, hours, open slot count
- Background texture: subtle CSS court lines using `--border2` at 50% opacity
- Open status dot: `--avail` with `box-shadow: 0 0 8px rgba(74,222,128,.6)`

### Date Picker Trigger
- Full width card
- Background: `--card` / active: `--elevated`
- Border: 1px `--border` / open state: 1px `--avail`, bottom transparent
- Border radius: 14px / open: 14px 14px 0 0
- Icon container: 38×38px, `--avail-dim` bg, 10px radius
- Calendar dropdown attaches directly below, shares `--avail` border

### Week Day Cards
- 7-column grid, 5px gap
- Padding: 8px 4px 7px
- Border radius: 10px
- **Default:** `--card` bg, `--border` border
- **Today:** `--avail` border + text
- **Active:** `--avail` fill, `--base` text, glow shadow
- **Past:** opacity 0.3, no interaction
- Pip dot: 4×4px, shows `--border` color when day has slots

### Slot Cards
- 2-column grid, 8px gap
- Padding: 11px 12px 10px
- Border radius: 14px
- Line 1: time + AM/PM
- Line 2: status label + check circle (available/selected only)
- See [Section 9](#9-slot-states) for full state specs

### Reserve Bar
- Position: fixed bottom, slides up when ≥1 slot selected
- Padding: 12px 16px 36px (36px for home indicator)
- Background: gradient from `--base` to transparent
- Button: `--accent` fill, `--base` text, 14px radius
- Button padding: 17px 22px
- Box shadow: `0 8px 32px rgba(240,247,242,.15), 0 2px 8px rgba(0,0,0,.3)`
- Left: label (15px / 800) + sub (11px mono)
- Right: price (22px / 800) + arrow circle

### Bottom Sheet
- Position: fixed bottom, slides up on trigger
- Border radius: 22px 22px 0 0
- Border top: 2px solid `--avail`
- Background: `--card`
- Pull handle: 36×4px, `--border`, centered, 14px top margin
- Max height: 93dvh

### Form Input
- Background: `--elevated`
- Border: 1px `--border` default / `--avail` focused
- Focus ring: `0 0 0 3px rgba(74,222,128,.1)`
- Border radius: 10px
- Font: 16px / 500 / `--sans`
- Placeholder: `--txt3`

### Payment Options
- 2-column grid, 10px gap
- Default: `--elevated` bg, `--border` border, 10px radius
- Selected: `--avail` border + `box-shadow: 0 0 0 1px --avail` + `--avail-dim` bg

---

## 9. Slot States

Five states. Color is always accompanied by a text label. Available slots have a box shadow — the only slots that do. This is the primary interactive cue.

| State | Background | Border | Text Color | Interactive |
|---|---|---|---|---|
| Available | `--elevated` | `--border` + box-shadow | `--txt1` / `--avail` status | Yes — tap to select |
| Selected | `--avail` | `--avail` + glow shadow | `--base` | Yes — tap to deselect |
| Pending | `--pend-dim` | amber 15% opacity | `--pend` | No |
| Taken | `--taken-dim` | red 15% opacity | `--taken` | No |
| Past | transparent | `--border2` | `--txt3` | No — opacity 0.35 |

### Check Circle (Available / Selected only)
- Size: 20×20px, border-radius 50%
- Available: `--card` bg, `--border` border, checkmark hidden
- Selected: `rgba(15,36,24,.25)` bg, `rgba(15,36,24,.3)` border, checkmark visible

---

## 10. Booking Status

Three states for a booking on the My Booking page. Each uses a glowing status dot, color-coded label, and description.

| Status | Color | Dot Glow | Label |
|---|---|---|---|
| Confirmed | `--avail` `#4ADE80` | `rgba(74,222,128,.5)` | CONFIRMED |
| Pending | `--pend` `#FBBF24` | `rgba(251,191,36,.5)` | PENDING CONFIRMATION |
| Rejected | `--taken` `#F87171` | `rgba(248,113,113,.5)` | REJECTED |

### Status Banner Anatomy
- Border radius: 12px
- Padding: 14px 16px
- Dot: 8–10px circle with matching glow `box-shadow`
- Label: 11px / 700 / uppercase / tracking 0.08em
- Description: 12–13px / 500
- Background: matching status dim color
- Border: 1px solid matching status at 20% opacity

### Booking Card (My Booking page)
- Background: `--card`
- Border: 1px `--border`
- Border radius: 14px
- Sections separated by `1px solid --border`
- Booking code: DM Mono 28px / 500 / `--avail` / tracking 0.08em
- Slot rows: 15px / 700 `--txt1` + 11px mono `--txt3`
- Total: 20px / 800 / `--txt1`

---

*PickASlot Design System v1.0 · Sunrise Village Subdivision*
