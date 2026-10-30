# SPACE_LOT — brief UI cho Antigravity

Ngày phân tích: 29/10/2026. Mục tiêu: tinh gọn giao diện hiện có, dễ đọc và nhường diện tích cho thao tác 3D. Antigravity phụ trách presentation/interaction; Codex phụ trách server, cấu trúc dữ liệu, engine và hành vi tính năng.

## 1. Bắt đầu ở đâu

Đọc `docs/README.md`, brief này và các skill trong `.agents/skills/`. Mở project con `SPACE_LOT/` chứa `package.json`; không làm việc trên ZIP hoặc source GitHub cũ.

```powershell
cd C:\Users\Quỳnh\Documents\SPACELOT\SPACE_LOT
$env:Path = "C:\Program Files\nodejs;C:\Program Files\Git\cmd;" + $env:Path
git status --short
npm.cmd run dev -- --host 127.0.0.1
```

Stack hiện tại: Vite, React, TypeScript, Tailwind v4, component shadcn-style/Radix, Lucide, Motion, Three.js. Giữ stack này. Không cần cài UI framework mới cho lần tinh chỉnh này.

## 2. Nhận xét từ giao diện hiện tại

Đã đối chiếu source và mở ảnh `artifacts/screenshots/after-desktop.png`, `after-mobile.png`, `after-import.png` của ngày 26/10. Đây là bằng chứng lịch sử, không phải ảnh browser mới chụp ngày 29/10. Khi triển khai, chụp baseline lại từ app đang chạy.

| Quan sát | Hướng sửa |
| --- | --- |
| Desktop có app header 76px, project bar 80px, rồi thêm heading lớn và câu slogan. | Giảm hai bar đầu còn tổng khoảng 96–104px; heading workspace thành hàng ngữ cảnh gọn. |
| Viewport có nhiều caption lặp lại: Assembly, Perspective, Quad X, engineering units, local status. | Chỉ giữ mode, điều khiển camera và trạng thái có ích. Đưa chú giải kỹ thuật vào tooltip/Settings, không lặp chữ ở nhiều góc. |
| Bốn card metrics và nhiều hàng điều khiển lấy chiều cao của mô hình. | Một dải metrics nhỏ; toolbar liên quan đến xem 3D đặt sát viewport. Không bỏ số liệu hoặc biến unknown thành số đẹp. |
| Catalog: family heading, khung category, khung part, mô tả, badge cùng xuất hiện dù mỗi nhóm chỉ một item. | Giữ nhóm nhưng giảm một lớp khung; dùng row gọn, tên + mass + nút thêm. Chi tiết phụ mở khi chọn. |
| Inspector đặt assembly tree trước chi tiết, nên tọa độ/component actions dễ nằm dưới vùng cuộn. | Chi tiết linh kiện đang chọn ở trên; tree là mục thu gọn nhưng vẫn truy cập được. Wiring và Checks giữ tab riêng. |
| Import có hai headline mang tính slogan, nhiều lời giải thích cùng một màn hình. | Tiêu đề “Import model”, ba bước rõ ràng, trợ giúp ngắn; preview + dimensions là nội dung chính ở bước kiểm tra. |
| Mobile có nhiều tầng header/nav trước khi đến model. | Rút vùng trên viewport về khoảng 240px hoặc ít hơn ở 390×844; Parts/Inspector mở có chủ đích. |
| Label hiển thị trộn tiếng Anh/Việt; nhiều overline nhỏ và chữ hoa. | Giao diện thao tác chính ưu tiên tiếng Việt, giữ thuật ngữ kỹ thuật trong ngoặc khi cần. Text thường sentence case, helper tối thiểu 12px. |

Định hướng là giảm khoảng 20–30% phần chữ/chrome phụ so với ảnh hiện tại, không giảm kích thước chữ hay vùng bấm để tạo cảm giác gọn.

## 3. Bố cục mục tiêu

```text
┌──────────────────────────────────────────────────────────────────┐
│ SPACE_LOT   Builder · My Hangar · AI · Community       Settings  │
│ Tên project / Local      Open · Import model · Export · More     │
├──────────────┬───────────────────────────────────┬───────────────┤
│ Parts        │ Assembly / Wiring       View tools│ Inspector     │
│ Search       │                                   │ Selected part │
│ Categories   │           3D VIEWPORT               │ Dimensions    │
│ Part rows    │                                   │ Mass / XYZ    │
│ Local assets │                                   │ Actions       │
│              │ Select / Move · Explode · Display  │ Tree ▸        │
│              │ Mass · CG · T/W · Hover            │ Wiring/Checks │
└──────────────┴───────────────────────────────────┴───────────────┘
```

