# Đưa AeroGuide 3D Builder lên GitHub

GitHub connector hiện chưa thấy repository nào có quyền push. Không có commit nào được xác nhận trên GitHub.

1. Vào https://github.com/new, tạo repository **aeroguide-3d-builder**, ưu tiên **Private** trong giai đoạn thử nghiệm. Đừng tích chọn tạo README hoặc .gitignore mặc định (project đã có).
2. Mở PowerShell trong thư mục chứa `package.json` của project đã giải nén.
3. Chạy:

```powershell
git init
git add .
git commit -m "feat: AeroGuide 3D Builder base with categorized catalog"
git branch -M main
git remote add origin https://github.com/NguyenLeMinh-dev/aeroguide-3d-builder.git
git push -u origin main
```

Nếu `git` chưa có, cài **Git for Windows** rồi mở lại PowerShell. Nếu Git báo thiếu tên/email, thiết lập với `git config --global user.name "..."` và `git config --global user.email "..."` theo tài khoản GitHub của bạn.

Nếu repository đã tồn tại và bạn đang ở local git repo có `origin`, KHÔNG thêm `origin` lần nữa; dùng `git remote -v` để kiểm tra và `git push -u origin main`.

Khi cấp quyền repo cho GitHub connector của ChatGPT (Settings → Plugins → GitHub), ChatGPT có thể thao tác với repo trong các lượt sau.

## Chạy project

```powershell
npm.cmd install
npm.cmd run dev
```

Sau đó mở địa chỉ Vite hiển thị, mặc định `http://localhost:5173/`.
