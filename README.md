## Catalog v0.2 — Phân nhóm linh kiện (26/10/2026)

Catalog được chia theo lớp linh kiện thay vì một danh sách dài:
- **Airframe:** Drone Frames.
- **Propulsion:** Motors, Propellers, ESCs.
- **Flight & Navigation:** Flight Controllers, GPS & Navigation, Receivers.
- **Power System:** Batteries, Power Modules.

Có bộ lọc loại linh kiện, accordion mở/đóng từng danh mục, nút Expand/Collapse all, tìm kiếm theo tên/loại/mô tả và badge số lượng. Thao tác **+** vẫn thêm linh kiện vào cùng Assembly Store; không thay đổi schema JSON, wiring, tính toán kỹ thuật hoặc mô hình 3D. Khi tìm kiếm, các nhóm khớp tự mở tạm thời để không che mất kết quả.

**GitHub:** Repo chưa được kết nối trong môi trường này. Xem `GITHUB_PUSH.md` để tạo repository và push source (không cần đẩy thư mục `node_modules`).

---

# AeroGuide 3D Drone Builder Lab — v0.1

**Một web app base chạy local** cho lắp ráp và kiểm tra cấu hình drone Quad X. Mã nguồn JavaScript/HTML/CSS, không yêu cầu backend, tài khoản, database hoặc kết nối flight controller.

> **CẢNH BÁO:** Toàn bộ thông số phần cứng, đặc tuyến lực đẩy và sơ đồ dây trong bản demo là **dữ liệu minh họa**. Không sử dụng để kết luận tương thích điện, đấu dây thật, hoặc phê duyệt an toàn bay.

## 1. Cách chạy

Cài **Node.js 20.19+ hoặc 22.12+** cùng npm. Giải nén project, mở terminal tại thư mục có `package.json`:

```bash
npm install
npm run dev
```

Mở URL hiện trong terminal, thường là **http://localhost:5173**.

Để tạo bộ file web tĩnh có thể deploy:

```bash
npm run build
npm run preview
```

File output nằm trong `dist/`. Để chạy kiểm thử toán và rule-engine:

```bash
npm test
```

> Không mở trực tiếp `index.html` bằng `file://`: trình duyệt sẽ không resolve được bare module imports `three` của Vite.

## 2. Các chức năng đã lập trình

- **3D Assembly:** khung Quad X và 9 loại linh kiện được dựng trực tiếp bằng hình học Three.js; click để chọn; chuột trái để orbit; wheel zoom, chuột phải pan.
- **Parts Library:** tìm kiếm, phân loại, thêm linh kiện theo JSON; mặc định mỗi motor/ESC/prop đặt theo anchor của frame.
- **Inspector:** xem dimensions, khối lượng, sửa vị trí X/Y/Z (đơn vị mm); chọn `Move` để kéo linh kiện trên mặt phẳng ngang; snap gần anchor (<20 mm) với các linh kiện hỗ trợ.
- **Exploded View:** thanh kéo chỉ dịch vị trí hiển thị, không chỉnh tọa độ assembly và CG thật.
- **Wiring:** chuyển sang Wiring để hiển thị dây theo kết nối mẫu; chọn từng link, thêm/xóa liên kết port theo hướng nối; validator phát hiện sai cổng, hướng TX/RX, loại tín hiệu, nguồn 5 V.
- **Diagnostics:** kiểm tra số motor/ESC/prop cho Quad X, pattern FC, số cell, định mức dòng ESC, đĩa quét cánh quạt trên mặt phẳng XY, giao nhau giữa vài hộp bao và các kết nối điện mẫu.
- **Engineering summary:** tính tổng mass, tâm khối lượng (CG) và độ lệch XY; ước tính TWR và thời gian hover từ bảng thrust/current giả định của motor 1000 KV + 10×4.5 prop + pin 3S.
- **Projects:** tự lưu JSON vào LocalStorage; xuất/nhập project `.json`; Reset; xuất báo cáo validation JSON.
- **Custom GLB preview:** chọn component → `Load GLB`; mô hình GLB sẽ thay **hình hiển thị** tạm trong phiên làm việc. Dữ liệu điện/cơ khí không tự thay đổi. GLB không được embed vào JSON xuất ra.

## 3. Phân biệt các hệ trục và đơn vị