### Desktop

- Ba cột: catalog khoảng 240–256px; inspector 272–288px; viewport lấy phần còn lại. Cho phép thu gọn panel, không xóa panel.
- Canvas mục tiêu cao ít nhất khoảng 360px ở 1280×800 và 440px ở 1440×900. Đây là mục tiêu layout cần đo trong browser, không phải kích thước đã đạt.
- Bỏ slogan “Design with intention…” khỏi workspace. Có thể giữ một title nhỏ, không cần hero marketing.
- Import model là primary CTA để bắt đầu làm việc; Export là secondary. Reset nằm trong More và vẫn có xác nhận. Open là “Mở project JSON”, khác Import model.
- Metrics nằm cùng một dải, không cần bốn card viền riêng. Chú thích nguồn/giới hạn chuyển thành tooltip hoặc expandable details, nhưng “demo/unknown/unverified” vẫn có thông tin truy cập được.
- Chỉ dùng màu accent cho hành động chính/đang chọn; cyan cho tương tác kỹ thuật, không tô mọi icon.
- Footer chỉ giữ nếu có trạng thái hữu ích; bỏ câu khẩu hiệu và version lặp lại. “Local” không được ghi “Đã đồng bộ cloud”.

### Inspector

Thứ tự: component name + provenance → dimensions/mass → XYZ → actions. Assembly tree có thể thu gọn phía dưới hoặc trong section riêng. Chọn linh kiện trên canvas/catalog phải cập nhật Inspector; không reset project khi mở panel.

Checks phân biệt lỗi, cảnh báo, chưa biết và pass. Imported/AI chưa có mass không được hiện “an toàn” hoặc “đã xác minh”. Wiring mode vẫn đưa người dùng đến phần quản lý kết nối thích hợp.

### Import / Hangar / AI / Community

- Giữ chúng trong một Asset Operations thống nhất, không tạo bốn hệ navigation khác nhau.
- Import: **Chọn file → Kiểm tra hình học/đơn vị → Lưu**. Bước kiểm tra ưu tiên model, kích thước đo, nguồn đơn vị/trục và cảnh báo. Save chỉ dùng được sau xác nhận hợp lệ.
- Đây là cách trình bày lại; không được thay đổi xác thực file hoặc làm mất các bước hiện có để đạt bố cục đẹp.
- Hangar: bảng/list gọn cho nhiều asset, dùng empty state có nút Import; vẫn Add/drag, export GLB và Contribute.
- AI: prompt, kích thước ước lượng, consent, Generate và tiến trình task. Chưa kết nối thì giải thích ngắn và disable đúng điều kiện; không tạo job giả.
- Community: thư viện đã duyệt, đăng nhập, yêu cầu model và trạng thái đóng góp. Bản duyệt kho không đồng nghĩa xác minh thông số nhà sản xuất.

### Tablet và mobile

- Tablet: ưu tiên viewport; inspector có thể là panel mở/đóng. Không ép ba cột hẹp.
- Mobile: viewport là màn hình chính; Parts và Inspector là panel/sheet mở chủ động, có nút đóng. Hành động Import luôn dễ tìm.
- Khi mở sheet, dùng primitive quản lý focus; Escape đóng, focus quay lại nút mở. Canvas phía dưới vẫn được mount; không tái tạo renderer khi đổi panel.
- Nút dạng icon có accessible name. Vùng bấm thực tế nên khoảng 40–44px; không dùng chữ 9px để nhét đủ điều khiển.
- Không tràn ngang ở 390px; dialog scroll được và CTA không bị footer/keyboard che vĩnh viễn.

## 4. Giữ design system hiện có

Token ở `src/premium.css`: background `#0B1018`, surface `#111925`, raised `#172130`, border `#2A3848`, text `#F1F5FA`, muted `#9CACBE`, accent `#D6B582`, technical `#75BDE7`.

Giữ Inter cho UI, Space Grotesk cho display; font đã đóng gói local. Text chính 14px, helper ≥12px, heading panel 18–20px. Radius khoảng 8–12px cho control/panel; không biến mọi row thành một card riêng. Spacing theo nhịp 4/8px. Tăng tương phản bằng token, không tăng glow.

