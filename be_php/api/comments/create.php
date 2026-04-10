<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../../config/database.php';
include_once '../auth/token_helper.php';

$user = get_auth_user();
if (!$user) {
    http_response_code(401);
    echo json_encode(array("message" => "Vui lòng đăng nhập để bình luận."));
    exit();
}

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (empty($data->post_id) || empty($data->content)) {
    http_response_code(400);
    echo json_encode(array("message" => "Thiếu thông tin bình luận."));
    exit();
}

$query = "INSERT INTO comments (user_id, post_id, content) VALUES (?, ?, ?)";
$stmt = $db->prepare($query);

// Quan trọng: Lấy user_id từ Token, không lấy từ Request Body
if ($stmt->execute([$user['id'], $data->post_id, $data->content])) {
    http_response_code(201);
    echo json_encode(array(
        "message" => "Bình luận đã được gửi.",
        "comment" => [
            "id" => $db->lastInsertId(),
            "username" => $user['username'],
            "content" => $data->content,
            "created_at" => date('Y-m-d H:i:s')
        ]
    ));
} else {
    http_response_code(500);
    echo json_encode(array("message" => "Lỗi server. Không thể gửi bình luận."));
}
?>
