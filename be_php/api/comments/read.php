<?php

include_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$post_id = isset($_GET['post_id']) ? $_GET['post_id'] : null;

if (!$post_id) {
    http_response_code(400);
    echo json_encode(array("message" => "Thiếu ID bài viết."));
    exit();
}

$query = "SELECT 
            c.id, 
            c.content, 
            c.created_at, 
            u.id as user_id,
            u.username,
            (SELECT COUNT(*) FROM follows WHERE following_id = u.id) as followers
          FROM comments c
          INNER JOIN users u ON c.user_id = u.id
          WHERE c.post_id = ?
          ORDER BY c.created_at DESC";

$stmt = $db->prepare($query);
$stmt->execute([$post_id]);

$comments = $stmt->fetchAll(PDO::FETCH_ASSOC);

http_response_code(200);
echo json_encode($comments);
?>