Motion chỉ dùng cho mở/đóng, chuyển tab và phản hồi thao tác trong khoảng 150–200ms; tôn trọng reduced motion. Không tự quay model hoặc thêm chuyển động nền liên tục.

## 5. Bản đồ code và trách nhiệm

| File / vùng | Hiện tại | Antigravity | Codex |
| --- | --- | --- | --- |
| `src/App.tsx` — JSX shell | Header, nav, project actions, panel, dialog | Bố cục/copy; giữ callbacks và DOM hooks | Điều phối runtime và hành vi project |
| `src/App.tsx` — effect khởi tạo | Tạo `DroneScene`, `setupStudio`, `setupManifest`, subscribe và cleanup | Không thay effect để làm lại layout | Sở hữu lifecycle; tách hook/controller khi cần |
| `src/components/PartsCatalog.tsx` | Search/filter/accordion/add; host local asset shelf | Row, spacing, responsive, interaction trình bày | Add/register/catalog semantics |
| `src/components/AssemblyViewport.tsx` | Canvas host, tools, metrics | Toolbar, dải metrics, lớp overlay không chắn pointer | Camera/math, scene updates, transforms |
| `src/components/InspectorPanel.tsx` | Tree, selection, XYZ, wiring/checks/report | Thứ tự thông tin, tabs, form layout | Binding số liệu, validation và wiring |
| `src/components/ui/`, `src/premium.css` | Primitives, tokens và responsive | Vùng chỉnh chính; sửa rule hiện có thay vì chồng override | Review tương thích/accessibility |
| `src/lib/project.ts`, `src/store.js` | Typed adapter và state nguồn duy nhất | Đọc interface, gọi binding hiện có | Schema, mutation, persistence, migration |
| `src/assets/studio.js`, `src/manifest.js` | Imperative DOM controllers | Chỉ style shell hiện có trong giai đoạn đầu | Bộ xử lý, tách controller/React migration |
| `src/scene.js`, `src/assets/importer.js`, `policy.js`, `cad-worker.js`, `preview.js` | GPU, parsing, normalize và tài nguyên | Không sửa engine để đạt hình ảnh mockup | Geometry, performance, lifecycle, import |
| `src/assets/db.js`, `cloud.js`, `supabase/`, `data/`, `engineering.js` | Storage, API, auth/RLS và engineering | Không chỉnh trong nhánh UI | Server, dữ liệu, bảo mật, tính năng |
| `tests/`, `scripts/` | Regression và bằng chứng | Chạy, thêm test UI đúng hành vi | Giữ/kiểm tra core assertions và integration |

Tên component mới như `AppHeader`, `ProjectToolbar`, `WorkspaceLayout`, `ViewportToolbar`, `MetricsStrip`, `InspectorSections` chỉ là đề xuất tách presentation; chúng chưa tồn tại. Không đổi tên/xóa file core để ép theo cây này.

### Ranh giới quan trọng

`App.tsx` hiện là file dùng chung giữa UI và runtime: không viết lại toàn bộ file từ một mockup. Bảo toàn effect, ref, callback và cleanup; chỉ chỉnh JSX/presentation hoặc trao đổi thay đổi contract với Codex.

`setupStudio` append native `<dialog id="asset-studio">` vào `document.body`; nó tự tạo preview, gắn listener, xử lý import và polling. `#asset-shelf` cũng do controller này điền nội dung. Không mount React children vào các DOM island đó, không dựng dialog/canvas trùng ID và không chạy song song controller cũ với UI mới. Giai đoạn đầu chỉ chỉnh style. Chuyển toàn bộ sang React là một slice riêng do Codex tách controller trước.

## 6. Contract phải giữ

```text
UI event → binding/store method → state + persistence
                               → scene update
                               → React snapshot/render

File → policy → importer/CAD worker → measured metadata
     → preview + unit/dimension confirmation → IndexedDB
     → catalog registration → scene insertion
```

