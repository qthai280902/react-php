# BẢN ĐỒ KIẾN TRÚC HỆ THỐNG (CONSOLIDATED)

Tài liệu này được tổng hợp từ 7 tệp phân tích trong `.planning/codebase/` để cung cấp cái nhìn toàn diện nhất về dự án.

---

## 1. Công nghệ (STACK.md)

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **API Client**: Axios
- **State Management**: React Context API (`AuthContext`)
- **Toasts**: react-hot-toast
- **Routing**: react-router-dom

### Backend
- **Language**: PHP 8.x
- **Database Access**: PDO (PHP Data Objects)
- **Authentication**: JWT (JSON Web Tokens - Custom implementation with token_helper.php)
- **Security**: ID Hashing (id_helper.php)
- **CORS**: Custom middleware (cors.php)

### Database
- **Engine**: MySQL / MariaDB
- **Key Tables**: `users`, `posts`, `reposts`, `follows`, `likes`, `user_name_history`.

---

## 2. Tích hợp & Giao tiếp (INTEGRATIONS.md)

### Giao tiếp nội bộ
- **API Pattern**: REST-ish API endpoints in PHP returning JSON.
- **Client Communication**: Axios with a centralized `axiosClient.js` using a base URL and interceptors for Authorization headers.

### Hệ thống Xác thực
- **Provider**: Internal PHP logic.
- **Mechanism**: JWT-based. Tokens are issued at login and verified in protected PHP endpoints via `token_helper.php`.
- **Storage**: Tokens are managed in `AuthContext` and persisted in `localStorage`.

### Lưu trữ tệp
- **Mechanism**: Direct local filesystem storage (`be_php/uploads/`).

---

## 3. Kiến trúc Tổng quan (ARCHITECTURE.md)

### Mẫu thiết kế (Design Patterns)
- **Monolithic API**: Backend PHP quản lý toàn bộ domain logic.
- **Single Page Application (SPA)**: React quản lý state và routing.
- **Provider Pattern**: Sử dụng `AuthContext` để truyền trạng thái đăng nhập.

### Luồng dữ liệu (Data Flow)
- **Request** -> **Axios** -> **PHP Logic** -> **SQL Transaction** -> **JSON Response** -> **Frontend State Sync**.

### Lớp Bảo mật
- **Token Shield**: Kiểm tra JWT cho các endpoint nhạy cảm.
- **UID Hardening**: Mã hóa ID database trên URL.
- **Smart Decoding**: Xử lý song song Numeric ID và UID.

---

## 4. Cấu trúc Dự án (STRUCTURE.md)

```text
revphp/
├── be_php/                     # PHP Backend (API, Config, Uploads)
│   ├── api/                    # Auth, Posts, Users endpoints
│   └── config/                 # Database, CORS, ID Helpers
└── fe_react/                   # React Frontend (Vite)
    ├── components/             # Reusable UI Blocks & Modals
    ├── context/                # AuthContext
    └── pages/                  # Route Components
```

---

## 5. Quy ước Lập trình (CONVENTIONS.md)

- **Backend**: Snake_case cho tên file và biến. Trả về JSON chuẩn `status`/`data`. SQL keywords viết hoa.
- **Frontend**: PascalCase cho Component. Sử dụng Tailwind CSS inline. Functional components với hooks.
- **General**: Luôn dùng encoded `uid` trên URL.

---

## 6. Chiến lược Kiểm thử (TESTING.md)

- **Hiện tại**: Chủ yếu là kiểm thử thủ công qua trình duyệt (Manual UAT).
- **Khuyến nghị**:
    - **Unit Test**: PHPUnit (Backend), Vitest (Frontend).
    - **E2E**: Playwright/Cypress cho các luồng Login và Update Profile.
- **Vùng trọng yếu**: Bảo mật ID, Xác thực Token, Tính toàn vẹn dữ liệu cooldown.

---

## 7. Rủi ro & Quan ngại (CONCERNS.md)

- **Security**: Hardcoded secrets (ID_SALT) cần chuyển sang biến môi trường (.env).
- **Technical Debt**: Sự nhập nhằng giữa Numeric ID và UID nếu không xử lý triệt để.
- **Potential Hazards**: Lỗi parse ngày tháng trên các trình duyệt khác nhau (cần chuẩn ISO-8601).
