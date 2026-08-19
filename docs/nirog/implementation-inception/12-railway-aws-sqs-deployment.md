# Railway Deployment with AWS SQS

**Status:** deployment configuration and validation implemented  
**Applies to:** Nirog Core API, dispatcher, and later ML-worker services deployed on Railway

## The two different kinds of values

The SQS queue URLs are **identifiers**, not secrets. The AWS IAM access key and secret access key are **credentials** that permit the Railway service to use those identifiers. Cloudflare R2 credentials are a separate object-storage concern and must not be reused for SQS.

| Value | Is it secret? | Where it comes from | Railway use |
|---|---:|---|---|
| `SQS_EVENT_QUEUE_URL` | No | AWS Console → Amazon SQS → `nirog-events` → queue URL | Service variable |
| `SQS_EVENT_DLQ_URL` | No | AWS Console → Amazon SQS → `nirog-events-dlq` → queue URL | Service variable |
| `EVENT_AWS_REGION` | No | Region selected for the queues | Service variable |
| `AWS_ACCESS_KEY_ID` | Yes | IAM user access key for the Nirog runtime identity | **Sealed** service/shared variable |
| `AWS_SECRET_ACCESS_KEY` | Yes | IAM user secret access key, shown once at creation | **Sealed** service/shared variable |
| `AWS_SESSION_TOKEN` | Sometimes | Only for temporary STS credentials | Sealed variable when used |
| `EVIDENCE_R2_*` credentials | Yes | Cloudflare R2 API token scoped to the evidence bucket | Separate **sealed** variables |

> **Do not put AWS or R2 credentials in Git, a Flutter application, a `NEXT_PUBLIC_*` setting, or a Scalar request.** Railway provides service and shared variables as runtime environment variables, while sealed values cannot be retrieved through the Railway UI or API after being sealed. [1]

## One-time AWS setup

Create the queues in your chosen AWS region, normally the same region selected in `EVENT_AWS_REGION`.

```text
nirog-events-dlq          # dead-letter queue
nirog-events              # main event queue, configured to redrive failures to the DLQ
```

Copy each queue’s **Queue URL** from the Amazon SQS console. It will have this ordinary identifier format:

```text
https://sqs.<region>.amazonaws.com/<aws-account-id>/nirog-events
```

The AWS account ID and queue URL are not credentials. They become usable only when a caller has an IAM policy authorizing an SQS action on the queue ARN. AWS documents `sqs:SendMessage` as the required permission for publishing to a specific queue. [2]

Create a dedicated IAM user or workload identity named for the deployment, for example `nirog-railway-runtime-production`. Generate an access key only for that identity, turn on MFA for human administrative identities, and do not use the AWS root access keys. Railway does not run inside AWS, so an IAM role attached to an EC2/ECS task is not available by default; the initial Railway deployment uses standard `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` service secrets.

## Least-privilege policies

The **Core API/dispatcher publisher** only needs to send events to `nirog-events`. Attach this customer-managed policy to the Railway runtime IAM identity, replacing the region and account ID.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublishNirogCommittedEvents",
      "Effect": "Allow",
      "Action": ["sqs:SendMessage"],
      "Resource": "arn:aws:sqs:<region>:<aws-account-id>:nirog-events"
    }
  ]
}
```

The later **worker consumer** needs a separate IAM identity with only the actions required to receive and delete its own messages. Do not give the API publisher worker-consumer permissions, and do not give either identity `sqs:*`.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ConsumeNirogEvents",
      "Effect": "Allow",
      "Action": [
        "sqs:ReceiveMessage",
        "sqs:DeleteMessage",
        "sqs:ChangeMessageVisibility",
        "sqs:GetQueueAttributes"
      ],
      "Resource": "arn:aws:sqs:<region>:<aws-account-id>:nirog-events"
    }
  ]
}
```

