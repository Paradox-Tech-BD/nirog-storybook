# ADR 0003: Treat the medicine catalog as a versioned, curated reference product

**Status:** Accepted • **Date:** 2026-08-18

## Context

The whitepaper proposes a shared alias loop that promotes a correction after three independent users choose the same mapping. Selection count alone does not establish product identity, strength/form compatibility, data rights, or clinical accuracy.

## Decision

Keep feedback and user-created medicine text private to the profile by default. Publish shared aliases and product facts only through a curated case with provenance, reviewer decision, catalog release, matching-index rebuild, and rollback support. Every imported fact retains its source, license, source version, checksum, and review status.

## Consequences

Knowledge growth is slower than unrestricted auto-promotion, but the shared index has an accountable quality boundary and supports correction/rollback when source data changes.

