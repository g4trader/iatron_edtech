# Editorial Intelligence MVP

## Authority boundaries

- AI output is always `ai_draft`; it cannot approve or publish.
- Editors create/import/version and assign review, but cannot approve or publish.
- Mentors decide only assigned versions within an authorized specialty.
- Admins publish only the exact approved hash with a verified required reference.
- Students read published versions and may request consolidated review priority.
- RLS and security-definer RPCs enforce the same permissions as the API.

MFA remains a launch blocker for privileged accounts. The data model records
`mfa_required`, but enforcement depends on enabling the Supabase Auth MFA policy
for staging and production before inviting real mentors or administrators.

## Model

`learning_contents` is stable identity and taxonomy. Structured,
immutable `learning_content_versions` contains teaching material. References,
reviews, student requests, notifications, email events and audit events are
separate entities. A study activity may pin a version through
`plan_item_material_versions`, so an in-progress activity is not silently
replaced.

Review evidence points to the version ID and body hash. Publication moves the
stable content pointer to one approved version while preserving previous
versions as `superseded`.

## State flow

```text
draft | ai_draft
  → editorial_review
  → awaiting_mentor_review
  → mentor_approved | mentor_changes_requested | mentor_rejected
mentor_approved
  → published (admin only)
published
  → superseded (when a later approved version is published)
```

The frontend never sends arbitrary states. Each transition is an audited RPC.

## Surfaces

- `/app/plan/items/:id`: focused student study material and one dominant CTA.
- `/review`: authenticated mentor queue and version-specific decision.
- `/admin`: restricted editorial operations and publication.

The mentor email opens `/review/:versionId`; it never contains an approval
token. The page validates session, role, assignment, specialty and explicit
declaration.

## Email and notifications

Formal assignment creates one idempotent email event per version. Student
requests only increment the consolidated queue and never send individual email.
Resend delivery uses a server-only key and records provider ID or a safe failure
code. The staging runtime must provide `RESEND_API_KEY` and
`REVIEW_EMAIL_FROM=no-reply@<verified-domain>`.

## Deployment

Apply migration `202607250002`, run pgTAP/RLS, deploy the API with matching
`MIGRATION_BASELINE`, validate contracts/health, deploy the frontend, validate
email, then execute editor → mentor → admin → student E2E on
`https://go.iatron.com.br`.
