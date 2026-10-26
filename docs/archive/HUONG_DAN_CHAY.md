# SPACE_LOT v0.4 — Hướng dẫn chạy

## 1. Chạy bản mới trên máy

Giải nén, mở terminal trong thư mục `SPACE_LOT`:

```bash
npm ci
```

Tạo file cấu hình:

- Windows PowerShell: `Copy-Item .env.example .env.local`
- macOS/Linux: `cp .env.example .env.local`

File mẫu đã chứa URL và publishable key của Supabase FLYPLOT. Đây là key công khai của frontend; không chứa Meshy key hay service-role key.

```bash
npm run dev
```

Mở địa chỉ Vite hiển thị, thường là http://localhost:5173.

## 2. Import và lắp model

1. Bấm **Import model**.
2. Chọn file CAD/mesh cùng các texture, MTL hoặc buffer đi kèm nếu có.
3. Chọn đơn vị và trục của file nguồn. GLB/glTF dùng m + Y-up; STEP/IGES tự chuyển về mm.
4. Bấm **Process & inspect**. Kiểm tra model 3D, kích thước và cảnh báo.
5. Xác nhận đã kiểm tra rồi bấm **Save to my hangar**.
6. Kéo model từ thanh trái vào scene, hoặc dùng **Add**. Model lưu cục bộ và còn sau khi tải lại trang.

Dùng **Assembly manifest** để xem bảng thông số, tìm kiếm và sắp xếp. Kích thước mesh là bounding box; pinout, dòng điện và khả năng tương thích cần nguồn kỹ thuật xác thực.

## 3. Bật quyền duyệt cho bạn

Mở **Community**, tạo tài khoản và xác nhận email. Sau đó gán quyền cho đúng email đăng nhập bằng hướng dẫn SQL trong `README.md`, rồi đăng xuất/đăng nhập lại.

Người dùng bấm **Contribute** ở My hangar, điền 10 nhóm thông tin và xác nhận quyền chia sẻ. GLB nằm ở vùng riêng tư chờ duyệt. Bạn dùng **Inspect → Review → Approve/Reject**; chỉ model Approved mới xuất hiện trong kho chung.

Nếu chưa có model bạn cần, dùng **Request a model**. Yêu cầu hiển thị trong danh sách Requested components.

## 4. Bật Meshy

Trong Supabase Dashboard → Edge Functions → Secrets, thêm `MESHY_API_KEY`.

Không dán API key vào code frontend, GitHub hoặc chat. API tạo model có thể sử dụng credit; giao diện yêu cầu xác nhận trước khi gửi. Chọn kích thước cạnh dài nhất ước lượng, tạo model rồi đưa GLB qua bước kiểm tra import như trên.

AI chỉ tạo mesh để nhìn/lắp thử, không tự xác nhận CAD, lỗ vít hay pinout chính xác. Hiện tích hợp Meshy; provider khác cần thêm adapter.

## 5. Đưa thay đổi vào GitHub

Kết nối hiện tại chưa có quyền push, nên bản này chưa xuất hiện trên repo của bạn. Có thể chép source mới vào repo rồi tạo branch, hoặc áp dụng file patch trong gói bàn giao:

```bash
git switch -c feature/space-lot-v0.4
git apply --check ../SPACE_LOT_v0.4.patch
git apply ../SPACE_LOT_v0.4.patch
npm ci
npm test
npm run build
git add .
git commit -m "Upgrade SPACE_LOT UI and model import community workflow"
git push -u origin feature/space-lot-v0.4
```

Patch được tạo từ bản repo gốc commit `17e79d4`. Nếu repo đã có thay đổi, dùng `git apply --check` trước và giải quyết phần khác nhau; không ghi đè source mới hơn một cách tự động.

Các migration và Edge Function đã được triển khai trong FLYPLOT, không cần chạy lại lên cùng project. Muốn dùng project khác, cấu hình URL/key mới, áp dụng migration và deploy hai function từ thư mục `supabase/`.

## 6. Giới hạn cần biết

- File GLB local không nằm trong JSON export; giữ bản GLB bằng nút **GLB ↓** và giữ file nguồn trước khi đổi máy/xóa dữ liệu trình duyệt.
- STEP được tessellate để hiển thị, chưa phải trình CAD chỉnh sửa B-rep/feature tree.
- F3D, SLDPRT, DWG, FBX cần export STEP hoặc GLB trước.
- Chưa có Meshy key và tài khoản chủ kho nên phần tạo model trả phí, gửi duyệt và phê duyệt bằng tài khoản thật chưa được chạy thử trực tiếp.
