# SPACE_LOT · 3D Aerospace Studio

> Studio thiết kế, lắp ráp và kiểm định drone 3D phong cách Cyber Aerospace hiện đại.

---

## ⚡ Khởi chạy nhanh (Quick Start)

Yêu cầu: **Node.js 22.12+**. Chạy các lệnh sau trong thư mục `SPACE_LOT`:

```bash
# 1. Cài đặt thư viện
npm install

# 2. Chạy môi trường phát triển (Dev server)
npm run dev
```

Mở trình duyệt tại **`http://localhost:5173/`** để bắt đầu sử dụng. Hoạt động 100% offline/local mà không cần cấu hình thêm.

---

## 🛸 Tính năng chính

- **3D Assembly Studio**: Lắp ráp drone trực quan với Three.js, hỗ trợ xoay, zoom, đổi chế độ nhìn (Perspective, Top, Wireframe, Exploded view).
- **Import CAD Đa định dạng**: Hỗ trợ nạp mô hình CAD 3D phong phú: `STEP/STP`, `IGES/IGS`, `BREP`, `GLB/glTF`, `OBJ`, `STL`, `PLY`.
- **My Hangar**: Lưu trữ và quản lý thư viện linh kiện cá nhân trực tiếp trong trình duyệt (IndexedDB).
- **System Taskbar**: Bảng tác vụ tinh gọn: Mở dự án (`Open Project`), Khôi phục mặc định (`Reset`), Xuất file (`Export Project`), Toàn màn hình (`Fullscreen 3D`) và Cài đặt (`Workspace Settings`).
- **Engineering Validation**: Kiểm tra trọng tâm (CG), khối lượng, lực đẩy và tính hợp lệ vật lý trước khi xuất bản.

---

## 🛠 Lệnh kiểm thử & Đóng gói (Scripts)

| Lệnh | Mô tả |
| :--- | :--- |
| `npm run dev` | Khởi chạy Vite dev server |
| `npm run typecheck` | Kiểm tra lỗi kiểu TypeScript (`tsc --noEmit`) |
| `npm test` | Chạy 16 bài kiểm tra đơn vị (Unit tests) |
| `npm run test:e2e` | Chạy bộ kiểm thử tự động Playwright E2E (14 tests) |
| `npm run build` | Đóng gói sản phẩm cho môi trường production |

---

## 📚 Tài liệu chi tiết
- [Tài liệu hướng dẫn sử dụng](docs/README.md)
- [Hướng dẫn Git & Quy trình đóng góp](docs/GIT.md)
