# GENEVIEVE Connection & Relationship System V2.0

**Canonical repository for the Connection & Relationship System.**

Repository family:
- `Gen-connect.1` — canonical; contains the complete core app plus the additional image/icon assets
- `Gen-connect-` — earlier subset/reference only

## What this build does

- Creates private connection records.
- Tracks the six-stage micro-progression.
- Logs real interactions rather than relying on chemistry or intensity.
- Calculates a private reciprocity score after at least three interactions.
- Implements Green / Yellow / Red traffic-light guardrails.
- Locks forward progression when a Yellow or Red guardrail is active.
- Records the psychological sobriety checks privately.
- Keeps budget information private and uses it only on-device.
- Provides Quick Hide, JSON backup/restore and offline support.
- Uses no account system, analytics or third-party libraries.

## Privacy boundary

This version stores data in browser `localStorage`. Data is not uploaded to a GENEVIEVE server, there is no multi-device sync, clearing site data can erase entries, and anyone with access to the same unlocked browser profile may be able to see them. Use the built-in export function for private backups.

## Deploy

This is a static application. ON TRACK by TRACE deployment standard for this build is GitHub + Cloudflare Pages.

Connect this repository to Cloudflare Pages and publish the repository root. No build command, database or environment variables are required for the current local-first version.

## Safety design

The app is a reflection tool, not a clinical diagnosis, lie detector, compatibility test or safety guarantee. Green, Yellow and Red are behavioural guardrails only; a step backwards is always allowed.

## Future production upgrade

A multi-user version would require authenticated accounts, privacy classification, encryption, explicit consent, abuse controls, audit logging, deletion/export controls, threat modelling and independent privacy/security review before sensitive shared data is introduced.
