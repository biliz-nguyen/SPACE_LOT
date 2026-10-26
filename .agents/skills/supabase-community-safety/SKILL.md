---
name: supabase-community-safety
description: Use when working on SPACE_LOT community uploads, Supabase authentication, database/storage, model metadata quality, RLS, API keys and configuration UI states.
---

# Community Parts + Supabase Safe UX

- Inspect current integration before altering API. Preserve local-only mode when backend is absent.
- Only `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` may be public frontend environment values. Never ship service-role keys, private R2 credentials, Meshy/Tripo/OpenAI provider secrets in Vite variables or repo files.
- Do not instruct users to paste secret keys into browser UI. Use a dedicated developer setup screen with concise status/next step and no raw error banners in the primary design.
- Keep file bytes in Storage; metadata and references in database. Use unique immutable paths, uploader IDs, file size/hash, model version and provenance. Hide unreviewed user uploads from public listing.
- Enforce authenticated upload, ownership checks, storage policies, DB RLS; backend validation of extension/MIME AND content inspection, limits, safe conversion, anti-abuse and quarantine/review before public use. A client-side size check is not security.
- Support model status: visual_only, estimated, datasheet_backed, measured, independently_verified. Never promote user claims to verified automatically.
- Fork project-level metadata without modifying shared originals; preserve original owner credit and license. Avoid unauthorized redistribution by requiring clear contributor license/ownership attestation and takedown path.
- Treat public GLBs as untrusted assets; do not execute embedded payloads. Use signed URLs for private models and short-lived access where applicable.
- Verify logged out, bad key, no project, rejected upload, missing model, upload pending, approval and revoked access UX paths.
