<?php

include_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$user_id = isset($_GET['id']) ? $_GET['id'] : null;

if (!$user_id) {
    http_response_code(400);
    echo json_encode(array("message" => "Thiếu ID người dùng."));
    exit();
}

// 1. Lấy thông tin cơ bản của User
$user_query = "SELECT id, username, full_name, role, avatar_image, cover_image, created_at FROM users WHERE id = ?";
$stmt_user = $db->prepare($user_query);
$stmt_user->execute([$user_id]);
$user_info = $stmt_user->fetch(PDO::FETCH_ASSOC);

if (!$user_info) {
    http_response_code(404);
    echo json_encode(array("message" => "Người dùng không tồn tại."));
    exit();
}

// 2. Thống kê Followers (Ai đang theo dõi mình)
$followers_query = "SELECT COUNT(*) as total FROM follows WHERE following_id = ?";
$stmt_followers = $db->prepare($followers_query);
$stmt_followers->execute([$user_id]);
$followers_count = $stmt_followers->fetch(PDO::FETCH_ASSOC)['total'];

// 3. Thống kê Following (Mình đang theo dõi ai)
$following_query = "SELECT COUNT(*) as total FROM follows WHERE follower_id = ?";
$stmt_following = $db->prepare($following_query);
$stmt_following->execute([$user_id]);
$following_count = $stmt_following->fetch(PDO::FETCH_ASSOC)['total'];

// 4. Tổng số LIKE nhận được từ tất cả bài viết của User này
$total_likes_query = "SELECT COUNT(*) as total 
                      FROM likes l
                      INNER JOIN posts p ON l.post_id = p.id
                      WHERE p.user_id = ?";
$stmt_likes = $db->prepare($total_likes_query);
$stmt_likes->execute([$user_id]);
$total_likes = $stmt_likes->fetch(PDO::FETCH_ASSOC)['total'];

http_response_code(200);
echo json_encode(array(
    "id" => $user_info['id'],
    "username" => $user_info['username'],
    "full_name" => $user_info['full_name'],
    "role" => $user_info['role'],
    "avatar_image" => $user_info['avatar_image'],
    "cover_image" => $user_info['cover_image'],
    "created_at" => $user_info['created_at'],
    "stats" => [
        "followers" => (int)$followers_count,
        "following" => (int)$following_count,
        "total_likes" => (int)$total_likes
    ]
));
?>
