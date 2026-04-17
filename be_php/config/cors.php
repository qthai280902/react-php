<?php
// ================================================
// CORS CONFIGURATION — PRODUCTION GRADE
// File này PHẢI được include ở ĐẦU TIÊN của mọi API
// ================================================

// 1. Đọc Origin từ request gửi tới (Dynamic Origin)
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

// 2. Whitelist các domain được phép truy cập
$allowed_origins = [
    'http://localhost:5173',    // Vite dev server
    'http://localhost:3000',    // Fallback dev
    'http://127.0.0.1:5173',   // Alias localhost
];

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
} else if (!empty($origin)) {
    // Origin không nằm trong whitelist → Chặn
    http_response_code(403);
    echo json_encode(["message" => "Origin not allowed."]);
    exit();
}

// 3. Headers chuẩn
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// 4. Xử lý Preflight (OPTIONS) ngay lập tức, không chạy logic phía dưới
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
?>
