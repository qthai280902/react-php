<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Xử lý Preflight request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

// Lấy dữ liệu từ request body (JSON)
$data = json_decode(file_get_contents("php://input"));

// Nếu không phải dữ liệu JSON, có thể thử lấy từ $_GET cho đơn giản nhưng đề bài yêu cầu JSON/POST/DELETE
$id = isset($data->id) ? $data->id : null;

if (empty($id)) {
    http_response_code(400); // Bad Request
    echo json_encode(array("message" => "Thiếu ID bài viết để xóa."));
    exit();
}

// Thực thi câu lệnh xóa
$query = "DELETE FROM posts WHERE id = ?";
$stmt = $db->prepare($query);

if ($stmt->execute([$id])) {
    http_response_code(200);
    echo json_encode(array("message" => "Bài viết đã được xóa thành công."));
} else {
    http_response_code(500);
    echo json_encode(array("message" => "Không thể xóa bài viết. Lỗi server."));
}
?>
