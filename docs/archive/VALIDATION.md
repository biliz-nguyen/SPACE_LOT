# SPACE_LOT v0.4 · Actual validation

Date: 26 October 2026.

## Results

- Production build: PASS (`npm run build`). OpenCascade JS/WASM and its license notices are copied into the build. Vite reports a size advisory for the initial JavaScript bundle (~975 kB uncompressed / 260 kB gzip); this is not a build failure.
- Unit suite: **16 passed**, covering the existing catalog/engineering rules plus malformed imports, file limits, blocked external dependencies and contribution metadata validation.
- Chromium browser suite: **6 passed**. The saved Playwright run manifest reports `status: passed` and no failed tests.
  1. STL: exact 20 × 30 × 40 mm bounding box, required confirmation before save, IndexedDB hangar persistence, scene insertion and reload restoration.
  2. Real STEP cube: OpenCascade worker processing and exact 300 × 300 × 300 mm bounding box.
  3. Malformed GLB and external glTF URI: rejected; external host was never requested.
  4. Assembly manifest filtering, mobile workspace width and import dialog containment at 390 px.
  5. OBJ in centimeters and PLY in millimeters both yield 20 × 30 × 40 mm; normalized GLB round-trip preserves those dimensions and four triangles.
  6. A saved mesh is dragged from the local hangar into the 3D scene and creates the 19th assembly instance.
- Manual screenshot review: desktop workspace, mobile workspace and STEP preview were inspected. The final neutral catalog color and incomplete-CG label refinements were subsequently build-checked.
- `git diff --check`: PASS.

## Live Supabase checks

- Project FLYPLOT is ACTIVE_HEALTHY. The three tables, RLS policies and private `space-lot-models` bucket were created.
- `community` and `generate-model` Edge Functions deployed successfully. Both reject unauthenticated requests with HTTP 401.
- Transactional database test: anonymous role sees only approved metadata; owner can read their pending submission; anonymous/owner writes and self-approval are denied; spoofing editable `user_metadata.role` grants no admin visibility; trusted `app_metadata` admin can inspect pending metadata. All synthetic users and model records were rolled back.
- Security advisor: **no findings**.
- Performance advisor: no warnings after policy optimization. It only lists unused-index informational notices for the new, empty tables.
- Final database count: **0 registered users, 0 community models, 0 requests, 0 generation jobs**. The storage bucket remains private.

## Prerequisites and limits

- **Owner account is not assigned.** No Auth account exists yet. Register and verify the intended account, then assign `space_lot_admin` using the documented SQL. No identity was guessed.
- **No provider key was supplied.** Meshy generation was not billed or executed. The authenticated create/poll/download code is deployed, but paid provider generation and authenticated contribution/approval end-to-end flows still require a real account/key and have not been exercised live.
- IGES, BREP, separate glTF dependencies and OBJ textures are implemented but were not each tested against a real-world fixture in this run. Proprietary CAD formats remain explicitly unsupported.
- Browser screenshots are internal QA artifacts and are not included in the source package.
- A full multi-device project archive is not implemented; assembly JSON references local custom assets. Export GLBs separately and retain the source files.
- GitHub connection reports `push: false`; branch creation returned 403. No remote branch, PR or merge was created. The deliverable contains full source and a Git patch against source commit `17e79d4466d203805161183ea0b9d80c318b1714`.
