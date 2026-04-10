<?php
// Gửi các Header cần thiết (đã có trong database.php nhưng cứ để đây cho chắc chắn hoặc thay đổi nếu cần)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once '../../config/database.php';

// Khởi tạo DB & Connect
$database = new Database();
$db = $database->getConnection();

// Viết câu lệnh SQL Join
$query = "SELECT 
            p.id, 
            p.title, 
            p.content, 
            p.created_at, 
            u.username as author_name 
          FROM posts p 
          INNER JOIN users u ON p.user_id = u.id 
          ORDER BY p.created_at DESC";

// Chuẩn bị và thực thi
$stmt = $db->prepare($query);
$stmt->execute();

$num = $stmt->rowCount();

// Kiểm tra nếu có dữ liệu
if ($num > 0) {
    $posts_arr = array();
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        extract($row);
        
        $post_item = array(
            "id" => $id,
            "title" => $title,
            "content" => html_entity_decode($content),
            "author_name" => $author_name,
            "created_at" => $created_at
        );
        
        array_push($posts_arr, $post_item);
    }
    
    // Trả về mã 200 và dữ liệu JSON
    http_response_code(200);
    echo json_encode($posts_arr);
} else {
    // Không tìm thấy bài viết nào
    http_response_code(404);
    echo json_encode(array("message" => "No posts found."));
}
?>
