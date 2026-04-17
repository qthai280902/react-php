<?php
include_once '../../config/database.php';
include_once '../auth/token_helper.php';

$auth_user = get_auth_user();
if (!$auth_user || empty($auth_user['id'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized access."]);
    exit();
}

$user_id = $auth_user['id'];

$database = new Database();
$db = $database->getConnection();

try {
    $query = "SELECT old_name, new_name, changed_at FROM user_name_history WHERE user_id = :user_id ORDER BY changed_at DESC";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $user_id);
    $stmt->execute();
    
    $history = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $date = new DateTime($row['changed_at']);
        $formatted_date = $date->format('d/m/Y - H:i:s');
        
        $history[] = [
            "old_name" => $row['old_name'],
            "new_name" => $row['new_name'],
            "changed_at" => $formatted_date
        ];
    }

    http_response_code(200);
    echo json_encode([
        "status" => "success",
        "data" => $history
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Lỗi server: " . $e->getMessage()]);
}
?>
