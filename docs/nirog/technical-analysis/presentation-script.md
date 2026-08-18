# Presentation Script: Nirog Pre-Analysis and ML Integration

**Audience:** Product, engineering, clinical-advisory, and project stakeholders.  
**Suggested duration:** 10–12 minutes.  
**Purpose:** Explain the completed pre-analysis, the ML integration boundary, and the transition into technical architecture.

## Cover

**Title:** Nirog: From Pre-Analysis to a Safe ML-Assisted Backend  
**Subtitle:** Medication management, evidence-preserving OCR, and human-confirmed action

**Speaker script:**

“Nirog is a medication-management system designed to make prescription information easier to organize, review, and follow. The pre-analysis phase established the product boundaries before selecting implementation details. Today, I will summarize the core product model, explain how ML fits into the system safely, and show how those decisions now guide our technical backend architecture.”

## Slide 1

**Title:** The Product Problem Is Medication Follow-Through

**On slide:**

- Prescriptions are often handwritten, fragmented, and hard to turn into daily action.
- Users need a trustworthy way to track medicines, schedules, reminders, doses, and refills.
- The system must support both self-management and carefully shared caregiver access.

**Speaker script:**

“The core problem is not simply reading a prescription. The real product challenge is converting uncertain source material into a medication plan that people can understand, confirm, and follow. Nirog therefore combines manual entry with prescription-assisted workflows, reminders, dose tracking, refill advisories, and multi-profile support.”

## Slide 2

**Title:** Pre-Analysis Established Clear Product Boundaries

**On slide:**

- A user account is not the same as a patient profile.
- Shared catalog facts are not the same as a patient’s regimen.
- OCR evidence is not the same as an accepted medication instruction.
- Dose logs are historical events, not editable schedule definitions.

**Speaker script:**

“The most important outcome of pre-analysis was separating concepts that may look similar in a simple application. A user can manage more than one patient profile. A catalog product is a shared reference fact, while a regimen is a private instruction set for one profile. And an OCR result is evidence to review, never an instruction that automatically becomes active.”

## Slide 3

**Title:** The Backend Is Organized by Ownership

**On slide:**

- User Management governs accounts, profiles, access, consent, preferences, and devices.
- Medicine Catalog governs shared product facts, aliases, sources, curation, and releases.
- Prescription and ML Evidence governs documents, scans, extraction, candidates, and review.
- Regimen and Adherence govern confirmed medication plans, schedules, reminders, and dose events.

**Speaker script:**

“Rather than organizing the backend around screens, we organized it around ownership. Every subsystem has one vocabulary, one set of write rules, and one family of tables. This prevents the catalog from becoming a patient record, prevents the OCR pipeline from creating medication plans directly, and makes future scaling possible without redesigning the domain model.”

## Slide 4

**Title:** ML Assists Interpretation—It Does Not Prescribe

**On slide:**

- Capture and preserve the original prescription as restricted evidence.
- Produce text, fields, and medicine candidates with source links.
- Use calibrated confidence to choose the review experience.
- Require an authorized user decision before a regimen is created.

**Speaker script:**

“The ML pipeline is an assistant to interpretation. It can read handwriting, organize the text, recognize possible medicine names, and retrieve catalog candidates. But ML output is never treated as a prescription decision. The system uses confidence to decide whether to show a preselection, require review, or recommend manual entry. Only an authorized user review can activate a medication regimen.”

## Slide 5

**Title:** Evidence Must Outlive the Model Run

**On slide:**

- Raw document, derived image, OCR lines, fields, candidates, and decisions remain linked.
- Every stage records model, prompt, preprocessing, catalog, index, and policy versions.
- Historical results remain explainable even after future releases change.

**Speaker script:**

“A trustworthy pipeline needs more than a final answer. Nirog preserves the chain of evidence: the original document, the processed derivative, the recognized text, the extracted field, the product candidates, and the eventual user decision. It also records which model, prompt, preprocessing method, catalog release, search index, and confidence policy produced that result. This is what makes the system explainable and reversible.”

## Slide 6

**Title:** Confidence Routes Review, Not Treatment

**On slide:**

- `ready_for_review`: show evidence, candidate, and confirmation controls.
- `review_required`: ask for edits when critical fields are uncertain.
- `manual_entry_recommended`: keep evidence but avoid unreliable automation.
- `failed`: explain safe retry conditions without exposing internals.

**Speaker script:**

“Confidence is valuable, but only when used carefully. Nirog does not convert a high score into an active medicine. Instead, the policy routes the result into the right review experience. This keeps the user informed, makes uncertainty visible, and ensures that the system fails safely when evidence is incomplete or ambiguous.”

## Slide 7

**Title:** Catalog Learning Requires Curation

**On slide:**

- A private correction may improve the user’s own experience.
- Shared aliases and generic mappings require evidence and curator approval.
- Published catalog releases are immutable and indexable.
- A later correction creates a successor release, not a silent rewrite.

**Speaker script:**

“User feedback is valuable, but feedback is not automatically clinical truth. A user may correct a medicine name for their own profile. If that correction could benefit everyone, it enters a curation workflow with evidence, a reviewer decision, a release, and a rollback path. This protects the shared medicine catalog from uncontrolled or accidental changes.”

## Slide 8

**Title:** Asynchronous Work Is Isolated and Traceable

**On slide:**

- The API commits user commands quickly and publishes reliable events through an outbox.
- Dedicated workers process ML, catalog imports, notifications, schedules, sync, and maintenance.
- Retries are idempotent; failure routes to safe fallback or operator review.

**Speaker script:**

“The backend uses asynchronous workers for expensive or delayed work. The API does not wait for a model, a push provider, or a catalog index build. Instead, it commits the user command and a corresponding event in one transaction. Workers consume that event safely, and every action has retry, duplicate handling, and failure visibility.”

## Slide 9

**Title:** Technical Analysis Turns Principles into Controls

**On slide:**

- Profile-scoped authorization is checked on every resource action.
- Catalog releases and ML policy releases make outputs reproducible.
- Queue workers use idempotency, retry budgets, and dead-letter handling.
- Operations track latency, uncertainty, correction rates, backlogs, and security signals.

**Speaker script:**

“We have now moved from pre-analysis into technical analysis. The technical work converts product principles into database constraints, API contracts, worker queues, authorization checks, versioned release artifacts, and tests. The goal is not complexity for its own sake. The goal is a system that remains reliable when devices go offline, workers retry, models change, catalog data evolves, or access permissions are revoked.”

## Slide 10

**Title:** The Next Step Is Controlled Implementation

**On slide:**

- Build the modular backend foundation and authorization policy first.
- Implement catalog release and profile-regimen boundaries before OCR automation.
- Add asynchronous evidence processing behind review-only output contracts.
- Measure quality and safety before widening automation.

**Speaker script:**

“The implementation sequence follows risk. We first establish identity, profile access, and core regimen boundaries. Next, we implement the release-bound catalog. Then we introduce asynchronous evidence processing that can produce review payloads but cannot activate therapy. Finally, we measure performance, uncertainty, and correction behavior before increasing automation. This sequence lets Nirog become useful early while preserving safety and future flexibility.”

## Slide 11

**Title:** Closing: A System That Helps Without Overreaching

**On slide:**

Nirog turns uncertain prescription evidence into transparent, user-confirmed medication management.

**Speaker script:**

“Nirog’s value comes from combining practical medication workflows with carefully bounded intelligence. The system can help users understand and organize a prescription, but it keeps the person in control of what becomes an active medication plan. The pre-analysis and ML integration guidance now give us a stable foundation for technical implementation.”
