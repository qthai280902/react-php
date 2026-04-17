<?php
/**
 * [API READ USER POSTS V2] - HỖ TRỢ UID & PHÒNG THỦ DỮ LIỆU
 */

include_once '../../config/database.php';
include_once '../../config/id_helper.php';

$database = new Database();
$db = $database->getConnection();

$uid_raw = isset($_GET['user_id']) ? $_GET['user_id'] : null;

// [TIÊU CHUẨN JSON RỖNG]: Nếu không có UID, trả về mảng rỗng thay vì lỗi 400
if (!$uid_raw) {
    http_response_code(200);
    echo json_encode(["status" => "success", "data" => []]);
    exit();
}

// [UID DECODING]
$user_id = decodeId($uid_raw);
if (!$user_id && is_numeric($uid_raw)) {
    $user_id = (int)$uid_raw;
}

// Nếu giải mã thất bại, trả về danh sách rỗng (200 OK)
if (!$user_id) {
    http_response_code(200);
    echo json_encode(["status" => "success", "data" => []]);
    exit();
}

try {
    $query = "SELECT 
                p.id, 
                p.title, 
                p.content, 
                p.created_at, 
                p.is_hidden, 
                p.cover_image,
                (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes,
                (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments
              FROM posts p
              WHERE p.user_id = ? AND p.deleted_at IS NULL
              ORDER BY p.created_at DESC";

    $stmt = $db->prepare($query);
    $stmt->execute([$user_id]);
    $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Decode content
    foreach ($posts as &$p) {
        if (isset($p['content'])) {
            $p['content'] = html_entity_decode($p['content']);
        }
    }

    http_response_code(200);
    echo json_encode(["status" => "success", "data" => $posts]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
