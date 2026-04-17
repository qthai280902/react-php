<?php

include_once '../../config/database.php';
include_once '../auth/token_helper.php';

$user = get_auth_user();
if (!$user) {
    http_response_code(401);
    echo json_encode(array("message" => "Vui lòng đăng nhập để thực hiện hành động này."));
    exit();
}

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (empty($data->following_id)) {
    http_response_code(400);
    echo json_encode(array("message" => "Thiếu ID người dùng để follow."));
    exit();
}

if ($user['id'] == $data->following_id) {
    http_response_code(400);
    echo json_encode(array("message" => "Bạn không thể theo dõi chính mình."));
    exit();
}

// Kiểm tra xem đã follow chưa
$check_query = "SELECT * FROM follows WHERE follower_id = ? AND following_id = ?";
$stmt_check = $db->prepare($check_query);
$stmt_check->execute([$user['id'], $data->following_id]);

if ($stmt_check->rowCount() > 0) {
    // Đã follow -> Unfollow
    $delete_query = "DELETE FROM follows WHERE follower_id = ? AND following_id = ?";
    $stmt_del = $db->prepare($delete_query);
    $stmt_del->execute([$user['id'], $data->following_id]);
    $status = "unfollowed";
} else {
    // Chưa follow -> Follow
    $insert_query = "INSERT INTO follows (follower_id, following_id) VALUES (?, ?)";
    $stmt_ins = $db->prepare($insert_query);
    $stmt_ins->execute([$user['id'], $data->following_id]);
    $status = "followed";
}

http_response_code(200);
echo json_encode(array("status" => $status));
?>
