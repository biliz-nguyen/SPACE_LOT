# SPACE_LOT · Premium UI v1

Ứng dụng lắp ráp drone 3D: CAD/GLB Import, My Hangar, AI Workshop, Community và Engineering Validation. Giao diện React + TypeScript, Tailwind v4, Radix/shadcn-style, Lucide và Motion; giữ engine Three.js hiện tại.

```powershell
cd C:\Users\Quỳnh\Documents\SPACELOT\SPACE_LOT
$env:Path = "C:\Program Files\nodejs;C:\Program Files\Git\cmd;" + $env:Path
npm.cmd ci
npm.cmd run dev -- --host 127.0.0.1
```

Mở **http://localhost:5173/** và giữ terminal chạy. Không cần Supabase để dùng các tính năng local.

- [Hướng dẫn ngắn: tính năng, cấu trúc source, kiểm thử và phần còn lại](docs/README.md).
- [Commit và push lên GitHub](docs/GIT.md).
- [Tài liệu gốc và báo cáo chi tiết](docs/archive/README.md).

Kiểm tra nhanh: `npm.cmd run typecheck`, `npm.cmd test`, `npm.cmd run build`, `npm.cmd run test:e2e`.