- Project hiện có `projectName`, `instances`, `connections`; instance giữ `id`, `componentId`, `positionMm`. Đây là các field UI dùng, không phải toàn bộ schema serialized. Không dựng project object mới chỉ từ interface TypeScript rồi làm mất field khác.
- Dùng `useProject()`, `store.select/add/remove/move/import/reset/addWire/removeWire` và quy tắc `store.changed()` hiện có. Không tạo bản sao project thứ hai bằng Zustand/useState/mock data. State mở menu/panel/search có thể ở UI.
- Không đổi localStorage key `aeroguide-builder-v0.1`, `space-lot-custom-catalog`, schema IndexedDB `space-lot-assets` hoặc quan hệ asset references.
- Giữ đơn vị, chuẩn trục, kích thước thật, giới hạn file, consent gate và behavior unknown-mass. `null` là chưa biết, không phải 0.
- UI không gọi DB/service-role hoặc tạo provider job ngoài bộ xử lý đang có. Không đưa secret vào browser.
- Các DOM hook do code và test dùng gồm `#three-container`, `#asset-shelf`, `#manifest-btn`, `#import-btn`, `#asset-studio`, các input/step import; các `data-add`, `data-select`, `data-pos`, `data-mode`, `data-tool`. Đọc tests trước khi chuyển chúng. Không xóa/đổi ID chỉ để test khỏi báo lỗi.
- Menu hóa Reset/Display có thể cần sửa đường truy cập trong E2E: giữ ý nghĩa kiểm thử, không bỏ assertion về dữ liệu/physics/consent.
- Không thêm undo, auto-save cloud hoặc chức năng đồng bộ dưới dạng nút giả. Muốn thêm hành vi mới, mô tả contract để Codex triển khai.

## 7. Các bước giao việc

1. Antigravity chụp baseline mới, chỉnh shell/catalog/inspector/viewport presentation và CSS trước. Không đổi engine/API/schema.
2. Chứng minh giữ được các luồng hiện có. Khi UI cần API/props mới, ghi vào bàn giao: tên input/output, loading/error/empty states và file cần Codex mở rộng; không dùng dữ liệu giả thay vào sản phẩm.
3. Codex review thay đổi, tách phần logic còn lẫn UI nếu cần, rồi triển khai server/data/tính năng theo yêu cầu cụ thể. Các ý như versioned project bundle, tiến trình import hoặc cloud trạng thái xác thực là backlog cần chốt riêng, không mặc định đã làm.
4. Sau mỗi slice, build/test và chụp ảnh bốn kích thước. Không thay source local bằng bản GitHub cũ. Không push/deploy hoặc ghi đè thay đổi chưa commit.

Phạm vi lần phân tích này: brief và phân công. Không có thay đổi UI runtime/server/data, không claim đã triển khai bố cục đề xuất.

## 8. Điều kiện nghiệm thu

```powershell
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
npm.cmd run test:e2e
npm.cmd run capture:ui -- antigravity
```

Đánh giá ở 1440×900, 1280×800, 768×1024, 390×844. Kiểm tra viewport dùng được, thông tin đọc được, panel không mất state, các trạng thái lỗi/loading/empty thật, bàn phím/focus/Escape và không có renderer/listener nhân đôi.

Giữ regression: import STL/STEP, source units, consent, local save/reload, kéo asset vào scene, selection/Move giữ Z, exploded view không đổi tọa độ, wiring, manifest, JSON round-trip, unknown mass và local-only khi thiếu cloud. Test suite trước đó có 16 unit + 14 browser test; đây là mốc lịch sử, phải chạy lại sau khi sửa.

Bàn giao gồm file đã sửa, ảnh trước/sau cùng viewport size, lệnh/kết quả kiểm thử thực tế, thay đổi contract đề nghị cho Codex và phần còn thiếu. Kiểm tra ảnh bằng mắt sau khi chụp.

## Prompt giao trực tiếp cho Antigravity

> Đọc `docs/ANTIGRAVITY_UI_BRIEF.md`, `docs/README.md` và các skill phù hợp trong `.agents/skills/`. Bạn phụ trách UI/UX của SPACE_LOT; Codex phụ trách server, dữ liệu, engine và logic tính năng. Hãy tinh gọn UI đang có theo Aerospace Studio: giảm header/caption/card phụ, tăng diện tích viewport, catalog dạng row và inspector ưu tiên linh kiện đang chọn. Triển khai presentation trước trên source local, dùng binding thật và giữ mọi tính năng. Bảo toàn lifecycle trong `App.tsx`; không viết lại các DOM island của `setupStudio`, không đổi API/schema/storage/physics, không thay bằng mockup hoặc dữ liệu giả. Đọc bảng trách nhiệm và contract trong brief trước khi sửa. Chạy typecheck/unit/build/Playwright, chụp và xem ảnh desktop/tablet/mobile; báo cáo kết quả thật và những yêu cầu logic cần Codex triển khai. Không tự push hoặc deploy.
