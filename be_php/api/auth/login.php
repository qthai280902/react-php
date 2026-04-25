<?php

include_once '../../config/database.php';
include_once '../../config/id_helper.php';

$database = new Database();
$db = $database->getConnection();

// Lấy dữ liệu từ Request Body
$data = json_decode(file_get_contents("php://input"));

if (empty($data->username) || empty($data->password)) {
    http_response_code(400);
    echo json_encode(array("message" => "Vui lòng nhập đầy đủ Username và Password."));
    exit();
}

// SELECT đầy đủ thông tin để đồng bộ Avatar sau khi Re-login
$query = "SELECT id, username, password, full_name, role, avatar_image, cover_image, UNIX_TIMESTAMP(last_name_change_at) as last_name_change_at FROM users WHERE username = ? LIMIT 1";
$stmt = $db->prepare($query);

try {
    $stmt->execute([$data->username]);
} catch (PDOException $e) {
    http_response_code(500);
    // [DEFENSIVE CHECK]: Phát hiện lỗi thiếu cột (1054)
    if ($e->getCode() == '42S22' || str_contains($e->getMessage(), '1054')) {
        echo json_encode(array(
            "status" => "error",
            "message" => "Hệ thống CSDL chưa được cập nhật mấu chốt. Vui lòng chạy file patch_db.php để đồng bộ.",
            "debug_error" => $e->getMessage()
        ));
    } else {
        echo json_encode(array(
            "status" => "error",
            "message" => "Lỗi CSDL: " . $e->getMessage()
        ));
    }
    exit();
}

if ($stmt->rowCount() > 0) {
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    $id = $row['id'];
    $username = $row['username'];
    $hashed_password = $row['password'];
    $full_name = $row['full_name'];
    $role = $row['role'];
    $avatar_image = $row['avatar_image'];
    $cover_image = $row['cover_image'];
    $last_name_change_at = $row['last_name_change_at'];

    // Kiểm tra mật khẩu
    if (password_verify($data->password, $hashed_password)) {
        // [URL HARDENING V2]: Cung cấp song song id và uid
        $uid = encodeId($id);
        
        $token_data = [
            "id" => $id,
            "uid" => $uid,
            "username" => $username,
            "full_name" => $full_name,
            "role" => $role,
            "iat" => time()
        ];
        $token = base64_encode(json_encode($token_data));

        http_response_code(200);
        echo json_encode(array(
            "status" => "success",
            "message" => "Đăng nhập thành công.",
            "token" => $token,
            "user" => [
                "id" => $id,
                "uid" => $uid,
                "username" => $username,
                "full_name" => $full_name,
                "role" => $role,
                "avatar_image" => $avatar_image,
                "cover_image" => $cover_image,
                "last_name_change_at" => $last_name_change_at
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