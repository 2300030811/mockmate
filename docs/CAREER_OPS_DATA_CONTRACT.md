# Career Ops Data Contract

This document defines the canonical data contract for MockMate Career Ops.

## Purpose

Career Ops data is consumed by tracker actions, cron routes, dashboard insights, and analytics utilities. Canonical values must stay consistent across:

- database constraints and migrations
- server actions and cron routes
- analytics utilities and tests
- README and ops scripts

## Canonical Application Status Values

Application statuses are canonicalized to this set:

- evaluated
- applied
- responded
- interview
- offer
- rejected
- discarded
- skip

Source of truth:

- lib/career-ops/status.ts

Notes:

- Aliases may be accepted at input boundaries but must normalize into canonical values.
- Terminal statuses are: offer, rejected, discarded, skip.

## Canonical Posting Liveness Values

Job posting statuses are canonicalized to this set:

- active
- expired
- uncertain

Sources of truth:

- lib/career-ops/liveness.ts
- app/api/cron/liveness/route.ts

## Canonical Role Archetypes

Role archetypes are canonicalized to this set:

- fullstack
- backend
- frontend
- data_ml
- devops
- mobile
- security
- qa
- product
- platform
- unknown

Source of truth:

- lib/career-ops/dimensions.ts

## Canonical Primary Blockers

Primary blockers are canonicalized to this set:

- stack-mismatch
- seniority-mismatch
- domain-mismatch
- delivery-gap
- unknown

Source of truth:

- lib/career-ops/dimensions.ts

## Blocker Tag Rules

- Tags are normalized to lowercase kebab-case.
- Non-alphanumeric characters are stripped except spaces and hyphens.
- Duplicate tags within a single application are deduplicated for analytics frequency.
- Percentages are computed against total tracked applications for the analyzed scope.

Sources of truth:

- lib/career-ops/dimensions.ts
- lib/career-ops/patterns.ts

## Cadence Rules

Follow-up cadence is derived from status and follow-up count.

Base cadence days by status:

- evaluated: 3
- applied: 5
- responded: 4
- interview: 2
- terminal statuses: null next follow-up

Follow-up count offsets:

- 0: +0 days
- 1: +1 day
- 2: +2 days
- >=3: +4 days

Sources of truth:

- lib/career-ops/cadence.ts
- lib/career-ops/recompute.ts

## Cron Auth Contract

Each endpoint uses endpoint-specific secrets. In production, missing secret is a server misconfiguration.

- /api/cron/scan uses CRON_SCAN_SECRET
- /api/cron/liveness uses CRON_LIVENESS_SECRET
- /api/cron/cadence uses CRON_CAREER_OPS_SECRET

Header precedence:

1. Authorization: Bearer <secret>
2. x-cron-secret: <secret>

Sources of truth:

- app/api/cron/scan/route.ts
- app/api/cron/liveness/route.ts
- app/api/cron/cadence/route.ts

## Required Migration Files

Career Ops requires these migrations to exist and be applied:

- lib/db/migrations/add_career_ops_tracking.sql
- lib/db/migrations/add_career_ops_pattern_dimensions.sql

## Change Management

When introducing new status-like dimensions or changing canonical values:

1. Update source-of-truth utility modules.
2. Update DB constraints/migrations.
3. Update analytics logic and tests.
4. Update this contract document.
5. Run verify and doctor scripts before merge.
