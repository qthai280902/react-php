<?php
/**
 * [API FOLLOW V4] - PHÒNG THỦ TUYỆT ĐỐI & FIX FATAL ERROR
 * Loại bỏ hoàn toàn cột 'id' (do bảng follows sử dụng composite primary key).
 */

include_once '../../config/database.php';
include_once '../../config/id_helper.php';
include_once '../auth/token_helper.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

$user = get_auth_user();
if (!$user) {
    http_response_code(401);
    echo json_encode(["message" => "Vui lòng đăng nhập."]);
    exit();
}

$database = new Database();
$db = $database->getConnection();

$target_raw = isset($_GET['user_id']) ? $_GET['user_id'] : null;
if (!$target_raw) {
    $data = json_decode(file_get_contents("php://input"));
    $target_raw = isset($data->user_id) ? $data->user_id : null;
}

if (!$target_raw) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Thiếu ID người dùng mục tiêu."]);
    exit();
}

// [UID DECODING]
$following_id = decodeId($target_raw);
if (!$following_id && is_numeric($target_raw)) {
    $following_id = (int)$target_raw;
}

if (!$following_id) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Định danh người dùng không hợp lệ."]);
    exit();
}

$follower_id = (int)$user['id'];

if ($follower_id === $following_id) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Bạn không thể tự theo dõi chính mình."]);
    exit();
}

// [PHÒNG THỦ SQL]: Kiểm tra sự tồn tại (Không dùng cột id)
$check_query = "SELECT follower_id FROM follows WHERE follower_id = ? AND following_id = ?";
$stmt_check = $db->prepare($check_query);
$stmt_check->execute([$follower_id, $following_id]);
$is_existing = $stmt_check->fetch();

$is_following = false;

if ($is_existing) {
    // Đã follow -> Bỏ follow (Dùng follower_id & following_id thay cho id)
    $delete_query = "DELETE FROM follows WHERE follower_id = ? AND following_id = ?";
    $db->prepare($delete_query)->execute([$follower_id, $following_id]);
    $is_following = false;
    $message = "Đã bỏ theo dõi.";
} else {
    // Chưa follow -> Thêm follow
    $insert_query = "INSERT INTO follows (follower_id, following_id) VALUES (?, ?)";
    $db->prepare($insert_query)->execute([$follower_id, $following_id]);
    $is_following = true;
    $message = "Đã theo dõi.";
}

// [SOURCE OF TRUTH]: Đếm số lượng thực tế
$count_query = "SELECT COUNT(*) as follower_count FROM follows WHERE following_id = ?";
$stmt_count = $db->prepare($count_query);
$stmt_count->execute([$following_id]);
$follower_count = (int)$stmt_count->fetchColumn();

http_response_code(200);
echo json_encode([
    "status" => "success",
    "message" => $message,
    "follower_count" => max(0, $follower_count),
    "is_following" => $is_following
]);
?>
