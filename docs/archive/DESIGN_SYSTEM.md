# SPACE_LOT Premium UI v1 — Aerospace Studio

The main product remains a working drone assembly workspace. The viewport is the central work area; catalog and inspector surround it. Asset Operations uses the same tokens for import, local assets, AI and Community.

## Semantic tokens

Tokens are defined in `src/premium.css` and mapped into Tailwind v4 using `@theme inline`.

| Token | Value | Use |
| --- | --- | --- |
| `--background` | `#0B1018` | Canvas surround, app background |
| `--surface` | `#111925` | Panels, dialogs, metrics |
| `--surface-raised` | `#172130` | Selected surfaces, controls |
| `--border` | `#2A3848` | Dividers, subtle strokes |
| `--foreground` | `#F1F5FA` | Main text |
| `--muted` | `#9CACBE` | Secondary information |
| `--accent` | `#D6B582` | Primary actions, current navigation |
| `--technical` | `#75BDE7` | Focus, geometry and engineering cues |
| `--danger` | `#FA8C91` | Destructive actions and failures |
| `--success` | `#7DD6B0` | Healthy/local status |
| `--focus-ring` | `#75BDE7` | Keyboard outline |

Space Grotesk Variable is the display face. Inter Variable is the UI face, including Vietnamese. Both are bundled locally through Fontsource; no external font requests are required. Headings use 20–36px. Main controls use 12–14px, body text 13–14px, engineering notes 12px. Decorative technical overlines and canvas overlays remain 9–11px; they are not the only source of project information.

## Components and interaction

- `components/ui/button.tsx`: local shadcn-style Button, Radix Slot composition, CVA variants, semantic Tailwind classes. Default, outline, ghost and danger variants share keyboard and disabled states.
- `components/ui/dialog.tsx`: local shadcn-style Dialog on Radix Dialog. Settings and reset provide focus trapping, focus restoration, Escape and descriptive titles.
- Parts Catalog uses Radix Accordion. Inspector uses Radix Tabs with keyboard navigation. Native selects and range controls remain where they already provide accessible input without risking legacy controller behavior.
- `components.json` configures future shadcn additions with TSX, Tailwind v4, Lucide and `@/*` aliases. These local components were adapted manually from the documented composition pattern; the CLI was not run over the existing source tree.
- Lucide supplies React UI icons. The retained Asset Operations island still contains some original text/Unicode action markers; its upload icon uses an inline Lucide-style SVG.
- Motion animates status notifications at 180ms. Dialogs fade at 180ms. `MotionConfig reducedMotion="user"` and the CSS media query respect reduced motion. No continuous decoration was added.
- The `/` keyboard shortcut focuses catalog search outside editable fields and open dialogs.

## Layout and 3D

Desktop: 276px catalog / flexible viewport / 304px inspector. Compact desktop slightly narrows the side panels. Tablet puts the inspector below the workspace. Mobile exposes collapsible Parts and Inspector panels while keeping the viewport available.

Panels and dialogs use 8–18px radii and 4/8px spacing increments. The app uses navy studio surfaces, warm primary actions and restrained cyan geometry cues. The 3D stage adds neutral key light, warm fill, cyan rim and a restrained grid. Home, top, fit and grid controls remain interactive. A real bounding-box camera fit handles the current assembly. No physical geometry is rescaled for appearance.

The main scene has one canvas. Labels start off for a clearer studio composition and remain available through the Labels checkbox. The separate Asset Operations preview has its own canvas, draws only while a model and visible area exist, and releases its renderer on teardown. If WebGL is unavailable, local project controls still work and the preview explains the limitation.

## Documentation checked

- [Tailwind v4 with Vite](https://tailwindcss.com/docs/installation/using-vite): Vite plugin and CSS import.
- [shadcn/ui with Vite](https://ui.shadcn.com/docs/installation/vite): aliases and source component setup.
- [Motion accessibility](https://motion.dev/docs/react-accessibility): reduced-motion behavior.
