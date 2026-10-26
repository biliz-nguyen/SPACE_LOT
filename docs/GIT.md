# Commit và push lên GitHub

Repo: **https://github.com/biliz-nguyen/SPACE_LOT**.

Git for Windows `2.56.0.windows.3` đã cài. Thư mục project đã có `.git`, remote `origin` và nhánh local `premium-ui-v1` dựa trên `origin/main`. Lịch sử remote được tải về mà không checkout đè lên source local. Chưa tạo commit và chưa push trong lần chuẩn bị này.

## 1. Mở terminal đúng thư mục

Mở lại VS Code/PowerShell để nhận PATH mới, hoặc chạy trực tiếp:

```powershell
cd C:\Users\Quỳnh\Documents\SPACELOT\SPACE_LOT
$env:Path = "C:\Program Files\Git\cmd;C:\Program Files\nodejs;" + $env:Path
git --version
git branch --show-current
git remote -v
```

Nhánh hiện tại phải là `premium-ui-v1`, remote phải trỏ đến `biliz-nguyen/SPACE_LOT`. Không cần `git init` hoặc thêm `origin` lần nữa.

## 2. Đặt tên và email commit

Chỉ áp dụng trong repo này. Đổi email bên dưới thành email đã thêm vào GitHub hoặc địa chỉ noreply trong GitHub → Settings → Emails.

```powershell
git config user.name "biliz-nguyen"
git config user.email "EMAIL_GITHUB_CUA_BAN"
```

## 3. Kiểm tra, commit, push

```powershell
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
git status --short
git add .
git diff --cached --stat
git commit -m "feat: SPACE_LOT Premium UI v1 and organized documentation"
git push -u origin premium-ui-v1
```

Nếu kiểm tra báo lỗi, sửa lỗi trước khi commit. Git có thể mở trình duyệt để bạn đăng nhập GitHub khi push; dùng tài khoản có quyền ghi repo. Không dùng mật khẩu GitHub làm token trong lệnh.

Sau khi push thành công, mở [tạo Pull Request vào main](https://github.com/biliz-nguyen/SPACE_LOT/compare/main...premium-ui-v1) để xem và merge thay đổi. Lệnh trên chỉ đẩy nhánh Premium, không cập nhật `main` trực tiếp. Nếu repo có CI tự deploy theo nhánh, kiểm tra cấu hình đó trước khi push.

## Những lần sửa tiếp theo

Trong cùng thư mục, cùng nhánh:

```powershell
git add .
git commit -m "Describe your changes"
git push
```

`node_modules`, `dist`, cache, CAD sinh tự động và `.env.local` được `.gitignore` loại trừ; `.env.example` vẫn được đưa lên Git. Source, docs, skill và bằng chứng trong `artifacts` được quản lý cùng repo.

## Cài lại Git trên máy khác

Lệnh winget được đối chiếu với [hướng dẫn Git for Windows](https://git-scm.com/install/windows):

```powershell
winget install --id Git.Git --exact --source winget
```

Mở lại terminal sau khi cài. Trên máy mới, dùng `git clone https://github.com/biliz-nguyen/SPACE_LOT.git` vào thư mục trống; không clone đè lên thư mục source đang làm việc. [Tài liệu git clone](https://git-scm.com/docs/git-clone).
