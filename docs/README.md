# Hướng dẫn sử dụng SPACE_LOT

Tài liệu tóm tắt tính năng, cấu trúc dự án và quy trình kiểm thử cho SPACE_LOT.

---

## 🚀 Thao tác cơ bản trong Workspace

| Công cụ / Thao tác | Mô tả & Cách sử dụng |
| :--- | :--- |
| **Builder Studio** | Tìm kiếm linh kiện trong Catalog bên trái, bấm `+` để thêm vào khung lắp ráp. |
| **Camera 3D** | Chuột trái kéo xoay, chuột phải kéo dịch (pan), cuộn chuột để zoom. Sử dụng các nút góc để reset Home, Top view, Wireframe và Grid. |
| **Di chuyển & Nổ tung** | Công cụ Move cho phép kéo thả linh kiện trên mặt phẳng XY (giữ nguyên cao độ Z). Thanh Exploded view hỗ trợ quan sát tách lớp chi tiết. |
| **Import Model (CAD)** | Bấm `Import model` trên thanh công cụ → Chọn file CAD/3D → Chọn đơn vị đo → Bấm `Process & inspect` → Kiểm tra kích thước và lưu vào My Hangar. |
| **My Hangar** | Kho mô hình cá nhân được lưu trữ trực tiếp trong IndexedDB của trình duyệt. Bạn có thể kéo thả linh kiện từ Hangar vào không gian 3D. |
| **System Taskbar** | Bấm nút `...` trên thanh Header để mở taskbar: Mở dự án JSON (`Open`), Khôi phục gốc (`Reset`), Xuất dự án (`Export`), Chế độ Zen (`Fullscreen 3D`), Cài đặt kết nối (`Settings`). |
| **Validation & Checks** | Thẻ Checks trong Inspector tự động kiểm tra số lượng motor, pin, xung đột vật lý và dây nối UART. |

---

## 📁 Cấu trúc thư mục

```text
SPACE_LOT/
├── README.md                 # Hướng dẫn nhanh & tổng quan
├── docs/                     # Tài liệu hướng dẫn & quy trình Git
├── src/
│   ├── App.tsx               # App shell chính & thanh Header Cyber HUD
│   ├── components/           # Catalog, Viewport, Inspector, Taskbar
│   ├── premium.css           # Toàn bộ design tokens & phong cách Cyber Aerospace
│   ├── scene.js              # Engine dựng hình Three.js
│   ├── store.js              # State management & lưu trữ project
│   └── engineering.js        # Thuật toán tính toán trọng tâm, khối lượng & lực đẩy
├── tests/                    # 16 unit tests & 14 Playwright E2E tests
└── public/                   # Logo SVG, icon và tài nguyên tĩnh
```

---

## 🧪 Kiểm thử chất lượng

```bash
# Kiểm tra TypeScript
npm run typecheck

# Chạy Unit Tests
npm test

# Chạy E2E Playwright
npm run test:e2e

# Build kiểm tra đóng gói
npm run build
```
