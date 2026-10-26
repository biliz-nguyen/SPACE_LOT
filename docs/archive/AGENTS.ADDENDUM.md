---
name: aerospace-ui-art-direction
description: Use when designing, reviewing, or implementing the SPACE_LOT/AeroGuide visual interface, layout, typography, design tokens, responsive screens, and all interactive states.
---

# SPACE_LOT — Aerospace UI Art Direction

Read current screens and inspect the DOM/CSS before redesign. Create a recognizable premium product aesthetic, not generic admin dashboard styling.

1. Audit first: capture existing screenshot, write 5 concrete visual issues from the actual screen; compare after.
2. Set semantic tokens `--background`, `--surface`, `--surface-raised`, `--border`, `--foreground`, `--muted`, `--accent`, `--technical`, `--danger`, `--success`, `--focus-ring`. Seed palette: #0B1018, #111925, #172130, #2A3848, #F1F5FA, #9CACBE, #D6B582, #75BDE7. Adjust after screenshots, never scatter raw colors.
3. Use Space Grotesk display, Inter UI, system fallbacks; test Vietnamese and English. Heading 28–36, panel heading 18–22, normal UI 14–16, helper >=12 where readable, avoid cramped 9px caps.
4. Create spatial hierarchy: readable top bar and page title; component catalog grouped by families; central 3D viewport; inspector right. In Asset Operations, use preview-stage hierarchy and clear progress steps.
5. Use shadcn/ui / Radix primitives for dialog, select, accordion, slider, tabs and tooltip; use Lucide icons consistently. Add keyboard focus, ARIA and descriptive empty/error/success states.
6. Motion: meaningful micro-interactions only; support reduced-motion; avoid decorative continuous loops, overblown glow, excessive card chrome.
7. Review at desktop 1440×900 and 1280×800, tablet 768, mobile 390. Avoid page overflow, tiny controls and inaccessible dialog scroll areas.
8. Deliver design token documentation, before/after screenshots (if available), and explicit visual improvements.

Do not substitute a marketing landing page for a functioning 3D engineering workspace.
