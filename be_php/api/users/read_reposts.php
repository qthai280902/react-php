<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once '../../config/database.php';
include_once '../auth/token_helper.php';

$database = new Database();
$db = $database->getConnection();

// Lấy ID của trang Profile đang xem
$profile_id = isset($_GET['user_id']) ? $_GET['user_id'] : null;
if (!$profile_id) {
    http_response_code(400);
    echo json_encode(array("message" => "Thiếu ID người dùng."));
    exit();
}

// Kiểm tra danh tính người đang request (để xử lý is_hidden)
$current_user = get_auth_user();
$is_owner = ($current_user && $current_user['id'] == $profile_id);

// Query JOIN để lấy bài gốc của bài đã Repost
$query = "SELECT 
            r.id as repost_id, 
            r.is_hidden, 
            r.created_at as repost_date,
            p.id, 
            p.title, 
            p.content, 
            p.created_at, 
            u.username as author_name,
            u.id as author_id
          FROM reposts r
          INNER JOIN posts p ON r.post_id = p.id
          INNER JOIN users u ON p.user_id = u.id
          WHERE r.user_id = ?";

// LOGIC BẢO MẬT: Nếu không phải chủ profile, chỉ hiện bài public
if (!$is_owner) {
    $query .= " AND r.is_hidden = 0";
}

$query .= " ORDER BY r.created_at DESC";

$stmt = $db->prepare($query);
$stmt->execute([$profile_id]);

$reposts = $stmt->fetchAll(PDO::FETCH_ASSOC);

http_response_code(200);
echo json_encode($reposts);
?>
