<?php

include_once '../../config/database.php';
include_once '../auth/token_helper.php';

$auth_user = get_auth_user();
if (!$auth_user || !isset($auth_user['role']) || $auth_user['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(["message" => "Access denied. Admin only."]);
    exit();
}

$user_id = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;
if (!$user_id) {
    http_response_code(400);
    echo json_encode(["message" => "Missing user_id."]);
    exit();
}

$database = new Database();
$db = $database->getConnection();

try {
    // 1. Thông tin cơ bản + Thống kê
    $stmt = $db->prepare("
        SELECT id, username, role, created_at FROM users WHERE id = ?
    ");
    $stmt->execute([$user_id]);
    $info = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$info) {
        http_response_code(404);
        echo json_encode(["message" => "User not found."]);
        exit();
    }

    // Đếm stats riêng từng bảng (an toàn dù bảng có/không có dữ liệu)
    $info['total_posts'] = 0;
    $info['total_comments'] = 0;
    $info['total_reposts'] = 0;
    $info['total_ratings'] = 0;
    $info['total_likes_received'] = 0;
    $info['followers'] = 0;
    $info['following'] = 0;

    // total_posts
    $s = $db->prepare("SELECT COUNT(*) as c FROM posts WHERE user_id = ?");
    $s->execute([$user_id]);
    $info['total_posts'] = (int)$s->fetch(PDO::FETCH_ASSOC)['c'];

    // total_comments
    $s = $db->prepare("SELECT COUNT(*) as c FROM comments WHERE user_id = ?");
    $s->execute([$user_id]);
    $info['total_comments'] = (int)$s->fetch(PDO::FETCH_ASSOC)['c'];

    // total_likes_received (likes trên các bài của user)
    $s = $db->prepare("SELECT COUNT(*) as c FROM likes WHERE post_id IN (SELECT id FROM posts WHERE user_id = ?)");
    $s->execute([$user_id]);
    $info['total_likes_received'] = (int)$s->fetch(PDO::FETCH_ASSOC)['c'];

    // followers
    $s = $db->prepare("SELECT COUNT(*) as c FROM follows WHERE following_id = ?");
    $s->execute([$user_id]);
    $info['followers'] = (int)$s->fetch(PDO::FETCH_ASSOC)['c'];

    // following
    $s = $db->prepare("SELECT COUNT(*) as c FROM follows WHERE follower_id = ?");
    $s->execute([$user_id]);
    $info['following'] = (int)$s->fetch(PDO::FETCH_ASSOC)['c'];

    // total_reposts (try-catch vì bảng có thể chưa tồn tại)
    try {
        $s = $db->prepare("SELECT COUNT(*) as c FROM reposts WHERE user_id = ?");
        $s->execute([$user_id]);
        $info['total_reposts'] = (int)$s->fetch(PDO::FETCH_ASSOC)['c'];
    } catch (Exception $e) {
        $info['total_reposts'] = 0;
    }

    // total_ratings
    try {
        $s = $db->prepare("SELECT COUNT(*) as c FROM ratings WHERE user_id = ?");
        $s->execute([$user_id]);
        $info['total_ratings'] = (int)$s->fetch(PDO::FETCH_ASSOC)['c'];
    } catch (Exception $e) {
        $info['total_ratings'] = 0;
    }

    // 2. Posts gần nhất
    $stmt = $db->prepare("
        SELECT p.id, p.title, p.created_at,
               (SELECT COUNT(*) FROM likes WHERE post_id = p.id) AS likes,
               (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS comments
        FROM posts p WHERE p.user_id = ?
        ORDER BY p.created_at DESC LIMIT 10
    ");
    $stmt->execute([$user_id]);
    $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($posts as &$p) {
        $p['likes']    = (int)$p['likes'];
        $p['comments'] = (int)$p['comments'];
    }

    // 3. Comments gần nhất
    $stmt = $db->prepare("
        SELECT c.id, c.content, c.created_at, p.id AS post_id, p.title AS post_title
        FROM comments c JOIN posts p ON c.post_id = p.id
        WHERE c.user_id = ?
        ORDER BY c.created_at DESC LIMIT 10
    ");
    $stmt->execute([$user_id]);
    $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 4. Reposts gần nhất (nếu bảng tồn tại)
    $reposts = [];
    try {
        $stmt = $db->prepare("
            SELECT r.id AS repost_id, r.created_at AS reposted_at,
                   p.id AS post_id, p.title, u.username AS original_author
            FROM reposts r
            JOIN posts p ON r.post_id = p.id
            JOIN users u ON p.user_id = u.id
            WHERE r.user_id = ?
            ORDER BY r.created_at DESC LIMIT 10
        ");
        $stmt->execute([$user_id]);
        $reposts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        $reposts = [];
    }

    // 5. Ratings gần nhất (nếu bảng tồn tại)
    $ratings = [];
    try {
        $stmt = $db->prepare("
            SELECT rt.stars, rt.created_at AS rated_at, p.id AS post_id, p.title
            FROM ratings rt JOIN posts p ON rt.post_id = p.id
            WHERE rt.user_id = ?
            ORDER BY rt.created_at DESC LIMIT 10
        ");
        $stmt->execute([$user_id]);
        $ratings = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($ratings as &$rt) {
            $rt['stars'] = (int)$rt['stars'];
        }
    } catch (Exception $e) {
        $ratings = [];
    }

    http_response_code(200);
    echo json_encode([
        "info"     => $info,
        "posts"    => $posts,
        "comments" => $comments,
        "reposts"  => $reposts,
        "ratings"  => $ratings,
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Server error: " . $e->getMessage()]);
}
?>
