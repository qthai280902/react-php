<?php

include_once '../../config/database.php';
include_once '../auth/token_helper.php';

$auth_user = get_auth_user();
if (!$auth_user || !isset($auth_user['role']) || $auth_user['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(["message" => "Access denied. Admin only."]);
    exit();
}

$database = new Database();
$db = $database->getConnection();

$query = "SELECT id, username, role, created_at FROM users ORDER BY id ASC";
$stmt = $db->prepare($query);
$stmt->execute();

$users = $stmt->fetchAll(PDO::FETCH_ASSOC);

http_response_code(200);
echo json_encode($users);
?>
