# Connection / Dating Product Family

## Canonical private relationship tool
- `tracey727/Gen-connect.1` — GENEVIEVE Connection & Relationship System V2.0. Local-first/private reflection and relationship-progression tool.

## Historical predecessors
- `tracey727/Gen-connect-` — earlier subset; reference only.
- `tracey727/Genevieve-real-connection-` — Real Connection Trial V1/V1.1; reference only.

## Separate public platform
- `tracey727/Dating` — GENEVIEVE Dating public/multi-user platform foundation. This is a separate product, not the next version of the private Connection app.
- `tracey727/Dating-app` — empty alias pointing to `Dating`.

The public Dating product requires identity, verification, messaging, abuse/safety controls, payments and multi-user privacy/security architecture that the local-first Connection app intentionally does not have. Do not merge the two runtimes merely because both involve relationships.

## Separate historical household prototype
- `tracey727/Relationship-` — small standalone household issue/task queue prototype. Not part of either Connection or Dating.

## Platform
Current deployment direction is GitHub + Cloudflare + Neon where server-side persistence is genuinely required. The current Connection app remains static/local-first and needs no database.
