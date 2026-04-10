<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

// 1. Nhận tham số từ Request
$tag_filter = isset($_GET['tag']) ? $_GET['tag'] : '';
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 5;
$sort = isset($_GET['sort']) ? $_GET['sort'] : 'newest';

if ($page < 1) $page = 1;
$offset = ($page - 1) * $limit;

// --- BƯỚC 1: ĐẾM TỔNG SỐ BÀI VIẾT (VỚI BỘ LỌC ĐỒNG BỘ) ---
$count_query = "SELECT COUNT(DISTINCT p.id) as total FROM posts p";
if (!empty($tag_filter)) {
    $count_query .= " INNER JOIN post_tags pt ON p.id = pt.post_id 
                      INNER JOIN tags t ON pt.tag_id = t.id 
                      WHERE t.name = :tag";
}

$count_stmt = $db->prepare($count_query);
if (!empty($tag_filter)) {
    $count_stmt->bindParam(':tag', $tag_filter);
}
$count_stmt->execute();
$total_posts = (int)$count_stmt->fetch(PDO::FETCH_ASSOC)['total'];
$total_pages = ceil($total_posts / $limit);

// --- BƯỚC 2: LẤY DỮ LIỆU PHÂN TRANG & SẮP XẾP ---
$query = "SELECT 
            p.id, 
            p.title, 
            p.content, 
            p.created_at, 
            u.id as author_id,
            u.username as author_name,
            GROUP_CONCAT(DISTINCT t.name) as tags,
            AVG(r.stars) as avg_rating,
            (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as total_likes,
            (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as total_comments
          FROM posts p
          INNER JOIN users u ON p.user_id = u.id
          LEFT JOIN post_tags pt ON p.id = pt.post_id
          LEFT JOIN tags t ON pt.tag_id = t.id
          LEFT JOIN ratings r ON p.id = r.post_id";

if (!empty($tag_filter)) {
    $query .= " WHERE p.id IN (
        SELECT post_id FROM post_tags pt 
        JOIN tags t ON pt.tag_id = t.id 
        WHERE t.name = :tag
    )";
}

$query .= " GROUP BY p.id ";

// Logic sắp xếp
switch ($sort) {
    case 'top_rated':
        $query .= " ORDER BY avg_rating DESC, p.created_at DESC ";
        break;
    case 'hot':
        $query .= " ORDER BY (total_likes + total_comments) DESC, p.created_at DESC ";
        break;
    case 'newest':
    default:
        $query .= " ORDER BY p.created_at DESC ";
        break;
}

$query .= " LIMIT :limit OFFSET :offset";

$stmt = $db->prepare($query);

// Bind tham số
if (!empty($tag_filter)) {
    $stmt->bindParam(':tag', $tag_filter);
}
$stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
$stmt->bindParam(':offset', $offset, PDO::PARAM_INT);

$stmt->execute();

$posts = array();
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $row['tags'] = $row['tags'] ? explode(',', $row['tags']) : [];
    $row['avg_rating'] = $row['avg_rating'] ? round($row['avg_rating'], 1) : 0;
    $row['content'] = html_entity_decode($row['content']);
    $row['hot_score'] = (int)$row['total_likes'] + (int)$row['total_comments'];
    array_push($posts, $row);
}

// Trả về dữ liệu kèm metadata phân trang
http_response_code(200);
echo json_encode([
    "status" => "success",
    "pagination" => [
        "total_posts" => $total_posts,
        "total_pages" => $total_pages,
        "current_page" => $page,
        "limit" => $limit
    ],
    "data" => $posts
]);
?>
