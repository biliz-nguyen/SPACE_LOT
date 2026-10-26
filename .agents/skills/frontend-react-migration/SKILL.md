---
name: frontend-react-migration
description: Use when migrating the existing SPACE_LOT JavaScript/Vite UI to React, TypeScript, Tailwind, shadcn/ui, and Zustand without breaking engineering modules or CAD/3D workflows.
---

# Incremental React Migration — SPACE_LOT

1. Read `package.json`, `src/`, `index.html`, storage schema, geometry adapter, `supabase/`, tests and current `git status` before editing. Inventory feature behavior, including current local changes that aren't on GitHub.
2. Branch safely with full awareness of uncommitted changes. NEVER reset hard, replace local tree from GitHub, force-push or delete working modules in bulk.
3. Keep Vite. Add React+TS and root mounting step by step. Maintain current engineering functions as tested pure JS/TS via typed adapters before changing algorithms. Preserve JSON schema and normalization X-forward/Y-right/Z-up engineering coords vs rendering Y-up.
4. Install Tailwind CSS v4 through `@tailwindcss/vite`, use appropriate source setup. Configure TypeScript `@/*` aliases for shadcn, verify version compatibility. Read official package docs instead of assuming CLI flags.
5. Prefer components: `AppShell`, `PartsCatalog`, `AssemblyViewport`, `InspectorPanel`, `AssetOperations`, `ImportWizard`, `MyHangar`, `AIWorkshop`, `CommunityLibrary`, `ConnectionStatus`.
6. Introduce Zustand only for shared UI/project state; keep scene transient engine state in viewer controllers or R3F hooks. Avoid double source-of-truth and rerendering the 3D scene on every hover.
7. Mount existing Three.js renderer with controlled lifetime/ref/disposal while migrating layout; only migrate to R3F once import, selection, explode, wiring and transforms remain equivalent.
8. Add keyboard navigation, suspense/loading, empty/failure states and proper accessibility in each migrated vertical slice. Test module before replacing old entry point.
9. Preserve local mode when Supabase isn't configured. Never disable core local build/preview when remote services are missing.
10. Produce working build, verified regression checklist and migration note; document unfinished areas, don't claim full migration based on compile only.
