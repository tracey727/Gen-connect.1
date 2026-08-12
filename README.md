# GENEVIEVE Connection & Relationship System V2.0

A deployable, local-first web app implementing the supplied GENEVIEVE Connection & Relationship System V2.0.

## What this build does

- Creates private connection records.
- Tracks the six-stage micro-progression.
- Logs real interactions rather than relying on chemistry or intensity.
- Calculates a private reciprocity score after at least three interactions.
- Implements Green / Yellow / Red traffic-light guardrails.
- Locks forward progression when a Yellow or Red guardrail is active.
- Implements the rule that three consecutive interactions with 100% user initiation or logistics pauses progression.
- Records the two psychological sobriety checks privately.
- Keeps budget information private and only uses it to filter activity ideas on-device.
- Never exposes loneliness, abuse history, isolation, living situation, income or budget as a public label.
- Provides a Quick Hide screen.
- Exports/imports a JSON backup.
- Works offline after the first successful load through a service worker.
- Uses no account system, no analytics and no third-party libraries.

## Important privacy limitation

This version stores data in the browser's `localStorage`.

That means:
- nothing is uploaded to a GENEVIEVE server;
- there is no multi-device sync;
- clearing browser/site data can erase entries;
- anyone who can open the same unlocked browser profile may be able to see the entries.

Use the built-in export function to keep a private backup. Store backups securely.

## Deploy to GitHub

1. Create a new GitHub repository.
2. Upload all files from this folder to the repository root.
3. Commit the files.

The repository root should contain:

```text
index.html
styles.css
app.js
service-worker.js
manifest.webmanifest
vercel.json
README.md
```

## Deploy to Vercel

1. Sign in to Vercel.
2. Choose **Add New → Project**.
3. Import the GitHub repository.
4. Leave Framework Preset as **Other** if Vercel does not detect a framework.
5. There is no build command and no environment variable required.
6. Deploy.

This is a static web app, so Vercel serves the files directly.

## Safety design

The app is a reflection tool, not a clinical diagnosis, lie detector, compatibility test, or safety guarantee.

- Green means the logged pattern currently contains reciprocal and calm indicators.
- Yellow means pause and observe.
- Red freezes progression.
- Attraction, loneliness, apology and intensity do not override a Red indicator.
- The app never tells the user a person is definitively “safe.”
- A step backwards is always allowed.

## Future production upgrade

If this becomes a multi-user product, do not simply put these private fields into a shared database. A production architecture should add, at minimum:

- authenticated private accounts;
- field-level privacy classification;
- encryption in transit and at rest;
- carefully separated public vs private data models;
- explicit consent controls;
- rate limiting and abuse prevention;
- audit logs for sensitive operations;
- data deletion/export controls;
- threat modelling for stalking, coercive control and account takeover;
- independent security/privacy review;
- clear rules preventing vulnerability-based discovery or matching.

The current local-first build deliberately avoids those server-side risks.
