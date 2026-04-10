<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

// Lấy dữ liệu từ Request Body
$data = json_decode(file_get_contents("php://input"));

if (empty($data->username) || empty($data->password)) {
    http_response_code(400);
    echo json_encode(array("message" => "Vui lòng nhập đầy đủ Username và Password."));
    exit();
}

// Tìm user theo username
$query = "SELECT id, username, password FROM users WHERE username = ? LIMIT 1";
$stmt = $db->prepare($query);
$stmt->execute([$data->username]);

if ($stmt->rowCount() > 0) {
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    $id = $row['id'];
    $username = $row['username'];
    $hashed_password = $row['password'];

    // Kiểm tra mật khẩu
    if (password_verify($data->password, $hashed_password)) {
        // Tạo token giả lập (Base64)
        $token_data = [
            "id" => $id,
            "username" => $username,
            "iat" => time()
        ];
        $token = base64_encode(json_encode($token_data));

        http_response_code(200);
        echo json_encode(array(
            "message" => "Đăng nhập thành công.",
            "token" => $token,
            "user" => [
                "id" => $id,
                "username" => $username
            ]
        ));
    } else {
        http_response_code(401); // Unauthorized
        echo json_encode(array("message" => "Mật khẩu không chính xác."));
    }
} else {
    http_response_code(401);
    echo json_encode(array("message" => "Tên đăng nhập không tồn tại."));
}
?>
