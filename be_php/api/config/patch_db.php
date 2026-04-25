<?php
/**
 * [DATABASE MASTER PATCH] - SCHEMA ALIGNMENT
 * Chạy file này qua trình duyệt hoặc CLI để hạ tầng Database khớp với Codebase.
 */

include_once '../../config/database.php';

if (php_sapi_name() !== 'cli') {
    header('Content-Type: application/json');
}

$database = new Database();
$db = $database->getConnection();

$results = [];

try {
    // 1. Vá cột last_name_change_at (nếu chưa có)
    try {
        $sql1 = "ALTER TABLE users ADD COLUMN last_name_change_at DATETIME NULL DEFAULT NULL AFTER cover_image";
        $db->exec($sql1);
        $results[] = "Đã thêm cột users.last_name_change_at.";
    } catch (PDOException $e) {
        $results[] = "Cột users.last_name_change_at đã tồn tại hoặc bỏ qua.";
    }

    // 2. Tạo bảng lịch sử đổi tên user_name_history
    $sql2 = "CREATE TABLE IF NOT EXISTS user_name_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        old_name VARCHAR(255) NULL,
        new_name VARCHAR(255) NOT NULL,
        changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX (user_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
    
    $db->exec($sql2);
    $results[] = "Đã khởi tạo bảng user_name_history thành công.";

    $response = [
        "status" => "success",
        "results" => $results
    ];

} catch (PDOException $e) {
    $response = [
        "status" => "error",
        "message" => "Lỗi Master Patch: " . $e->getMessage(),
        "trace" => $results
    ];
}

echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
?>
