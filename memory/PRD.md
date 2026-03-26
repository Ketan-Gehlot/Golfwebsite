# Golf Charity Subscription Platform - PRD

## Original Problem Statement
Build a Golf Charity Subscription Platform based on the provided PRD document. A subscription-driven web application combining golf performance tracking, charity fundraising, monthly prize draws, and charitable giving.

## Architecture
- **Frontend**: React 19 + Tailwind CSS + Shadcn UI + Framer Motion
- **Backend**: FastAPI + MongoDB (Motor) + JWT Auth
- **Integrations**: Stripe (test mode), SendGrid (emails)
- **Design**: Dark emerald/gold theme (Cormorant Garamond + Outfit fonts)

## User Personas
1. **Public Visitor**: Views platform, explores charities, initiates subscription
2. **Registered Subscriber**: Manages scores, selects charity, enters draws, claims winnings
3. **Administrator**: Manages users, draws, charities, verifies winners, views analytics

## Core Requirements
- JWT auth (signup/login)
- Stripe subscription checkout (monthly $9.99 / yearly $99.99)
- Golf score management (Stableford 1-45, rolling 5 scores)
- Charity system (directory, user selection, contribution %)
- Draw system (5/4/3-number match, random/algorithmic)
- Prize pool (40/35/25% split, jackpot rollover)
- Winner verification (proof upload, admin review, payout)
- Admin dashboard (analytics, user mgmt, draw mgmt, charity mgmt, winner verification)
- SendGrid email notifications

## What's Been Implemented (Feb 2026)
- [x] Full backend API with 30+ endpoints
- [x] JWT authentication with bcrypt password hashing
- [x] Stripe checkout integration (test mode)
- [x] SendGrid email notifications
- [x] Landing page with hero, stats, how it works, charity impact, prize pool sections
- [x] Signup/Login flows
- [x] Subscription plan selection with Stripe checkout redirect
- [x] Payment status polling and subscription activation
- [x] User Dashboard (scores, charity selection, draws, winnings, settings)
- [x] Charity Directory with search and filter
- [x] Admin Dashboard (analytics, users, charities, draws, winners)
- [x] Draw simulation and publish flow
- [x] Winner verification and payout tracking
- [x] Responsive mobile-first design
- [x] Dark emerald/gold premium theme
- [x] Seed data (5 charities + admin user)

## Test Credentials
- Admin: admin@golfcharity.com / admin123

## Prioritized Backlog
### P0 (Critical)
- All core features implemented

### P1 (Important)
- Independent donation option (not tied to subscription)
- Multi-country expansion support
- Email templates for draw results/winner notifications
- Subscription renewal/expiration handling cron

### P2 (Nice to Have)
- Team/corporate accounts
- Campaign module
- Social proof (testimonials)
- User profile image upload
- Draw countdown timer
- Advanced analytics charts
- Export reports (CSV/PDF)

## Next Tasks
1. Add independent donation flow for charities
2. Implement cron job for subscription expiration checks
3. Add rich email templates for notifications
4. User profile editing and avatar support
5. Advanced analytics with Recharts graphs in admin
