<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

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

if (empty($data->id)) {
    http_response_code(400);
    echo json_encode(array("message" => "Thiếu ID bình luận."));
    exit();
}

// Lấy thông tin bình luận và tác giả bài viết để kiểm tra quyền
$query = "SELECT c.user_id as comment_author_id, p.user_id as post_author_id 
          FROM comments c 
          INNER JOIN posts p ON c.post_id = p.id 
          WHERE c.id = ?";
$stmt = $db->prepare($query);
$stmt->execute([$data->id]);
$comment = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$comment) {
    http_response_code(404);
    echo json_encode(array("message" => "Bình luận không tồn tại."));
    exit();
}

// KIỂM TRA QUYỀN (Auth Check)
// Quyền xóa thuộc về: Chủ bình luận HOẶC Chủ bài viết
if ($user['id'] == $comment['comment_author_id'] || $user['id'] == $comment['post_author_id']) {
    $del_query = "DELETE FROM comments WHERE id = ?";
    $del_stmt = $db->prepare($del_query);
    if ($del_stmt->execute([$data->id])) {
        http_response_code(200);
        echo json_encode(array("message" => "Bình luận đã được xóa thành công."));
    } else {
        http_response_code(500);
        echo json_encode(array("message" => "Lỗi server khi xóa bình luận."));
    }
} else {
    http_response_code(403);
    echo json_encode(array("message" => "Bạn không có quyền xóa bình luận này."));
}
?>
