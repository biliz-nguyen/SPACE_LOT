---
name: visual-qa-playwright
description: Use after UI changes to SPACE_LOT to inspect browser screenshots, test accessibility and verify responsive layout, functional flows and 3D/editor regressions.
---

# Visual QA + Functional Regression

1. Record baseline screenshot(s) if browser/Playwright is available before editing.
2. Test at desktop 1440×900, 1280×800; tablet 768×1024; phone 390×844 (or nearest available).
3. Verify UI states: initial empty/import complete, loading error, component selection, modal open/close, tabs, catalog search, context menu, wiring, diagnostics, model preview, local-only backend, form validation and save.
4. Keyboard: tab order, focus visible, Enter/Space activate, Esc dismiss dialog; check trapped focus in modal and readable aria labels.
5. Visual quality checklist: readable font >=12 small text, consistent typography, no horizontal overflow, balanced negative space, no clipped panels, visible CTA, cohesive icon system and distinct hover/selected/disabled states.
6. Playwright flow should validate visible result (not just click success); check console errors and page exceptions; screenshots are evidence and are inspected, not merely saved.
7. Add regression unit tests for engineering math, unit conversions and import/export schema; don't change expected physics to make new UI tests pass.
8. Run `npm.cmd run build`, `npm.cmd test` and `npm.cmd run dev` on Windows if applicable; if scripts differ, inspect package first. Report the exact checks actually executed and blockers.
9. Do not claim visual QA if no browser was available. In that case give manual verification steps.
