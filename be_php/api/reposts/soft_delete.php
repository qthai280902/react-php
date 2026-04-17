<?php
include_once '../../config/database.php';
include_once '../auth/token_helper.php';

$database = new Database();
$db = $database->getConnection();

$auth_user = get_auth_user();
if (!$auth_user) {
    http_response_code(401);
    echo json_encode(["message" => "Unauthorized."]);
    exit();
}

$repost_id = isset($_GET['id']) ? $_GET['id'] : null;

if (!$repost_id) {
    http_response_code(400);
    echo json_encode(["message" => "Thiếu ID Repost."]);
    exit();
}

// Kiểm tra quyền sở hữu
$check_query = "SELECT user_id FROM reposts WHERE id = ?";
$stmt = $db->prepare($check_query);
$stmt->execute([$repost_id]);
$repost = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$repost || $repost['user_id'] != $auth_user['id']) {
    http_response_code(403);
    echo json_encode(["message" => "Bạn không có quyền xóa bài đăng lại này."]);
    exit();
}

// Thực hiện Soft Delete
$query = "UPDATE reposts SET deleted_at = NOW() WHERE id = ?";
$stmt = $db->prepare($query);

if ($stmt->execute([$repost_id])) {
    http_response_code(200);
    echo json_encode(["status" => "success", "message" => "Đã chuyển bài đăng lại vào thùng rác."]);
} else {
    http_response_code(500);
    echo json_encode(["message" => "Lỗi hệ thống khi xóa."]);
}
?>
