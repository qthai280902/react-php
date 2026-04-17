<?php

include_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

// Lấy dữ liệu từ Request Body
$data = json_decode(file_get_contents("php://input"));

// Kiểm tra dữ liệu đầu vào
if (empty($data->username) || empty($data->password)) {
    http_response_code(400); // Bad Request
    echo json_encode(array("message" => "Vui lòng nhập đầy đủ Username và Password."));
    exit();
}

// Kiểm tra xem username đã tồn tại chưa
$check_query = "SELECT id FROM users WHERE username = ? LIMIT 1";
$check_stmt = $db->prepare($check_query);
$check_stmt->execute([$data->username]);

if ($check_stmt->rowCount() > 0) {
    http_response_code(400); // Bad Request
    echo json_encode(array("message" => "Tên đăng nhập đã tồn tại."));
    exit();
}

// Mã hóa mật khẩu
$hashed_password = password_hash($data->password, PASSWORD_DEFAULT);

// Chèn user mới vào database
$query = "INSERT INTO users (username, password) VALUES (:username, :password)";
$stmt = $db->prepare($query);

$stmt->bindParam(':username', $data->username);
$stmt->bindParam(':password', $hashed_password);

if ($stmt->execute()) {
    http_response_code(201); // Created
    echo json_encode(array("message" => "Đăng ký tài khoản thành công."));
} else {
    http_response_code(500); // Internal Server Error
    echo json_encode(array("message" => "Có lỗi xảy ra, không thể tạo tài khoản."));
}
?>
