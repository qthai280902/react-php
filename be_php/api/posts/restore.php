<?php

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

include_once '../../config/database.php';
include_once '../auth/token_helper.php';

// ── JWT AUTH ──
$user = get_auth_user();
if (!$user) {
    http_response_code(401);
    echo json_encode(["message" => "Yêu cầu xác thực."]);
    exit();
}

$database = new Database();
$db = $database->getConnection();
$data = json_decode(file_get_contents("php://input"));

if (empty($data->post_id)) {
    http_response_code(400);
    echo json_encode(["message" => "Thiếu post_id."]);
    exit();
}

// ── IDOR CHECK: Chỉ lấy bài đã bị soft-delete ──
$stmt = $db->prepare("SELECT user_id FROM posts WHERE id = ? AND deleted_at IS NOT NULL");
$stmt->execute([$data->post_id]);
$post = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$post) {
    http_response_code(404);
    echo json_encode(["message" => "Bài viết không tồn tại trong thùng rác."]);
    exit();
}

$is_admin = (isset($user['role']) && $user['role'] === 'admin');
if ($user['id'] != $post['user_id'] && !$is_admin) {
    http_response_code(403);
    echo json_encode(["message" => "Bạn không có quyền khôi phục bài viết này."]);
    exit();
}

// ── RESTORE: set deleted_at = NULL ──
$upd = $db->prepare("UPDATE posts SET deleted_at = NULL WHERE id = ?");
$upd->execute([$data->post_id]);

http_response_code(200);
echo json_encode([
    "message" => "Bài viết đã được khôi phục thành công!",
]);
?>
