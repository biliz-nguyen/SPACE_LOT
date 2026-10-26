---
name: threejs-preview-polish
description: Use when styling and improving the 3D drone viewport, GLB preview, import pipeline, model scale and axis conversions, R3F migration, mesh loading states or rendering performance.
---

# AeroGuide 3D Stage & GLB Quality

Preserve engineering units/coordinate conventions; visual improvements must never silently alter physical model dimensions or component CG.

- Inspect current Three.js scene and loader. Keep camera orbit, zoom, selection, move, wiring, exploded view, overlays and visibility toggles working.
- Create clean studio stage: deliberate lighting key/fill/rim; soft ground and grid, optional axis gizmo, controlled outline, readable labels, responsive camera framing and inspectable material treatment. Don't bury model in an overbright glow.
- Imported GLB/GLTF: confirm canonical unit meters and Y-up conversion; convert from STEP/STL origin units using explicit user-selected metadata and track source-unit/axis state. Display dimensions measured from geometry separately from engineering specs.
- Use strong empty/loading/error 3D preview states; show actionable error for bad GLB, missing textures, unsupported format or too-large mesh. Dispose old geometries/textures and release object URLs on replacement.
- Render preview images and asset thumbnails where feasible; no false implied CAD certification.
- Performance: pixel ratio budget, deferred offscreen rendering, limited lights/shadows, instancing repeated motors, memoization, frame-rate and GPU memory sanity. Degrade gracefully for mobile and no WebGL.
- If migrating to React Three Fiber, use one renderer and one canvas; perform feature parity checks and pointer event tests. Ensure resource cleanup on unmount.
- Verify model remains clearly visible against dark surfaces and axes/measurement labels meet contrast standards.
