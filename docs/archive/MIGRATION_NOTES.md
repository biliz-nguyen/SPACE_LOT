# SPACE_LOT Premium UI v1 — migration notes

## Implemented

The default entry is now `src/main.tsx` → `App.tsx`. React owns the app shell, grouped catalog, viewport controls/metrics, inspector tabs, project actions, settings and reset dialogs. `src/lib/project.ts` gives those components typed access to the existing project store through `useSyncExternalStore`.

The geometry engine and CAD/business modules remain in JavaScript. They were adapted rather than rewritten. React does not own the GPU scene or the Asset Operations island's descendants. `App` creates and disposes the scene, subscribes once for scene updates, and tears down the studio/manifest controllers. The stage retains one renderer; the separate preview draws only when needed. The original page and original `src/main.js` are retained at `/legacy.html` during development for rollback/reference.

Vite remains the build tool, with `@vitejs/plugin-react` and `@tailwindcss/vite`. TypeScript uses strict checks for migrated TS/TSX files; existing JS is allowed without claiming a full JS type migration. `@/*` aliases and `components.json` support local shadcn-style components. Button/Dialog use CVA and Radix; Accordion/Tabs use Radix directly. Native input/select/range controls remain in the existing import controller.

Lucide icons, bundled Inter/Space Grotesk variable fonts and Motion status transitions are active. No image-generation dependency, paid UI kit, Next.js, new backend or external hosted font requirement was introduced.

## Preserved contracts

- Project JSON and browser storage keys/schema are unchanged.
- Engineering coordinates remain X-forward / Y-right / Z-up, in millimeters. Render coordinates remain Y-up. Canonical imported GLB uses meters; no engineering dimensions were changed for the new visual stage.
- Physics/validation algorithms and demo catalog/assembly data are unchanged.
- CAD worker, file/type/size policies, consent before save, source metadata, local byte persistence and explicit community contribution stay intact.
- Edge functions, RLS policies and storage ownership are unchanged. Client initialization now tolerates malformed/incomplete configuration so local mode still starts. A syntactically valid config is not presented as a verified live connection.

## Deliberate remaining work

1. Asset Operations remains an imperative controller with the new design system and progress indicator. Converting ImportWizard/MyHangar/AIWorkshop/Community into independent React components is a later slice; their functioning code has not been removed.
2. React Three Fiber/Drei were not introduced. The project skill explicitly requires renderer wrapping and parity first. Orbit/selection/move/explode/wiring/import now have browser evidence, but a separate R3F migration still needs a controlled feature comparison.
3. Zustand and TanStack Query were not added: the existing project store is still the sole state source, and there is no new remote cache requirement.
4. Real Supabase sign-in, pending/approved/rejected contribution, revoked access and Meshy generation need configured credentials/accounts and a live integration session. They were not exercised against production and no billable job was started.
5. Some decorative overlays remain below 12px and legacy Asset Operations includes original text action markers. No light theme was added.
6. Git branch/commit are unavailable until Git is installed and this extracted source directory is made a repository. The source backup and hash manifest are the recovery mechanism for this run.

## Windows PowerShell

Run from the directory containing `package.json`:

```powershell
cd C:\Users\Quỳnh\Documents\SPACELOT\SPACE_LOT
$env:Path = "C:\Program Files\nodejs;" + $env:Path
npm.cmd ci
npm.cmd run dev -- --host 127.0.0.1
```

Open the Local URL printed by Vite, normally `http://localhost:5173/`. Keep the terminal running. If dependencies or `vite.config.ts` change while an older Vite process is running, restart it to load the new plugins/aliases.

```powershell
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
npm.cmd exec playwright install chromium
npm.cmd run test:e2e
npm.cmd run capture:ui -- after
```

The environment used for this task requires build/dev/browser processes to run outside its filesystem sandbox because esbuild cannot enumerate parent directories inside that sandbox. This is a tooling restriction, not a required administrator setting for normal PowerShell use.

See `VALIDATION_PREMIUM.md`, `DESIGN_SYSTEM.md`, `SKILLS_USED.md` and `artifacts/changed-files.json` for evidence and file inventory. Push and deployment remain subject to the user's explicit approval.
