# Hướng dẫn SPACE_LOT

Đây là bản tóm tắt dùng hằng ngày. README ở gốc hướng dẫn mở app; [GIT.md](GIT.md) hướng dẫn đưa code lên GitHub. Tài liệu dài trước đây nằm trong [archive](archive/README.md).

## Chạy và sử dụng

Yêu cầu Node.js 22.12 trở lên. Chạy lệnh ở thư mục `SPACE_LOT` có `package.json`, không phải thư mục cha `SPACELOT`.

```powershell
cd C:\Users\Quỳnh\Documents\SPACELOT\SPACE_LOT
$env:Path = "C:\Program Files\nodejs;C:\Program Files\Git\cmd;" + $env:Path
npm.cmd ci
npm.cmd run dev -- --host 127.0.0.1
```

Mở địa chỉ Local Vite in ra. Những lần sau chỉ cần `npm.cmd run dev`; cài lại thư viện khi thay đổi `package-lock.json`.

| Công cụ | Cách dùng |
| --- | --- |
| Builder | Tìm linh kiện, bấm `+`, chọn trong scene/tree và chỉnh tọa độ trong Inspector. |
| Camera | Kéo để xoay, cuộn để zoom; dùng Home, Top, Fit và Grid. |
| Move / Exploded view | Move thay đổi XY, giữ Z; exploded view chỉ tách hình ảnh, không đổi tọa độ thật. |
| Import model | Chọn file → chọn đơn vị/trục → Process & inspect → xác nhận kích thước → Save to my hangar. |
| My Hangar | Model lưu trong trình duyệt. Dùng Add hoặc kéo vào scene; xuất GLB để giữ bản sao. |
| Wiring / Checks | Quản lý kết nối, xem cảnh báo và xuất validation report. |
| Open / Export project | Đọc/ghi assembly JSON. JSON không chứa các file GLB; cần sao lưu GLB riêng khi đổi máy. |
| Community / AI | Cần cấu hình Supabase và đăng nhập. AI có thể dùng credit khi người dùng xác nhận tạo task. |

Định dạng: GLB/glTF, OBJ + MTL, STL, PLY, STEP/STP, IGES/IGS, BREP. F3D, SLDPRT, DWG và FBX cần xuất STEP hoặc GLB trước. Giới hạn import: 32 file, tổng 40 MiB, tối đa 750.000 tam giác.

## Cấu trúc thư mục

```text
SPACE_LOT/
├── README.md                 # Bắt đầu tại đây
├── docs/
│   ├── README.md             # Tóm tắt tài liệu
│   ├── GIT.md                # Commit / push
│   └── archive/              # 15 tài liệu gốc, giữ để tra cứu
├── .agents/skills/           # 5 skill của dự án; giữ đúng vị trí để agent đọc
├── src/
│   ├── App.tsx, main.tsx     # Entry và app shell React
│   ├── components/           # Catalog, viewport, inspector, UI primitives
│   ├── lib/                  # Adapter TypeScript cho store và tiện ích UI
│   ├── assets/               # CAD importer, preview, IndexedDB, studio/cloud
│   ├── scene.js              # Renderer Three.js
│   ├── store.js              # Trạng thái và lưu project
│   ├── engineering.js        # Tính toán và validation
│   └── premium.css           # Design tokens và responsive styling
├── data/                     # Catalog và assembly mẫu
├── public/                   # Logo và tài nguyên tĩnh
├── supabase/                 # Migrations và Edge Functions
├── tests/                    # Unit test và Playwright
├── scripts/                  # Copy CAD, chụp ảnh và production smoke test
└── artifacts/                # Ảnh bằng chứng và danh sách file thay đổi
```

`node_modules/`, `dist/`, `.npm-cache/`, `public/cad/` là thư viện/cache/build hoặc file sinh tự động. Chúng không đưa lên Git. Không chuyển source/module chạy app trong lần dọn tài liệu này, nên đường import và luồng tính năng được giữ nguyên.

## Thiết kế và kiến trúc

Giao diện Aerospace Studio dùng nền navy, điểm nhấn champagne và cyan. Token nằm trong `src/premium.css`. Space Grotesk và Inter được đóng gói local, có hỗ trợ tiếng Việt; không phụ thuộc Google Fonts.

React quản lý shell, catalog, controls, metrics và inspector. Store hiện tại vẫn là nguồn trạng thái duy nhất. Engine/CAD dùng JavaScript; không thay thuật toán hoặc schema JSON. Tọa độ kỹ thuật là mm, X-forward/Y-right/Z-up; GLB chuẩn hóa sang meters/Y-up. `/legacy.html` còn trong dev server để tham khảo giao diện cũ.

Đã áp dụng 5 skill dự án: art direction, React migration, 3D preview polish, Supabase safety và Playwright QA. Các skill đã cài bổ sung được dùng: React best practices, verification và Supabase. [Ma trận chi tiết](archive/SKILLS_USED.md).

## Cloud và giới hạn

Để bật cloud, chép `.env.example` thành `.env.local`, điền URL và publishable key của Supabase rồi khởi động lại Vite. Frontend chỉ dùng `VITE_SUPABASE_URL` và `VITE_SUPABASE_PUBLISHABLE_KEY`. Meshy/service-role key ở server, không đưa vào biến `VITE_` hoặc Git.

Community chỉ công khai model đã được chủ kho duyệt; file gốc local không tự tải lên. Quyền duyệt dùng `app_metadata`, không dùng `user_metadata`. Hướng dẫn kỹ thuật đầy đủ nằm trong [README gốc](archive/PROJECT_README.md); các thông tin về trạng thái cloud trong đó là ghi nhận lịch sử, cần kiểm tra lại trên project hiện tại.

Thông số demo, mesh import và model AI không xác nhận an toàn phần cứng. Mass chưa biết sẽ vô hiệu hóa ước lượng lực đẩy/thời gian bay. Xóa dữ liệu trình duyệt sẽ xóa model local.

## Kiểm thử và việc còn lại

```powershell
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
npm.cmd exec playwright install chromium
npm.cmd run test:e2e
```

Lượt nâng cấp Premium đã đạt TypeScript, build, **16 unit test và 14 browser test**. Playwright kiểm tra import CAD, consent, lưu/tải lại, kéo model, wiring, JSON, keyboard, mobile, mất WebGL và accessibility. Ảnh nằm trong `artifacts/screenshots/`; [báo cáo đầy đủ](archive/VALIDATION_PREMIUM.md).

Còn lại: chuyển Asset Operations hoàn toàn sang React, đánh giá migration R3F và kiểm thử Supabase/AI bằng tài khoản thật. Three.js vendor vẫn có cảnh báo dung lượng >500 kB. Chưa deploy production.
