# Premium UI audit — 2026-10-26 (Asia/Saigon)

## Source protection

The local source is the source of truth. This directory is an extracted source tree: no `.git` directory was present and `git` is not installed/on PATH. Therefore `git status`, a feature branch and a verified commit could not be created. No GitHub source was fetched over these files and nothing was pushed/deployed.

Before implementation, 56 files were copied to `../backups/premium-20261026-212219/`. `SHA256.csv` records the snapshot hashes. This includes original local documentation and the recovered prompt/skill kit. The existing `SPACE_LOT_v0.4.patch` and user downloads were not edited. Browser IndexedDB/localStorage were not cleared by tooling; tests use isolated browser contexts.

## Existing architecture and behavior

Vite 7, imperative DOM in `index.html`/`src/main.js`, Three.js `DroneScene`, mutable project store with subscribers, pure engineering helpers, schema validator and demo component/assembly JSON. CAD parsing uses Three loaders and OpenCascade WASM in a worker; normalization is meters/Y-up with a separate engineering coordinate adapter. IndexedDB holds source/GLB bytes and localStorage holds project/catalog descriptors.

`setupStudio` covers import, My Hangar, Meshy generation tasks and Supabase Community. Supabase Edge Functions verify the real Auth user, use immutable review storage and expose only approved community assets through RLS. No live backend was configured locally for this migration.

## Baseline visual findings

Baseline captured through headless Chromium with external requests blocked, then inspected:

1. Display fonts fall back to serif when Google Fonts cannot load, producing inconsistent headings and measurements.
2. Many meaningful hints, catalog metadata and diagnostic labels are 7–10px; they are difficult to read at normal desktop scale.
3. The 3D stage has limited visual hierarchy and muted lighting; dense overlapping labels compete with the assembly.
4. The right inspector puts assembly tree, selection, wiring and diagnostics into one long scroll. Common checks are hard to locate.
5. Asset Operations is a large, mostly gray modal with weak step hierarchy; it does not visually belong to a distinct Aerospace Studio system.

Baseline paths: `artifacts/screenshots/before-{desktop,compact,tablet,mobile}.png`, `before-import.png`.

## Preservation checklist

- Catalog grouping/search, add/select/remove components and editable positions.
- Orbit/zoom, real pointer selection/move, camera controls, exploded view, labels and prop discs.
- Wiring list/highlight/add/remove and engineering diagnostics/report export.
- Assembly JSON import/export/reset and schema validation.
- STL/OBJ/PLY/GLB and STEP parsing; explicit units/up-axis; embedded-resource validation.
- Import dimension consent, local GLB save, reload persistence and drag-to-scene.
- My Hangar, AI task adapter/credit consent and Community contribution/review paths retained.
- Missing configuration does not disable local assembly/import/export.

Original `data/`, `src/store.js`, `src/engineering.js`, `src/catalog.js`, `src/assets/{importer,policy,db,cad-worker}.js`, `supabase/` and existing regression tests are preserved byte-for-byte. The generated file-change inventory in `artifacts/changed-files.json` records the final comparison with the protected snapshot.