AWS supports resource-scoped `SendMessage`, `ReceiveMessage`, `DeleteMessage`, `ChangeMessageVisibility`, and `GetQueueAttributes` permissions on the corresponding queue ARN. [2] [3] Validate each policy with IAM Access Analyzer before attaching it. [3]

## Railway service variables

In Railway, open the **Nirog Core API service → Variables**. Add the non-secret values normally, then use the three-dot menu to **Seal** the credential values. Railway stages variable changes for review and deployment, so the new values apply only after the configuration is deployed. [1]

```env
NIROG_APP_ENV=production
PORT=${{PORT}}

# AWS SQS event transport
EVENT_AWS_REGION=us-east-1
EVENT_AWS_ENDPOINT_URL=
EVENT_AWS_CREDENTIAL_SOURCE=environment
SQS_EVENT_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/<AWS_ACCOUNT_ID>/nirog-events
SQS_EVENT_DLQ_URL=https://sqs.us-east-1.amazonaws.com/<AWS_ACCOUNT_ID>/nirog-events-dlq
AWS_ACCESS_KEY_ID=<seal-this>
AWS_SECRET_ACCESS_KEY=<seal-this>

# Cloudflare R2 object storage remains separate
EVIDENCE_STORAGE_DRIVER=r2
EVIDENCE_R2_ENDPOINT=https://<CLOUDFLARE_ACCOUNT_ID>.r2.cloudflarestorage.com
EVIDENCE_R2_REGION=auto
EVIDENCE_R2_BUCKET=nirog-evidence
EVIDENCE_R2_ACCESS_KEY_ID=<seal-this>
EVIDENCE_R2_SECRET_ACCESS_KEY=<seal-this>
EVIDENCE_PRESIGN_MAX_SECONDS=300

# Existing Core requirements
DATABASE_URL=<Railway PostgreSQL connection URL>
POSTGRES_URL=<Railway PostgreSQL admin/migration connection URL>
RATE_LIMIT_REDIS_URL=<managed Valkey or Redis TLS URL>
CLERK_PUBLISHABLE_KEY=<Clerk publishable key>
CLERK_JWT_KEY=<Clerk JWT public key>
CLERK_AUDIENCE=nirog-mobile-api
CLERK_AUTHORIZED_PARTIES=https://<Nirog-Web-domain>
```

The `EVENT_AWS_CREDENTIAL_SOURCE=environment` setting activates Nirog’s startup validation that both standard AWS environment credentials exist. The AWS SDK then resolves those standard variable names; Nirog does not invent a second proprietary credential format.

If the API and dispatcher are separate Railway services, use **Railway Shared Variables** for the sealed AWS/R2 values and non-secret queue identifiers, then reference them in each service. Keep service-specific database URLs and ports scoped to their relevant services. Railway supports shared variables and service-level reference variables for that purpose. [1]

## Local versus Railway values

| Concern | Local Docker Compose | Railway production |
|---|---|---|
| SQS endpoint | `http://localstack:4566` | Empty endpoint override; AWS public API used |
| SQS credential source | `auto` | `environment` with sealed AWS keys |
| SQS queue URL | LocalStack path URL | AWS SQS queue URL copied from console |
| R2 storage | `disabled` by default | `r2` with sealed R2 keys |
| Rate-limit store | Compose Valkey | Managed Redis/Valkey TLS URL |

## Operational sequence

First create the AWS queues and DLQ redrive relationship. Second create the dedicated IAM runtime identity and attach the publisher policy. Third create the R2 bucket and its separate bucket-scoped token. Fourth add the variables to Railway and seal every access/secret key. Fifth deploy Core, inspect `/health/live`, open `/reference/`, and verify that the API can publish only after a real domain slice emits an outbox event. Finally, provision a separately permissioned dispatcher/worker service before enabling message consumption.

## References

[1] [Railway — Using Variables](https://docs.railway.com/variables)

[2] [AWS — Amazon SQS API permissions reference](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-api-permissions-reference.html)

[3] [AWS — Identity-based policy examples for Amazon SQS](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-basic-examples-of-iam-policies.html)
