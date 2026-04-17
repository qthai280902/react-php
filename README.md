<div align="center">
  <h1>🚀 MyBlog - Enterprise Social Platform</h1>
  <p><i>Nền tảng chia sẻ kiến thức & Mạng xã hội chuyên gia</i></p>
  
  [![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
  [![PHP](https://img.shields.io/badge/Backend-PHP_8.2+-777BB4?style=for-the-badge&logo=php)](https://php.net/)
  [![MySQL](https://img.shields.io/badge/Database-MySQL_8.0-4479A1?style=for-the-badge&logo=mysql)](https://mysql.com/)
  [![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
</div>

<br/>

## 📖 Giới thiệu (Overview)
**MyBlog** không chỉ là một blog đơn thuần, mà là một nền tảng lai (hybrid) mạng xã hội chuyên gia được kiến trúc theo tiêu chuẩn **Decoupled (Headless)**:
- **Frontend** vận hành dưới dạng **Single Page Application (SPA)** cực nhẹ, xây dựng bằng React 18, được tối ưu UX/UI bởi Tailwind CSS.
- **Backend** là một hệ thống **RESTful API thuần (Vanilla PHP)** siêu tốc độ, không vướng bận các framework đồ sộ, tối đa hóa hiệu năng truy xuất thông qua PDO.

Mục tiêu cốt lõi của kiến trúc này là "Bảo vệ luồng dữ liệu - Tối ưu hóa trải nghiệm người dùng", loại bỏ hoàn toàn độ trễ ảo.

---

## ✨ Tính năng nổi bật (Key Features)

### 1. Hệ thống User Profile V2
- **Đa phương tiện (Media-First)**: Hỗ trợ linh hoạt ảnh đại diện tròn (Avatar) và viền toàn cảnh 16:9 (Cover Image) với quy trình nén và upload an toàn.
- **Đồng bộ hóa Không độ trễ (Zero-Latency Sync)**: Sử dụng mô hình `Global State (Context API)`, mọi thay đổi trên form cập nhật lập tức làm mới Virtual DOM của toàn bộ Application (Navbar, Header, Card) mà không cần F5.

### 2. Gamification & Hệ thống Cấp bậc
- **Phân quyền chặt chẽ (RBAC)**: Chỉ định rõ `Admin 🤖` và `User`.
- **Huy hiệu Thành tựu (Badges)**: Tự động phân luồng huy hiệu (Đồng, Bạc, Vàng, Kim Cương) động theo số lượng follower (Trophy 🏆), kích thích người dùng cống hiến nội dung.

### 3. [Đang phát triển] Real-time Notifications ⚡
- Thay vì dùng cơ chế Short Polling nặng nề, hệ thống được thiết kế ngầm để hỗ trợ **SSE (Server-Sent Events)**, đẩy các luồng hoạt động trực tiếp từ PHP xuống luồng sự kiện của trình duyệt.

---

## 🛡️ Kiến trúc Bảo mật & Backend cốt lõi (Core Security)

Kiến trúc Backend là **niềm kiêu hãnh** của MyBlog. Mọi lỗ hổng (vulnerabilities) đều bị khóa cứng tại lớp Database và API:

1. **Giao dịch Nguyên tử (PDO Transactions)**:
   Mọi luồng dữ liệu (Xóa cache ảnh, Lưu Audit, Thay đổi Profile) đều được cuộn kín trong Transaction (`BEGIN TRANSACTION -> COMMIT / ROLLBACK`). Nếu mất mạng hoặc đứt gãy luồng ghi vào disk, dữ liệu lập tức phục hồi về nguyên trạng, quét sạch mọi tập tin Upload rác.
2. **Chặn Đứng Leo Thang Đặc Quyền (Anti-Privilege Escalation)**:
   Các Input gửi lên được sanitize nghiêm ngặt. Hệ thống **ép chết** hai Key độc hại `username` và `id` ở tận màng lọc API, ngăn chặn hacker can thiệp cấu trúc Cột lõi (Core Columns).
3. **Thiết Quân Luật: Cooldown Đổi Tên Định Danh (7-Day Limit)**:
   - Thuật toán khóa 7 ngày ép buộc bằng truy vấn **MySQL Thời Gian Thực (`TIMESTAMPDIFF(SECOND, changed_at, NOW())`)**, loại bỏ hoàn toàn rủi ro sai lệch Múi giờ do vòng lặp PHP gây ra.
   - Thao túng Postman gửi request liên tục sẽ bị Database Server dội ngược bằng lỗi **HTTP 429 - Too Many Requests**.
4. **Nhật Ký Kiểm Toán (Audit Trail)**:
   Hệ thống lưu lại mọi "phiên bản" đổi tên của người dùng (`old_name`, `new_name`, `changed_at` trong `user_name_history`). Đảm bảo dấu vết kỹ thuật số là bất khả thi để xóa mờ.

---

## 📂 Cấu trúc Thư mục (Folder Structure)

Kiến trúc phân tách ranh giới rõ ràng:
```text
📦 MyBlog
 ┣ 📂 be_php/                     👉 [BACKEND CORE] Hệ thống RESTful API
 ┃ ┣ 📂 api/                      # Routing Controller (users, posts, auth)
 ┃ ┣ 📂 config/                   # Chuỗi kết nối PDO (database.php), JWT Secret
 ┃ ┣ 📂 uploads/                  # Vùng an toàn vật lý chứa Media
 ┃ ┗ 📜 migration_v8_fix...sql    # Kịch bản Build cấu trúc Database & Audit Log
 ┃
 ┗ 📂 fe_react/                   👉 [FRONTEND CORE] Trình diễn UI
   ┣ 📂 src/
   ┃ ┣ 📂 api/                    # Interceptors bọc Axios
   ┃ ┣ 📂 components/             # Reusable UI (Navbar, EditProfileModal)
   ┃ ┣ 📂 context/                # Trạm điều khiển LocalStorage + Global State
   ┃ ┣ 📂 pages/                  # Router Views (UserProfile, Dashboard)
   ┃ ┗ 📜 main.jsx                # Root Bootstrap, Injection Provider
   ┗ 📜 package.json              # Môi trường hệ sinh thái NodeJS
```

---

## 🚀 Hướng dẫn Cài đặt (Installation Guide)

Để thiết lập Local, hãy tuân thủ trình tự Khởi động 3 bước:

#### Bước 1: Setup Database
1. Bật **MySQL** từ XAMPP hoặc DB Engine.
2. Tạo CSDL rỗng tên `blog_db` mang chuẩn `utf8mb4_unicode_ci`.
3. Import các file `migration_*.sql` (Bắt buộc chạy `migration_v8_fix_history.sql` để xây dựng hàng rào kiểm toán danh tính).

#### Bước 2: Setup API Backend (PHP)
1. Kéo toàn bộ folder vào htdocs (VD: `htdocs/revphp`).
2. Tới file `be_php/config/database.php` và điều chỉnh chuỗi kết nối PDO cho khớp CSDL nội bộ.
3. Đảm bảo thư mục `be_php/uploads/` có quyền **Write/Read** cho Webserver chạy ảnh.

#### Bước 3: Build Không Gian Frontend
1. Mở IDE Terminal, cd vào `fe_react/`:
    ```bash
    cd fe_react
    npm install
    ```
2. Khởi chạy máy chủ ảo:
    ```bash
    npm run dev
    ```
> Server API chuẩn sẽ chạy tại `http://localhost:8000`, Server Giao diện chạy tại `http://localhost:5173`.

---

## 🔌 Tóm tắt API Endpoints Tiêu Biểu

- `POST /api/users/update_profile.php`: 
   - **Mục tiêu**: Nâng cấp hồ sơ bằng Multipart/form-data.
   - **Xử lý ngầm**: Kiểm tra quyền chặn Leo thang -> So sánh Timer 7 ngày Cooldown trên Database -> Ghi file vật lý -> Transaction PDO (Update Users + Insert Audit Log) -> Dọn File Rác -> Trả về JSON Data tươi kèm JWT x2.
- `GET /api/users/get_name_history.php`:
   - **Mục tiêu**: Lấy lịch sử chống giả mạo cho cá nhân User đang đăng nhập, tính bằng `d/m/Y - H:i:s`.
- `GET /api/posts/read.php`: 
   - **Mục tiêu**: Lưới dữ liệu (Grid) cung cấp Newsfeed trang HomePage.
- ... (Còn nữa)

---
<p align="center">
  <i>Được rèn giũa và hoàn thiện bởi tiêu chuẩn <b>Enterprise level</b>. Bảo mật & Tốc độ lên hàng đầu!</i>
</p>
