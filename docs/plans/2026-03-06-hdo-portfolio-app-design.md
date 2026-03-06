# HDO Model Portfolio — Web App Design

## Overview
Convert the HDO Dividend Model Portfolio Excel spreadsheet into a full-stack web application with user auth, subscription payments, and live stock prices.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL (Replit native)
- **ORM**: Prisma
- **Auth**: NextAuth.js (Auth.js) — email/password + OAuth
- **Payments**: Square Payments API (subscriptions)
- **Prices**: Yahoo Finance API (server-side proxy)
- **UI**: Tailwind CSS + shadcn/ui
- **Deploy**: Replit

## Pages
1. `/dashboard` — Model Portfolio (Core 1, Core 2, Conservative tabs)
2. `/preferreds` — Preferred Stocks (4 category tabs)
3. `/bonds` — Traditional Bonds
4. `/dividends` — Dividend Tracker (3-panel layout + baby bonds)
5. `/sold` — Sold Securities (year tabs 2017-2026)
6. `/earnings` — Earnings Calendar (by date / by ticker)
7. `/tax` — Tax Info (alphabetical / by tax class)
8. `/log` — Update Log (searchable)
9. `/login`, `/register`, `/subscribe`, `/account` — Auth & payments

## Database Tables
- users, subscriptions
- securities, price_cache, dividend_data
- preferreds, bonds
- dividend_events, baby_bond_divs
- sold_securities, earnings_calendar
- tax_info, update_log

## Computed Fields (app layer)
- Div Yield = annual_div / live_price
- Below Buy Under = live_price < buy_under
- YTD Gain = (price - jan1_price + earned_ytd) / jan1_price
- Total Gain = (price - alert_price + earned_total) / alert_price
- Accrued Interest = time-prorated dividend
- Yield to Call/Maturity = YIELD equivalent

## Key Features
- Auto-refresh prices every 5 minutes
- Green highlight rows below buy-under
- Search, sort, filter on all tables
- Full CRUD on all security types
- Square subscription gating
- Responsive mobile layout
