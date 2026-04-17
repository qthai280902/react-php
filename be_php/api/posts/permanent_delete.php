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

// ── IDOR CHECK: Chỉ cho phép xóa vĩnh viễn bài đã ở thùng rác ──
$stmt = $db->prepare("SELECT user_id, cover_image FROM posts WHERE id = ? AND deleted_at IS NOT NULL");
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
    echo json_encode(["message" => "Bạn không có quyền xóa vĩnh viễn bài viết này."]);
    exit();
}

$UPLOAD_DIR = realpath(__DIR__ . '/../../') . '/uploads/';

// ── BƯỚC 1: Thu thập TOÀN BỘ file cần xóa TRƯỚC KHI xóa DB ──
$files_to_delete = [];

// 1a. Ảnh bìa
if (!empty($post['cover_image'])) {
    $files_to_delete[] = $UPLOAD_DIR . $post['cover_image'];
}

// 1b. Ảnh phụ từ post_images
$img_stmt = $db->prepare("SELECT image_url FROM post_images WHERE post_id = ?");
$img_stmt->execute([$data->post_id]);
while ($img = $img_stmt->fetch(PDO::FETCH_ASSOC)) {
    if (!empty($img['image_url'])) {
        $files_to_delete[] = $UPLOAD_DIR . $img['image_url'];
    }
}

// ── BƯỚC 2: Xóa DB (CASCADE sẽ xóa post_images, post_tags, likes, comments, ratings, reposts) ──
$db->beginTransaction();
try {
    // Xóa ảnh phụ trước (phòng trường hợp FK không có CASCADE)
    $db->prepare("DELETE FROM post_images WHERE post_id = ?")->execute([$data->post_id]);
    
    // Xóa bài viết chính
    $db->prepare("DELETE FROM posts WHERE id = ?")->execute([$data->post_id]);
    
    $db->commit();
} catch (Exception $e) {
    $db->rollBack();
    http_response_code(500);
    echo json_encode(["message" => "Lỗi xóa dữ liệu: " . $e->getMessage()]);
    exit();
}

// ── BƯỚC 3: Xóa file vật lý trên ổ cứng ──
$deleted_files = 0;
foreach ($files_to_delete as $filepath) {
    try {
        if (file_exists($filepath)) {
            unlink($filepath);
            $deleted_files++;
        }
    } catch (Exception $e) {
        // Bỏ qua lỗi file (file có thể đã bị xóa thủ công)
        // Nhưng tuyệt đối không dừng luồng xử lý
        continue;
    }
}

http_response_code(200);
echo json_encode([
    "message" => "Bài viết đã bị xóa vĩnh viễn. Đã dọn sạch {$deleted_files} file ảnh từ server.",
    "files_cleaned" => $deleted_files,
]);
?>
