# CODEX TASK — SPACE_LOT / AEROGUIDE PREMIUM UI MIGRATION

You are acting as a **senior product designer, UI art director, frontend architect, 3D interaction engineer, and QA engineer**. You have access to my existing local VS Code repository **SPACE_LOT**. Implement a functional, visually exceptional redesign of the real app — not a static design concept.

## Context and critical constraints

- This is an AeroGuide 3D Drone Builder / SPACE_LOT web app with 3D Assembly, import of GLB/other 3D/CAD formats, My Hangar, AI Workshop, Community, engineering diagnostics, wiring, and Supabase integration in progress.
- **The LOCAL working tree is the source of truth.** GitHub main can be older. Do not replace my current files with a legacy v0.2 example or erase uncommitted work.
- Preserve current business/engineering logic, geometry transforms, state, project serialization, and all successful workflows. Distinguish visual-only models and estimated metadata from datasheet-backed or verified specs.
- Keep Vite as build tool. Do not introduce Next.js, an expensive SaaS, paid component libraries or a new backend just for styling.
- No secret API keys in client code. Frontend VITE_ variables only for explicitly public Supabase project URL and publishable key. Provider secret keys stay server-side.

## Skills: mandatory initial audit and active use

1. Discover and read available installed skills, project rules, AGENTS.md and the five repo-local `.agents/skills/*/SKILL.md` files. Apply them deliberately to their matching sub-tasks:
   - `aerospace-ui-art-direction` — visual identity, typography, layout and component states;
   - `frontend-react-migration` — Vite → React + TypeScript incremental migration;
   - `threejs-preview-polish` — 3D viewer composition, GLB preview and performance;
   - `supabase-community-safety` — auth/storage/env/RLS boundaries;
   - `visual-qa-playwright` — screenshot-based visual/functional QA.
2. If additional reliable relevant skills are already installed (frontend design, UI/UX review, React, Playwright, accessibility, performance, motion animation, Supabase), read and use them. If a trustworthy skill installer or creator is available, propose or install only **verified compatible** skills after checking documentation; don't pretend skills exist. Use `$skill-creator` for a new reusable repo-specific skill only if it adds value and does not duplicate these five.
3. Output a small **Skills Used** matrix listing the actual files/skills consulted and what they changed. Do not claim installing or using any unavailable skill.

## Target stack (incremental; check actual package versions)

- React + TypeScript + Vite (retain Vite)
- Tailwind CSS v4 and a documented token system with semantic colors
- shadcn/ui + Radix primitives for accessible Dialog/Tabs/Select/Dropdown/Tooltip/Sheet/Form
- Lucide React icons (no emoji as primary UI icons)
- Motion for React (`motion/react`) for modest purposeful transitions, honoring reduced-motion
- Zustand for assembly and UI state where it truly helps
- Keep existing Three.js scene while wrapping/migrating UI. Introduce React Three Fiber + Drei **after** maintaining all viewer functionality; do not run two WebGL renderers on top of each other.
- Supabase client/edge functions unchanged unless explicitly required by integration. Preserve safe behavior when env vars are missing (local mode).
- Use TanStack Query only if remote community data truly needs caching; avoid unneeded packages.

## Art direction — SPACE_LOT Aerospace Studio

Design a premium engineering product, not a generic template or overly minimal black modal.

