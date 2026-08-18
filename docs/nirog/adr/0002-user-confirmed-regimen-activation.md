# ADR 0002: Require user confirmation before medication schedule activation

**Status:** Accepted • **Date:** 2026-08-18

## Context

High product-match confidence does not validate a dose, frequency, route, duration, intended patient, or schedule representability. General VLM confidence values are not a safety guarantee.

## Decision

ML may preselect a candidate and label its evidence quality. The backend requires an authorized actor to review/save medication-critical fields before it activates a regimen schedule. Policy evaluation can block, require review, or recommend manual entry; it cannot create an active regimen.

## Consequences

The main user flow includes a confirmation step, but the system avoids the highest-risk silent automation failure. The confirmation step becomes a key quality telemetry point and feeds a controlled curation workflow.
