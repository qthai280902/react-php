# 🚀 Social Blog Platform

[![React](https://img.shields.io/badge/Frontend-React%2018-blue)](https://reactjs.org/)
[![PHP](https://img.shields.io/badge/Backend-PHP%20PDO-777bb4)](https://www.php.net/)
[![Tailwind](https://img.shields.io/badge/Styling-Tailwind%20CSS-38b2ac)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/Security-JWT%20Validated-green)](https://jwt.io/)

**Social Blog Platform** là một nền tảng mạng xã hội nội dung hiện đại, được xây dựng theo kiến trúc **Decoupled (Tách biệt hoàn toàn)**. Dự án tập trung vào trải nghiệm người dùng High-tech, hệ thống tương tác thời gian thực và cơ chế Gamification độc đáo.

---

## ✨ Tính năng nổi bật (Key Features)

### 🎮 Hệ thống Gamification
- **Quy tắc đăng bài:** Phân cấp người dùng dựa trên mức độ tương tác thực tế (Followers & Likes). Kiểm soát chất lượng nội dung ngay từ khâu đầu vào.

### 👤 Social Identity
- **Profile cá nhân:** Hiển thị thống kê thời gian thực (Follower, Following, Likes).
- **Tabbed UI:** Quản lý bài viết và nội dung **Repost (Đăng lại)** chuyên nghiệp.
- **Privacy:** Tính năng Ẩn/Hiện bài Repost cho chủ sở hữu.

### 🌟 Hệ thống Interaction
- **Rating 5 sao:** Sử dụng Lucide Icons với giao diện hiện đại, cập nhật điểm không cần tải lại trang.
- **Social Connect:** Theo dõi người dùng, Thả tim bài viết với hiệu ứng Elastic UI.
- **Hashtag System:** Lọc bài viết thông minh theo hashtag từ Sidebar.

---

## 🛠 Tech Stack

| Thành phần | Công nghệ sử dụng |
| :--- | :--- |
| **Frontend** | React 18 (Vite), Tailwind CSS, Lucide React, Axios |
| **Backend** | PHP 8.x (REST API), PDO Prepared Statements |
| **Database** | MySQL |
| **Security** | JWT/Auth Headers, CORS Preflight Interceptor |

---

## 🚀 Hướng dẫn cài đặt

### 1. Cấu hình Database
- Import file SQL vào MySQL.
- Cấu hình tại `be_php/config/database.php`.

### 2. Cài đặt Backend
- Đặt thư mục `be_php` vào server Apache (XAMPP, Laragon).
- Đảm bảo port kết nối chuẩn xác.

### 3. Cài đặt Frontend
```bash
cd fe_react
npm install
npm run dev
```

---

## 🛡️ Bảo mật & Troubleshooting

### 🌐 Lỗi CORS Preflight
Dự án đã xử lý triệt để lỗi `401 Unauthorized` cho request `OPTIONS` trong `token_helper.php`:
```php
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
```

---

Được xây dựng với kiến trúc Decoupled hiện đại 🚀