**File JSON (`positionMm: [X,Y,Z]`)**: X = forward; Y = right; Z = up, tất cả mm. **Three.js scene**: Y-up; 1 scene unit = 100 mm. Mapping duy nhất trong `src/scene.js`: `world = [X, Z, -Y] * 0.01`. Phần tính CG và compatibility luôn dùng dữ liệu mm nguyên bản, không dùng tọa độ của Exploded View.

## 4. Cấu trúc thư mục

```text
aeroguide-3d-builder-base/
├── index.html            # Khung giao diện
├── package.json          # 2 dependencies: three + vite
├── data/
│   ├── components.json    # Catalog linh kiện + thông số DEMO
│   └── assembly.json      # Project Quad X mẫu + wiring connections
├── src/
│   ├── main.js            # UI + sự kiện + import/export
│   ├── style.css          # Thiết kế responsive
│   ├── scene.js           # Hình 3D, camera, chọn, move, exploded, GLB
│   ├── store.js           # State + localStorage + anchor snapping
│   └── engineering.js     # Mass, CG, endurance & validation thuần JS
├── tests/
│   └── engineering.test.js
└── public/models/       # Để trống cho file GLB về sau
```

## 5. Sửa dữ liệu và thêm linh kiện

1. Mở `data/components.json`, tạo `id` duy nhất, khai báo `category`, `name`, `massG`, `dimensionsMm`, số cell/cổng/đặc tuyến nếu có.
2. `data/assembly.json` chứa các **instances** và vị trí mm; nhiều instances có thể tham chiếu cùng một component (ví dụ 4 motor).
3. `connections` lưu `from`, `fromPort`, `to`, `toPort`, `kind`, `label`. Port định nghĩa trong `components.json`.
4. Muốn thêm loại linh kiện **mới**, bổ sung renderer hình học trong `makePart` (`src/scene.js`) và tên hiển thị trong `TYPES` (`src/main.js`).
5. Rules mở rộng trong `src/engineering.js` để kết quả **UNKNOWN** nếu thiếu dữ liệu (chứ không kết luận PASS khi không đo được).

## 6. Giới hạn hiện tại cần hiểu đúng

**Visual:** không có mô hình CAD đúng tỷ lệ đến từng vít/dây; 3D là primitive schematic; không mô phỏng khí động học hay hoạt động động cơ.

**Calculation:** CG dùng khối lượng từng linh kiện gộp tại một tọa độ; collision check chỉ xét AABB đơn giản và đĩa cánh quạt 2D; motor thrust/current demo được nội suy tuyến tính, KHÔNG ngoại suy sang prop/voltage khác. Thời gian bay giả định có dòng phụ tải 0.8 A và 80% dung lượng khả dụng. Không tính điện áp sag, nhiệt, gió, tilt, hiệu suất ESC, aging.

**Electronics:** demo UART TX/RX & 5 V chưa bao gồm toàn bộ nguồn, GND, 3 pha động cơ, thứ tự quay, voltage level shifting, termination, EMI. Không có thư viện pinout xác thực cho một bo mạch có revision cụ thể.

**Flight controller:** KHÔNG flash firmware, KHÔNG ghi parameter, KHÔNG kết nối WebSerial/MAVLink, KHÔNG điều khiển motor. Tích hợp Mission Planner, ArduPilot parameter metadata và SITL là các adapter tương lai.

**Local state:** LocalStorage chỉ được lưu theo origin trình duyệt; dùng Export JSON để sao lưu. GLB chỉ là preview trong session, chưa lưu vào project.

## 7. Lộ trình nâng cấp

- v0.2: chính thức hóa schema với attachment points, transform/rotation, nâng cấp AABB → OBB/mesh check, đơn vị/gốc tọa độ có kiểm thử.
- v0.3: ràng buộc port điện dạng typed graph với safety rule; thư viện linh kiện verified + datasheet provenance; vòng kiểm thử unit/UI.
- v0.4: hiệu chuẩn thrust curves từ dữ liệu đo; tính uncertainty; layout trọng tâm theo khối lượng/cấu hình thực.
- v0.5: nâng React + React Three Fiber khi UI phức tạp hơn; import CAD pipeline, asset versioning, GLB optimization.
- v1.x: adapter ArduPilot metadata + `.param`, read-only MAVLink qua local bridge, SITL backend (không dùng Three.js giả lập điều khiển bay).

### Tài liệu chính thức

- https://threejs.org/manual/pages/installation.html
- https://threejs.org/docs/
- https://vite.dev/guide/
- https://ardupilot.org/copter/docs/common-simulation.html
