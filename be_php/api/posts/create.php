<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../../config/database.php';
include_once '../auth/token_helper.php';

// CẤU HÌNH GAMIFICATION (Dễ dàng chỉnh sửa để test)
define("MIN_FOLLOWERS_TO_POST", 1000);
define("MIN_LIKES_FOR_HIGH_TIER", 10000);
define("POST_LIMIT_BASE", 1);
define("POST_LIMIT_HIGH", 5);

$user = get_auth_user();
if (!$user) {
    http_response_code(401);
    echo json_encode(array("message" => "Vui lòng đăng nhập để đăng bài."));
    exit();
}

$database = new Database();
$db = $database->getConnection();

// --- BƯỚC 1: KIỂM TRA LUẬT GAMIFICATION ---

// 1. Đếm Follower của user hiện tại
$f_query = "SELECT COUNT(*) as total FROM follows WHERE following_id = ?";
$f_stmt = $db->prepare($f_query);
$f_stmt->execute([$user['id']]);
$followers_count = $f_stmt->fetch(PDO::FETCH_ASSOC)['total'];

if ($followers_count < MIN_FOLLOWERS_TO_POST) {
    http_response_code(403);
    echo json_encode(array("message" => "Cần đạt tối thiểu " . MIN_FOLLOWERS_TO_POST . " Followers để có quyền đăng bài. Quyền lực đi đôi với sức ảnh hưởng!"));
    exit();
}

// 2. Đếm tổng Like nhận được từ trước đến nay
$l_query = "SELECT COUNT(*) as total FROM likes l JOIN posts p ON l.post_id = p.id WHERE p.user_id = ?";
$l_stmt = $db->prepare($l_query);
$l_stmt->execute([$user['id']]);
$total_likes = $l_stmt->fetch(PDO::FETCH_ASSOC)['total'];

// 3. Đếm số bài đã đăng trong hôm nay
$today_post_query = "SELECT COUNT(*) as total FROM posts WHERE user_id = ? AND DATE(created_at) = CURDATE()";
$tp_stmt = $db->prepare($today_post_query);
$tp_stmt->execute([$user['id']]);
$today_post_count = $tp_stmt->fetch(PDO::FETCH_ASSOC)['total'];

// Kiểm tra giới hạn hàng ngày
$allowed_limit = ($total_likes >= MIN_LIKES_FOR_HIGH_TIER) ? POST_LIMIT_HIGH : POST_LIMIT_BASE;

if ($today_post_count >= $allowed_limit) {
    http_response_code(403);
    echo json_encode(array(
        "message" => "Bạn đã hết lượt đăng bài hôm nay (Giới hạn: $allowed_limit bài/ngày). Hãy quay lại vào ngày mai!"
    ));
    exit();
}

// --- BƯỚC 2: TIẾN HÀNH ĐĂNG BÀI (NẾU VƯỢT QUA LUẬT) ---

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->title) && !empty($data->content)) {
    $query = "INSERT INTO posts (user_id, title, content) VALUES (:user_id, :title, :content)";
    $stmt = $db->prepare($query);

    $stmt->bindParam(':user_id', $user['id']);
    $stmt->bindParam(':title', $data->title);
    $stmt->bindParam(':content', $data->content);

    if ($stmt->execute()) {
        http_response_code(201);
        echo json_encode(array("message" => "Đăng bài thành công! Bạn còn " . ($allowed_limit - $today_post_count - 1) . " lượt đăng trong ngày."));
    } else {
        http_response_code(500);
        echo json_encode(array("message" => "Lỗi server."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Dữ liệu không đầy đủ."));
}
?>
