# Premium UI v1 — verification record

Date: 2026-10-26, Asia/Saigon. Node `24.22.1`, Vite `7.3.7`, React `19.3.1`, TypeScript `7.0.2`, Tailwind `4.3.3`, Playwright `1.64.1`. Installed packages are locked in `package-lock.json`.

## Automated verification

| Command / check | Actual result |
| --- | --- |
| `npm.cmd run typecheck` | Pass, strict migrated TS/TSX files. Existing JS is not claimed fully typed. |
| `npm.cmd test` | 16/16 existing engineering, catalog and import-policy unit tests pass. |
| `npm.cmd run build` | Pass. Original CAD JS/WASM/licenses copied into production assets. |
| `npm.cmd run test:e2e` | 14/14 browser tests pass in Chromium with real WebGL via SwiftShader. |
| `node scripts/smoke-production.mjs` | Pass against built app on port 4173: STEP worker → 300 × 300 × 300 mm → dimension consent → IndexedDB → insertion → unknown-mass indication → reload persistence. |
| `npm.cmd run capture:ui -- after` | Four viewport sizes captured. Document widths equal viewport widths at 1440, 1280, 768 and 390. One main-scene canvas at every size. No page exceptions. |
| axe-core WCAG A/AA scan | No serious/critical violations on desktop, compact, tablet, mobile or mobile import dialog. This is an automated scan, not a claim of full accessibility certification. |
| Snapshot SHA-256 comparison | Core data, project store, engineering functions, catalog, import policies, IndexedDB, CAD worker, Supabase backend and all original tests match the protected source snapshot. |
| npm installation audit | 0 known vulnerabilities reported for installed dependency set at installation time. |

## Browser scenarios

Six existing tests were retained unchanged: STL dimension/consent/save/reload, STEP worker tessellation, malformed GLB/external glTF rejection, manifest search/mobile overflow, OBJ/PLY/GLB unit round-trip, drag imported mesh from hangar to scene.

Eight new tests cover: catalog keyboard search/add/position/remove/reload; exploded view leaves physical coordinates unchanged and wiring add/remove still works; assembly JSON round-trip and invalid input; settings/reset focus trap and Escape/focus return; disconnected Community/AI behavior; responsive panels and axe-core checks; no-WebGL local fallback; real canvas pointer selection/move that changes XY and preserves Z.

Initial development failures were corrected: a Vite process started before the new config was created needed a restart to recognize aliases/plugins; two icon-only controls needed accessible names at narrower widths; the accessibility scan now waits for dialog fade completion rather than measuring a transient transparent frame. Original physics assertions were not relaxed.

## Visual evidence reviewed

| View | Baseline | Premium |
| --- | --- | --- |
| Desktop 1440 × 900 | `artifacts/screenshots/before-desktop.png` | `artifacts/screenshots/after-desktop.png` |
| Compact 1280 × 800 | `artifacts/screenshots/before-compact.png` | `artifacts/screenshots/after-compact.png` |
| Tablet 768 × 1024 | `artifacts/screenshots/before-tablet.png` | `artifacts/screenshots/after-tablet.png` |
| Phone 390 × 844 | `artifacts/screenshots/before-mobile.png` | `artifacts/screenshots/after-mobile.png` |
| Import desktop | `artifacts/screenshots/before-import.png` | `artifacts/screenshots/after-import.png` |
| Import mobile | — | `artifacts/screenshots/premium-mobile-import.png` |
| Built STEP integration | — | `artifacts/screenshots/production-step-roundtrip.png` |

The images were opened and visually checked. Adjustments made after review include self-hosted font fallback repair, removal of conflicting legacy CSS from the React entry, clearer primary-button contrast, larger engineering metadata, closer studio camera composition, and reduced import spacing so controls are easier to reach. On mobile, long dialogs scroll within the viewport; full-page screenshots may also include the inactive page below the modal viewport.

## Limits and remaining work

- Three.js vendor chunk remains about 671kB minified (172kB gzip); Vite reports its >500kB advisory. React, Motion and application code are split into separate cacheable chunks. The warning is not suppressed.
- Supabase auth/real uploads/review/revocation and billable Meshy tasks were not run because no local runtime connection/account was available. Backend source preservation is verified; live feature success is not claimed.
- Asset Operations is styled and functional but still uses the original imperative controllers. R3F, further React decomposition, and a light theme remain outside this completed migration slice.
- No Git commit/branch was possible: Git is unavailable and the directory has no `.git`. Backup: `../backups/premium-20261026-212219/`, with `SHA256.csv`. No push or deployment was performed.

See `artifacts/changed-files.json` for the exact source file list, `SKILLS_USED.md` for actual skill application, and `MIGRATION_NOTES.md` for startup/test commands and architectural boundaries.
