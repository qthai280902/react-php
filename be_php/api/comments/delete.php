<?php

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../../config/database.php';
include_once '../auth/token_helper.php';

$user = get_auth_user();
if (!$user) {
    http_response_code(401);
    echo json_encode(["message" => "Unauthorized"]);
    exit();
}

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (empty($data->id)) {
    http_response_code(400);
    echo json_encode(["message" => "Thiếu ID bình luận."]);
    exit();
}

// ── LẤY THÔNG TIN BÌNH LUẬN + BÀI VIẾT ──
$stmt = $db->prepare("
    SELECT 
        c.user_id  AS comment_author_id, 
        p.user_id  AS post_author_id
    FROM comments c
    INNER JOIN posts p ON c.post_id = p.id
    WHERE c.id = ?
");
$stmt->execute([$data->id]);
$comment = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$comment) {
    http_response_code(404);
    echo json_encode(["message" => "Bình luận không tồn tại."]);
    exit();
}

// ── KIỂM TRA QUYỀN XÓA (3 cấp) ──
$can_delete = false;
$reason = '';

// Cấp 1: Admin luôn có quyền tối thượng
if (isset($user['role']) && $user['role'] === 'admin') {
    $can_delete = true;
    $reason = 'admin_authority';
}

// Cấp 2: Chủ sở hữu bình luận
if (!$can_delete && $user['id'] == $comment['comment_author_id']) {
    $can_delete = true;
    $reason = 'comment_owner';
}

// Cấp 3: Chủ bài viết — chỉ khi có >= 10000 followers
if (!$can_delete && $user['id'] == $comment['post_author_id']) {
    $f_stmt = $db->prepare("SELECT COUNT(*) as total FROM follows WHERE following_id = ?");
    $f_stmt->execute([$user['id']]);
    $follower_count = (int)$f_stmt->fetch(PDO::FETCH_ASSOC)['total'];

    if ($follower_count >= 10000) {
        $can_delete = true;
        $reason = 'post_owner_legendary';
    } else {
        // Chủ bài viết nhưng chưa đủ followers
        http_response_code(403);
        echo json_encode([
            "message" => "Bạn cần đạt 10,000 followers để có quyền xóa bình luận trên bài của mình. Hiện tại: {$follower_count}.",
            "followers" => $follower_count,
            "required" => 10000,
        ]);
        exit();
    }
}

// ── THỰC THI XÓA ──
if ($can_delete) {
    $del_stmt = $db->prepare("DELETE FROM comments WHERE id = ?");
    if ($del_stmt->execute([$data->id])) {
        http_response_code(200);
        echo json_encode([
            "message" => "Bình luận đã được xóa.",
            "deleted_by" => $reason,
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Lỗi server khi xóa bình luận."]);
    }
} else {
    http_response_code(403);
    echo json_encode(["message" => "Bạn không có quyền xóa bình luận này."]);
}
?>
