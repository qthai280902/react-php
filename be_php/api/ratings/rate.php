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
    echo json_encode(array("message" => "Vui lòng đăng nhập để đánh giá."));
    exit();
}

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (empty($data->post_id) || empty($data->stars)) {
    http_response_code(400);
    echo json_encode(array("message" => "Thiếu thông tin đánh giá."));
    exit();
}

// Logic Upsert: Nếu đã đánh giá rồi thì cập nhật, chưa thì thêm mới
$query = "INSERT INTO ratings (user_id, post_id, stars) 
          VALUES (:user_id, :post_id, :stars) 
          ON DUPLICATE KEY UPDATE stars = :stars2";

$stmt = $db->prepare($query);

$params = [
    ':user_id' => $user['id'],
    ':post_id' => $data->post_id,
    ':stars' => $data->stars,
    ':stars2' => $data->stars
];

if ($stmt->execute($params)) {
    // Tính lại trung bình cộng để trả về và cập nhật UI ngay
    $query_avg = "SELECT AVG(stars) as avg_rating FROM ratings WHERE post_id = ?";
    $stmt_avg = $db->prepare($query_avg);
    $stmt_avg->execute([$data->post_id]);
    $result = $stmt_avg->fetch(PDO::FETCH_ASSOC);
    $avg = round($result['avg_rating'], 1);

    http_response_code(200);
    echo json_encode(array(
        "message" => "Cảm ơn bạn đã đánh giá!",
        "new_avg" => $avg
    ));
} else {
    http_response_code(500);
    echo json_encode(array("message" => "Lỗi server. Không thể đánh giá."));
}
?>
