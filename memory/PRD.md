# The Kinetic - Golf Charity Subscription Platform PRD

## Original Problem Statement
Build a Golf Charity Subscription Platform. Complete UI redesign to match "The Kinetic" design system with dark surface theme, cyan/purple/gold accents, Inter font, Material Symbols icons, bento grid layouts, sidebar navigation, and bottom mobile nav.

## Architecture
- **Frontend**: React 19 + Tailwind CSS + Material Symbols + Framer Motion
- **Backend**: FastAPI + MongoDB (Motor) + JWT Auth
- **Integrations**: Stripe (test mode), SendGrid (emails)
- **Design**: Dark surface (#131313) + Cyan primary (#4cd7f6) + Purple secondary (#d0bcff) + Gold tertiary (#ffb95f)

## User Personas
1. Public Visitor: Views platform, explores charities, initiates subscription
2. Registered Subscriber: Manages scores, selects charity, enters draws
3. Administrator: Manages users, draws, charities, verifies winners

## What's Been Implemented (Feb 2026)
- [x] Complete UI redesign matching "The Kinetic" templates
- [x] Landing page with hero, stats, bento grid ecosystem, charity impact, pricing
- [x] Sidebar navigation for authenticated pages
- [x] Bottom mobile navigation
- [x] Admin dashboard (Platform Control, Draw Engine, Verification Queue, Subscriber Directory)
- [x] User dashboard (Impact Dashboard, bento grid, score entry 5-inline inputs, draw history)
- [x] Charity directory (featured hero, search, filter chips, card grid)
- [x] Subscription plans (Standard Kinetic / Elite Kinetic)
- [x] Full backend API with 30+ endpoints
- [x] JWT auth, Stripe checkout, SendGrid emails
- [x] Score management (Stableford 1-45, rolling 5)
- [x] Draw system (random/algorithmic, jackpot rollover)
- [x] Winner verification and payout tracking

## Test Credentials
- Admin: admin@golfcharity.com / admin123

## Prioritized Backlog
### P1
- Independent donation flow
- Subscription expiration cron
- Rich email templates
- Advanced analytics charts (Recharts)

### P2
- Team/corporate accounts
- Campaign module
- User profile image upload
- Draw countdown timer
