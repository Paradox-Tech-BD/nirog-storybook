# ADR 0001: Model a prescription scan as evidence before it becomes a regimen

**Status:** Accepted • **Date:** 2026-08-18

## Context

The initial whitepaper model allows `OCRScan` to create a `Medicine` directly. This conflates source artifact, machine interpretation, user decision, catalog product, and patient regimen. It makes review, reprocessing, audit, partial acceptance, and safe correction difficult.

## Decision

Create a document aggregate containing pages/assets and source evidence. Store model stage outputs and match candidates immutably. Let an explicit review decision connect a prescription line to a catalog product or profile-private unresolved item. Only an accepted, validated review command creates a versioned regimen item and optional local schedule specification.

## Consequences

The schema has more entities and joins, but it supports retries, model upgrades, partial review, safety explanation, deletion lifecycle, and future interoperability. It also prevents an unreviewed model result from silently changing a patient’s medication plan.
