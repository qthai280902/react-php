<?php
// CORS đã được xử lý tự động qua database.php → cors.php

include_once '../../config/database.php';
include_once '../auth/token_helper.php';

$database = new Database();
$db = $database->getConnection();

$user_id = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;

if (!$user_id) {
    http_response_code(400);
    echo json_encode(["message" => "Thiếu user_id."]);
    exit();
}

// ── KIỂM TRA QUYỀN: Ai đang xem? ──
$auth_user = get_auth_user(); // Có thể null nếu chưa đăng nhập
$is_owner  = ($auth_user && $auth_user['id'] == $user_id);
$is_admin  = ($auth_user && isset($auth_user['role']) && $auth_user['role'] === 'admin');

// ── XÂY DỰNG QUERY ĐỘNG ──
// Chủ profile hoặc Admin → thấy TẤT CẢ bài (kể cả is_hidden = 1)
// Người lạ → chỉ thấy bài công khai (is_hidden = 0)
$visibility_clause = ($is_owner || $is_admin) ? "" : "AND p.is_hidden = 0";

$query = "SELECT 
            p.id, p.title, p.content, p.created_at, p.cover_image, p.is_hidden,
            u.id as author_id, u.username as author_name,
            GROUP_CONCAT(DISTINCT tg.name) as tags,
            AVG(r.stars) as avg_rating,
            (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as total_likes,
            (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as total_comments
          FROM posts p
          INNER JOIN users u ON p.user_id = u.id
          LEFT JOIN post_tags pt ON p.id = pt.post_id
          LEFT JOIN tags tg ON pt.tag_id = tg.id
          LEFT JOIN ratings r ON p.id = r.post_id
          WHERE p.user_id = ? AND p.deleted_at IS NULL {$visibility_clause}
          GROUP BY p.id
          ORDER BY p.created_at DESC";

$stmt = $db->prepare($query);
$stmt->execute([$user_id]);

$posts = [];
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $row['tags']       = $row['tags'] ? explode(',', $row['tags']) : [];
    $row['avg_rating'] = $row['avg_rating'] ? round((float)$row['avg_rating'], 1) : 0;
    $row['content']    = html_entity_decode($row['content']);
    $row['is_hidden']  = (int)$row['is_hidden'];
    $row['total_likes']    = (int)$row['total_likes'];
    $row['total_comments'] = (int)$row['total_comments'];
    $posts[] = $row;
}

http_response_code(200);
echo json_encode($posts);
?>
