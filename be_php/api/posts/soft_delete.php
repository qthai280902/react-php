<?php

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

// ── IDOR CHECK ──
$stmt = $db->prepare("SELECT user_id FROM posts WHERE id = ? AND deleted_at IS NULL");
$stmt->execute([$data->post_id]);
$post = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$post) {
    http_response_code(404);
    echo json_encode(["message" => "Bài viết không tồn tại hoặc đã ở trong thùng rác."]);
    exit();
}

$is_admin = (isset($user['role']) && $user['role'] === 'admin');
if ($user['id'] != $post['user_id'] && !$is_admin) {
    http_response_code(403);
    echo json_encode(["message" => "Bạn không có quyền xóa bài viết này."]);
    exit();
}

// ── SOFT DELETE: set deleted_at = NOW() ──
$upd = $db->prepare("UPDATE posts SET deleted_at = NOW() WHERE id = ?");
$upd->execute([$data->post_id]);

http_response_code(200);
echo json_encode([
    "message" => "Bài viết đã được chuyển vào Thùng rác. Bạn có 30 ngày để khôi phục.",
]);
?>
