# Reminder Delivery and Device State Workflow

## 1. Purpose

The reminder workflow turns a valid future dose occurrence into a time-bounded notification intent, selects eligible device installations, attempts provider delivery through a scoped adapter, records outcome, and supports user acknowledgment/snooze. It deliberately does not convert delivery into a dose event.

## 2. Delivery sequence

```mermaid
sequenceDiagram
  participant Projector as Schedule projector
  participant DB as adherence/platform tables
  participant Outbox as Outbox
  participant Worker as Notification worker
  participant Device as Device installation policy
  participant Push as FCM/APNs adapter
  participant App as Flutter client

  Projector->>DB: Create eligible notification intent with occurrence/version/expiry
  Projector->>Outbox: Commit notification.intent_created
  Outbox->>Worker: Deliver event at least once
  Worker->>DB: Claim ledger; re-read occurrence, intent, regimen, profile/device state
  Worker->>Device: Select active authorized installations and notification preference
  alt intent valid and device eligible
    Worker->>DB: Persist provider intent with deterministic key
    Worker->>Push: Send minimal payload under provider adapter policy
    Push-->>Worker: Accepted/failed/unknown outcome
    Worker->>DB: Record delivery state and follow-on event
    Worker-->>App: Push notification if provider/device delivers
  else expired, stopped, revoked, or duplicate
    Worker->>DB: Mark no-op/cancelled/superseded
  end
```

## 3. Delivery state model

| State | Meaning | Does it prove a dose? |
|---|---|---|
| `intent_created` | A schedule policy requested a possible notification. | No. |
| `eligible` | Current occurrence/regimen/device/preference conditions permit attempt. | No. |
| `sent_to_provider` | Provider accepted a request or intent was recorded. | No. |
| `provider_unknown` | Connection failed after possible provider acceptance; reconcile. | No. |
| `delivered_or_opened` | Provider/device/application reported delivery/open where available. | No. |
| `acknowledged` | User dismissed/snoozed/acknowledged notification. | No; acknowledgement is not taken. |
| `expired/cancelled/superseded` | Intent no longer eligible. | No. |
| `dose_recorded` | Separate user action recorded through adherence command. | Yes, as self-reported event. |

## 4. Privacy-safe notification rules

| Context | Payload rule |
|---|---|
| Locked-screen/untrusted device state | use generic reminder wording or policy-selected minimal detail. |
| Caregiver installation | include only information permitted by grant/notification privacy setting. |
| Provider adapter | use device token reference and minimal notification fields; no raw prescription/evidence. |
| Snooze | create a new bounded intent with source occurrence/snooze policy; do not mutate dose event. |
| Expired occurrence | do not deliver late reminder that may confuse medication timing. |

## 5. Provider failure/reconciliation

Temporary provider/rate failures retry only while the occurrence and intent remain relevant and before expiry. A lost response after possible acceptance becomes `provider_unknown` and uses deterministic intent/provider keys to reconcile before resend. Invalid token/device failures revoke or mark the installation invalid and do not cause an unbounded notification retry loop. A stopped regimen, profile revocation, cancellation, or changed occurrence version causes safe no-op/cancel.

## 6. User action after notification

The notification deep link opens the authorized profile/occurrence context. The client may present “taken,” “skip,” “snooze,” or “view plan” according to policy. A dose button invokes the ordinary dose-event command with idempotency and current capability; it does not trust the notification payload as lasting authorization.

## 7. Acceptance tests

Test duplicate outbox delivery, stopped regimen after intent creation, expired intent, invalid push token, provider unknown outcome, caregiver privacy rule, notification open without dose, dose action after notification, and late device acknowledgment.

