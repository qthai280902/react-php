<?php
/**
 * [API PROFILE V4] - SMART ID RESOLUTION & SECURITY
 * Hỗ trợ cả Numeric ID (cho người dùng cũ) và Hash ID (UID) cho URL Hardening.
 */

include_once '../../config/database.php';
include_once '../../config/id_helper.php';
include_once '../auth/token_helper.php';

$database = new Database();
$db = $database->getConnection();

$id_input = isset($_GET['id']) ? $_GET['id'] : null;
$user_id = null;

if ($id_input) {
    // [SMART RESOLUTION]: Ưu tiên Numeric ID để tránh giải mã nhầm số nguyên
    if (is_numeric($id_input)) {
        $user_id = (int)$id_input;
    } else {
        // Nếu là chuỗi (UID), thực hiện giải mã
        $user_id = decodeId($id_input);
    }
}

// Chốt chặn cuối: Nếu không có ID hợp lệ hoặc giải mã thất bại
if (!$user_id) {
    http_response_code(404);
    echo json_encode(["status" => "error", "message" => "Không tìm thấy định danh người dùng hợp lệ."]);
    exit();
}

// 1. Lấy thông tin cơ bản
$user_query = "SELECT id, username, full_name, role, avatar_image, cover_image, created_at FROM users WHERE id = ?";
$stmt_user = $db->prepare($user_query);
$stmt_user->execute([$user_id]);
$user_info = $stmt_user->fetch(PDO::FETCH_ASSOC);

if (!$user_info) {
    http_response_code(404);
    echo json_encode(["status" => "error", "message" => "Người dùng không tồn tại."]);
    exit();
}

// 2. Kiểm tra trạng thái is_following (Dành cho người dùng đang đăng nhập)
$is_following = false;
$auth_user = get_auth_user(); 
if ($auth_user) {
    // [SQL SECURITY]: Kiểm tra quan hệ follow bằng composite key
    $check_follow = $db->prepare("SELECT COUNT(*) FROM follows WHERE follower_id = ? AND following_id = ?");
    $check_follow->execute([$auth_user['id'], $user_id]);
    $is_following = ($check_follow->fetchColumn() > 0);
}

// 3. Thống kê Followers/Following/Likes
$followers = $db->prepare("SELECT COUNT(*) FROM follows WHERE following_id = ?");
$followers->execute([$user_id]);
$followers_count = (int)$followers->fetchColumn();

$following = $db->prepare("SELECT COUNT(*) FROM follows WHERE follower_id = ?");
$following->execute([$user_id]);
$following_count = (int)$following->fetchColumn();

$likes = $db->prepare("SELECT COUNT(*) FROM likes l INNER JOIN posts p ON l.post_id = p.id WHERE p.user_id = ?");
$likes->execute([$user_id]);
$likes_count = (int)$likes->fetchColumn();

http_response_code(200);
echo json_encode([
    "status" => "success",
    "data" => [
        "id" => (int)$user_info['id'],        
        "uid" => encodeId($user_info['id']),
        "username" => $user_info['username'],
        "full_name" => $user_info['full_name'],
        "role" => $user_info['role'],
        "avatar_image" => $user_info['avatar_image'],
        "cover_image" => $user_info['cover_image'],
        "created_at" => $user_info['created_at'],
        "is_following" => $is_following,
        "stats" => [
            "followers" => $followers_count,
            "following" => $following_count,
            "total_likes" => $likes_count
        ]
    ]
]);
?>
