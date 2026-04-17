<?php

include_once '../../config/database.php';
include_once '../auth/token_helper.php';

$auth_user = get_auth_user();
if (!$auth_user || $auth_user['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(["message" => "Access denied. Admin only."]);
    exit();
}

$data = json_decode(file_get_contents("php://input"));
$id   = isset($data->id) ? (int)$data->id : 0;

if (!$id) {
    http_response_code(400);
    echo json_encode(["message" => "Thiếu ID bài viết."]);
    exit();
}

$database = new Database();
$db       = $database->getConnection();

// Xóa liên quan trước (FK safety)
$db->prepare("DELETE FROM post_tags WHERE post_id = ?")->execute([$id]);
$db->prepare("DELETE FROM comments  WHERE post_id = ?")->execute([$id]);
$db->prepare("DELETE FROM likes     WHERE post_id = ?")->execute([$id]);
$db->prepare("DELETE FROM ratings   WHERE post_id = ?")->execute([$id]);
$db->prepare("DELETE FROM reposts   WHERE post_id = ?")->execute([$id]);

$stmt = $db->prepare("DELETE FROM posts WHERE id = ?");
if ($stmt->execute([$id]) && $stmt->rowCount() > 0) {
    http_response_code(200);
    echo json_encode(["message" => "Đã xóa bài viết #$id thành công."]);
} else {
    http_response_code(404);
    echo json_encode(["message" => "Không tìm thấy bài viết hoặc đã bị xóa trước đó."]);
}
?>
