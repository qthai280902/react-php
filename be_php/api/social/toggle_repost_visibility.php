<?php

include_once '../../config/database.php';
include_once '../auth/token_helper.php';

$user = get_auth_user();
if (!$user) {
    http_response_code(401);
    echo json_encode(array("message" => "Unauthorized"));
    exit();
}

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (empty($data->repost_id)) {
    http_response_code(400);
    echo json_encode(array("message" => "Thiếu ID bản ghi Repost."));
    exit();
}

// Kiểm tra quyền: Chỉ được ẩn/hiện bài của chính mình
$query = "SELECT user_id FROM reposts WHERE id = ?";
$stmt = $db->prepare($query);
$stmt->execute([$data->repost_id]);
$repost = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$repost || $repost['user_id'] != $user['id']) {
    http_response_code(403);
    echo json_encode(array("message" => "Bạn không có quyền thực hiện hành động này."));
    exit();
}

// Cập nhật trạng thái
$update_query = "UPDATE reposts SET is_hidden = NOT is_hidden WHERE id = ?";
$up_stmt = $db->prepare($update_query);
if ($up_stmt->execute([$data->repost_id])) {
    http_response_code(200);
    echo json_encode(array("message" => "Đã cập nhật trạng thái hiển thị của bài Repost."));
} else {
    http_response_code(500);
    echo json_encode(array("message" => "Lỗi server."));
}
?>