- Precise typography: `Space Grotesk` for display, `Inter` for body, clear scale (title ~28–36 desktop; body 14–16; small labels >=12 where readable). Use proper Vietnamese diacritics/font fallbacks. Avoid tiny 9px labels.
- Theme: `#0B1018` background, `#111925` sidebar, `#172130` cards, thin subtle borders `#2A3848`, main text `#F1F5FA`, secondary `#9CACBE`, champagne accent `#D6B582`, technical cyan `#75BDE7` sparingly. Provide light mode only if effortless; dark mode priority.
- Space and rhythm: consistent 4/8 spacing scale; 12–16px radii, restrained 1px strokes, high contrast. White space should group content rather than create oversized empty boxes.
- Premium hierarchy: prominent main headline, clear section headings, informative labels, useful empty states, compact status badges, meaningful CTA.
- Screen structure: app shell with clear navigation; the 3D viewport is the hero. Import Model, My Hangar, AI Workshop and Community should feel like related tools, not four disconnected modals. Preserve full function.
- Import workflow: attractive drag/drop upload, file info, coordinate system + scale confirmation, inspect/preview, save; display empty/processing/success/error states.
- 3D viewport: sophisticated neutral stage, grid/axes toggles, soft studio lighting, selected object outline, clear camera controls, responsive overlay and model-loading skeleton.
- Motion: 150–250 ms transitions for menus/dialogs, restrained springs, no unnecessary parallax or constantly looping gimmicks; support `prefers-reduced-motion`.
- Responsive: excellent at 1440×900 and 1280×800 desktop; usable at 768 tablet and 390 mobile with sheets/collapsible side panels; 3D viewport stays accessible.
- Never simply restyle with arbitrary Tailwind classes. Build reusable design tokens, page primitives, and cohesive component variants.

## Execution phases — implement, don't just discuss

### Phase 0 — Audit and protect
- Inspect `git status`, branches, package.json, index, src, modules, supabase, scripts, tests, current app pages. Note local vs GitHub discrepancies.
- Inventory existing features and document functional smoke tests before refactoring.
- If safe, create feature branch. Don't discard uncommitted changes or overwrite files without reading.
- Capture baseline screenshots and current UI errors at desktop and mobile, if browser tools are available.

### Phase 1 — Foundation
- Add React + TypeScript to current Vite app without deleting engineering/data modules.
- Introduce app root and routes/panels in small commits. Keep existing Three.js scene alive via lifecycle-controlled wrapper if R3F migration is too risky.
- Add Tailwind v4, design tokens, shadcn/ui where beneficial, Lucide, Motion, and Zustand selectively.
- Prefer typed adapters to rewrite; avoid monolithic giant JSX components.

### Phase 2 — Premium UI implementation
- Build shell, left Parts Catalog grouped accordion, center 3D workspace, right Inspector/Diagnostics, status/action area.
- Redesign Asset Operations with `Import Model`, `My Hangar`, `AI Workshop`, `Community` as polished, navigable responsive workflows.
- Improve 3D asset presentation and model import feedback without changing engineering assumptions.
- Ensure every prominent control actually works, is appropriately disabled, or is transparently labeled unavailable.
- Make backend-not-connected a clear unobtrusive settings/onboarding state, not a raw technical warning in the central design.

### Phase 3 — Regression and polish
- Run install, typecheck, build, unit tests and Playwright functional screenshots where available; test upload, unit axis, local save, inspector, community not configured, search, nav, dialogs, keyboard.
- Inspect screenshots and iterate based on visible issues (overflow, tiny type, contrast, truncated cards, poor mobile navigation, blank preview).
- Report actual commands/results and any incomplete items. Never invent successful browser tests.

## Deliverables

1. Working source changes inside my current workspace, not a throwaway demonstration project.
2. Short `DESIGN_SYSTEM.md`: tokens, fonts, component patterns, accessibility and 3D canvas styling.
3. `MIGRATION_NOTES.md`: before/after architecture, current features preserved, any known regression.
4. Screenshot paths for desktop/tablet/mobile if the environment can capture them.
5. Exact start/test/build commands for Windows PowerShell (`npm.cmd` fallback).
6. Commit on feature branch only after verified. **Do not push or deploy automatically without my explicit confirmation.**

Treat visual quality and engineering correctness as equal. If full migration cannot safely complete in one run, implement the highest-value fully functioning vertical slice first, then document honest remaining work — don't leave the UI half-broken.
