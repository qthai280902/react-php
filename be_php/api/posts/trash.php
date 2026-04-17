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

$UPLOAD_DIR = realpath(__DIR__ . '/../../') . '/uploads/';

// ── AUTO-PURGE: Xóa vĩnh viễn bài quá 30 ngày trong thùng rác ──
// Chỉ xóa bài của user hiện tại (hoặc toàn bộ nếu admin)
$is_admin = (isset($user['role']) && $user['role'] === 'admin');

$purge_condition = $is_admin ? "" : "AND user_id = ?";
$purge_query = "SELECT id, cover_image FROM posts WHERE deleted_at IS NOT NULL AND deleted_at < DATE_SUB(NOW(), INTERVAL 30 DAY) {$purge_condition}";
$purge_stmt = $db->prepare($purge_query);

if ($is_admin) {
    $purge_stmt->execute();
} else {
    $purge_stmt->execute([$user['id']]);
}

$expired_posts = $purge_stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($expired_posts as $exp) {
    // Xóa file ảnh bìa
    if (!empty($exp['cover_image'])) {
        $cover_path = $UPLOAD_DIR . $exp['cover_image'];
        if (file_exists($cover_path)) { try { unlink($cover_path); } catch (Exception $e) {} }
    }

    // Xóa file ảnh phụ
    $img_stmt = $db->prepare("SELECT image_url FROM post_images WHERE post_id = ?");
    $img_stmt->execute([$exp['id']]);
    while ($img = $img_stmt->fetch(PDO::FETCH_ASSOC)) {
        if (!empty($img['image_url'])) {
            $img_path = $UPLOAD_DIR . $img['image_url'];
            if (file_exists($img_path)) { try { unlink($img_path); } catch (Exception $e) {} }
        }
    }

    // Xóa DB records
    $db->prepare("DELETE FROM post_images WHERE post_id = ?")->execute([$exp['id']]);
    $db->prepare("DELETE FROM posts WHERE id = ?")->execute([$exp['id']]);
}

$purged_count = count($expired_posts);

// ── LẤY DANH SÁCH THÙNG RÁC HIỆN TẠI ──
$query = "SELECT 
            p.id, p.title, p.cover_image, p.deleted_at, p.created_at,
            DATEDIFF(DATE_ADD(p.deleted_at, INTERVAL 30 DAY), NOW()) as days_remaining
          FROM posts p
          WHERE p.deleted_at IS NOT NULL AND p.user_id = ?
          ORDER BY p.deleted_at DESC";
$stmt = $db->prepare($query);
$stmt->execute([$user['id']]);

$trash_items = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Cast kiểu dữ liệu
foreach ($trash_items as &$item) {
    $item['days_remaining'] = max(0, (int)$item['days_remaining']);
}

http_response_code(200);
echo json_encode([
    "trash" => $trash_items,
    "auto_purged" => $purged_count,
]);
?>
