-- =============================================
-- SOCIAL BLOG PLATFORM — DỮ LIỆU MẪU V2
-- Chạy file này trong phpMyAdmin
-- =============================================

-- =============================================
-- 1. TẠO 5 USER MẪU
-- =============================================
-- Password mặc định: 123456 (bcrypt hash tương thích password_hash PHP)
-- Hash dưới đây là kết quả của password_hash('123456', PASSWORD_DEFAULT)
INSERT IGNORE INTO users (username, password) VALUES 
('user1',      '$2y$10$YWVyb25hdXRpY3MAAAAAAOHqG3xI6sFPnMO0Q4nFQnAGf5XYHKUy6'),
('dev_pro',    '$2y$10$YWVyb25hdXRpY3MAAAAAAOHqG3xI6sFPnMO0Q4nFQnAGf5XYHKUy6'),
('tech_guru',  '$2y$10$YWVyb25hdXRpY3MAAAAAAOHqG3xI6sFPnMO0Q4nFQnAGf5XYHKUy6'),
('code_ninja', '$2y$10$YWVyb25hdXRpY3MAAAAAAOHqG3xI6sFPnMO0Q4nFQnAGf5XYHKUy6'),
('data_queen', '$2y$10$YWVyb25hdXRpY3MAAAAAAOHqG3xI6sFPnMO0Q4nFQnAGf5XYHKUy6');

-- =============================================
-- 2. ĐẢM BẢO CÓ 8 HASHTAG
-- =============================================
INSERT IGNORE INTO tags (name) VALUES 
('php'), ('react'), ('webdev'), ('javascript'), 
('database'), ('laravel'), ('frontend'), ('backend');

-- =============================================
-- 3. TẠO 15 BÀI VIẾT (mỗi user 3 bài)
-- =============================================

-- user1
INSERT INTO posts (user_id, title, content, created_at) 
SELECT id, 'Tìm hiểu React Hooks từ A đến Z', 'React Hooks là một cuộc cách mạng trong cách viết component. Bài viết này sẽ hướng dẫn bạn sử dụng useState, useEffect và useContext một cách thành thạo...', NOW() - INTERVAL 1 DAY FROM users WHERE username = 'user1';
INSERT INTO posts (user_id, title, content, created_at) 
SELECT id, 'Cách deploy ứng dụng Node.js lên VPS Ubuntu', 'Bạn đã viết xong ứng dụng nhưng không biết đưa lên server? Bài viết này sẽ đi từng bước: cài Nginx, cấu hình PM2 và SSL miễn phí...', NOW() - INTERVAL 3 DAY FROM users WHERE username = 'user1';
INSERT INTO posts (user_id, title, content, created_at) 
SELECT id, 'Sai lầm phổ biến khi học lập trình web', 'Nhiều người mới bắt đầu thường cố học quá nhiều framework cùng lúc. Hãy tập trung vào nền tảng HTML, CSS, JS trước khi chuyển sang React hay Vue...', NOW() - INTERVAL 5 DAY FROM users WHERE username = 'user1';

-- dev_pro
INSERT INTO posts (user_id, title, content, created_at) 
SELECT id, 'Tại sao nên dùng PHP 8.3 cho dự án mới?', 'PHP 8.3 mang đến nhiều cải tiến đáng kể: Typed class constants, cải thiện hiệu suất Opcache và cú pháp readonly ngắn gọn hơn...', NOW() - INTERVAL 2 DAY FROM users WHERE username = 'dev_pro';
INSERT INTO posts (user_id, title, content, created_at) 
SELECT id, 'So sánh REST API và GraphQL: Khi nào nên dùng cái nào?', 'REST phù hợp cho CRUD đơn giản, nhưng GraphQL tỏa sáng khi frontend cần linh hoạt trong việc lấy dữ liệu. Hãy cùng phân tích ưu nhược điểm...', NOW() - INTERVAL 4 DAY FROM users WHERE username = 'dev_pro';
INSERT INTO posts (user_id, title, content, created_at) 
SELECT id, 'Xây dựng Authentication System hoàn chỉnh với JWT', 'Bài viết hướng dẫn từ đầu: tạo token, refresh token, middleware xác thực và quản lý session an toàn...', NOW() - INTERVAL 6 DAY FROM users WHERE username = 'dev_pro';

-- tech_guru
INSERT INTO posts (user_id, title, content, created_at) 
SELECT id, 'Database Design: Nghệ thuật thiết kế bảng quan hệ', 'Một cơ sở dữ liệu tốt bắt đầu từ việc phân tích yêu cầu nghiệp vụ. Hãy cùng học cách chuẩn hóa và tối ưu query performance...', NOW() - INTERVAL 1 DAY FROM users WHERE username = 'tech_guru';
INSERT INTO posts (user_id, title, content, created_at) 
SELECT id, 'Tailwind CSS vs Bootstrap: Trận chiến thế kỉ', 'Bootstrap cho bạn các component sẵn có, Tailwind cho bạn sự tự do tuyệt đối. Bài viết phân tích DX, performance và ecosystem...', NOW() - INTERVAL 3 DAY FROM users WHERE username = 'tech_guru';
INSERT INTO posts (user_id, title, content, created_at) 
SELECT id, 'Microservices không phải là Silver Bullet', 'Đừng vội chuyển sang Microservices chỉ vì nó trending. Monolith được thiết kế tốt vẫn tốt hơn Microservices được thiết kế tệ...', NOW() - INTERVAL 7 DAY FROM users WHERE username = 'tech_guru';

-- code_ninja
INSERT INTO posts (user_id, title, content, created_at) 
SELECT id, 'Clean Code: 10 quy tắc vàng nhất định phải biết', 'Code không chỉ để máy hiểu mà còn để đồng nghiệp đọc. Đặt tên biến rõ ràng, hàm ngắn gọn, và tránh side effects...', NOW() - INTERVAL 2 DAY FROM users WHERE username = 'code_ninja';
INSERT INTO posts (user_id, title, content, created_at) 
SELECT id, 'Git Flow: Quy trình làm việc nhóm chuyên nghiệp', 'Branching strategy quyết định sự thành bại của teamwork. Tìm hiểu về main, develop, feature branch và hotfix...', NOW() - INTERVAL 4 DAY FROM users WHERE username = 'code_ninja';
INSERT INTO posts (user_id, title, content, created_at) 
SELECT id, 'Docker cho developer: Từ zero đến production', 'Dockerfile, docker-compose, volume mount và network. Tất cả những gì bạn cần để container hóa ứng dụng web...', NOW() - INTERVAL 8 DAY FROM users WHERE username = 'code_ninja';

-- data_queen
INSERT INTO posts (user_id, title, content, created_at) 
SELECT id, 'MySQL Performance Tuning: Tối ưu query chạy nhanh gấp 10 lần', 'Sử dụng EXPLAIN ANALYZE, đánh index đúng cách và viết JOIN hiệu quả. Những kỹ thuật giúp database của bạn bay...', NOW() - INTERVAL 1 DAY FROM users WHERE username = 'data_queen';
INSERT INTO posts (user_id, title, content, created_at) 
SELECT id, 'Laravel Eloquent: ORM hay Query Builder?', 'Eloquent đẹp và dễ dùng, nhưng đôi khi Query Builder cho performance tốt hơn. Hãy biết khi nào nên dùng cái nào...', NOW() - INTERVAL 5 DAY FROM users WHERE username = 'data_queen';
INSERT INTO posts (user_id, title, content, created_at) 
SELECT id, 'Bảo mật web application: Checklist 2024', 'SQL Injection, XSS, CSRF, CORS misconfiguration — Danh sách các lỗ hổng phổ biến và cách phòng chống hiệu quả...', NOW() - INTERVAL 9 DAY FROM users WHERE username = 'data_queen';

-- =============================================
-- 4. GÁN HASHTAG CHO BÀI VIẾT
-- =============================================
-- Chiến lược: dùng subquery tìm post_id theo title + tag_id theo name

-- user1 posts
INSERT IGNORE INTO post_tags (post_id, tag_id)
SELECT p.id, t.id FROM posts p, tags t WHERE p.title = 'Tìm hiểu React Hooks từ A đến Z' AND t.name IN ('react', 'frontend', 'javascript');
INSERT IGNORE INTO post_tags (post_id, tag_id)
SELECT p.id, t.id FROM posts p, tags t WHERE p.title = 'Cách deploy ứng dụng Node.js lên VPS Ubuntu' AND t.name IN ('backend', 'webdev');
INSERT IGNORE INTO post_tags (post_id, tag_id)
SELECT p.id, t.id FROM posts p, tags t WHERE p.title = 'Sai lầm phổ biến khi học lập trình web' AND t.name IN ('webdev', 'frontend');

-- dev_pro posts
INSERT IGNORE INTO post_tags (post_id, tag_id)
SELECT p.id, t.id FROM posts p, tags t WHERE p.title = 'Tại sao nên dùng PHP 8.3 cho dự án mới?' AND t.name IN ('php', 'backend');
INSERT IGNORE INTO post_tags (post_id, tag_id)
SELECT p.id, t.id FROM posts p, tags t WHERE p.title = 'So sánh REST API và GraphQL: Khi nào nên dùng cái nào?' AND t.name IN ('backend', 'webdev', 'javascript');
INSERT IGNORE INTO post_tags (post_id, tag_id)
SELECT p.id, t.id FROM posts p, tags t WHERE p.title = 'Xây dựng Authentication System hoàn chỉnh với JWT' AND t.name IN ('php', 'backend', 'webdev');

-- tech_guru posts  
INSERT IGNORE INTO post_tags (post_id, tag_id)
SELECT p.id, t.id FROM posts p, tags t WHERE p.title = 'Database Design: Nghệ thuật thiết kế bảng quan hệ' AND t.name IN ('database', 'backend');
INSERT IGNORE INTO post_tags (post_id, tag_id)
SELECT p.id, t.id FROM posts p, tags t WHERE p.title = 'Tailwind CSS vs Bootstrap: Trận chiến thế kỉ' AND t.name IN ('frontend', 'webdev');
INSERT IGNORE INTO post_tags (post_id, tag_id)
SELECT p.id, t.id FROM posts p, tags t WHERE p.title = 'Microservices không phải là Silver Bullet' AND t.name IN ('backend', 'webdev');

-- code_ninja posts
INSERT IGNORE INTO post_tags (post_id, tag_id)
SELECT p.id, t.id FROM posts p, tags t WHERE p.title = 'Clean Code: 10 quy tắc vàng nhất định phải biết' AND t.name IN ('webdev', 'javascript');
INSERT IGNORE INTO post_tags (post_id, tag_id)
SELECT p.id, t.id FROM posts p, tags t WHERE p.title = 'Git Flow: Quy trình làm việc nhóm chuyên nghiệp' AND t.name IN ('webdev');
INSERT IGNORE INTO post_tags (post_id, tag_id)
SELECT p.id, t.id FROM posts p, tags t WHERE p.title = 'Docker cho developer: Từ zero đến production' AND t.name IN ('backend', 'webdev');

-- data_queen posts
INSERT IGNORE INTO post_tags (post_id, tag_id)
SELECT p.id, t.id FROM posts p, tags t WHERE p.title = 'MySQL Performance Tuning: Tối ưu query chạy nhanh gấp 10 lần' AND t.name IN ('database', 'backend', 'php');
INSERT IGNORE INTO post_tags (post_id, tag_id)
SELECT p.id, t.id FROM posts p, tags t WHERE p.title = 'Laravel Eloquent: ORM hay Query Builder?' AND t.name IN ('laravel', 'php', 'database');
INSERT IGNORE INTO post_tags (post_id, tag_id)
SELECT p.id, t.id FROM posts p, tags t WHERE p.title = 'Bảo mật web application: Checklist 2024' AND t.name IN ('webdev', 'backend', 'php');

-- =============================================
-- 5. TẠO MỘT SỐ TƯƠNG TÁC MẪU
-- =============================================

-- Vài lượt Follow: user khác follow user1 và dev_pro
INSERT IGNORE INTO follows (follower_id, following_id)
SELECT u1.id, u2.id FROM users u1, users u2 WHERE u1.username = 'dev_pro' AND u2.username = 'user1';
INSERT IGNORE INTO follows (follower_id, following_id)
SELECT u1.id, u2.id FROM users u1, users u2 WHERE u1.username = 'tech_guru' AND u2.username = 'user1';
INSERT IGNORE INTO follows (follower_id, following_id)
SELECT u1.id, u2.id FROM users u1, users u2 WHERE u1.username = 'code_ninja' AND u2.username = 'dev_pro';
INSERT IGNORE INTO follows (follower_id, following_id)
SELECT u1.id, u2.id FROM users u1, users u2 WHERE u1.username = 'data_queen' AND u2.username = 'tech_guru';

-- Vài bình luận mẫu
INSERT INTO comments (post_id, user_id, content, created_at)
SELECT p.id, u.id, 'Bài viết rất hữu ích, cảm ơn tác giả!', NOW() - INTERVAL 1 HOUR
FROM posts p, users u WHERE p.title = 'Tìm hiểu React Hooks từ A đến Z' AND u.username = 'dev_pro';

INSERT INTO comments (post_id, user_id, content, created_at)
SELECT p.id, u.id, 'Mình đã áp dụng thành công, performance tăng rõ rệt.', NOW() - INTERVAL 2 HOUR
FROM posts p, users u WHERE p.title = 'MySQL Performance Tuning: Tối ưu query chạy nhanh gấp 10 lần' AND u.username = 'tech_guru';

INSERT INTO comments (post_id, user_id, content, created_at)
SELECT p.id, u.id, 'PHP 8.3 thật sự ấn tượng, đặc biệt là typed constants!', NOW() - INTERVAL 3 HOUR
FROM posts p, users u WHERE p.title = 'Tại sao nên dùng PHP 8.3 cho dự án mới?' AND u.username = 'code_ninja';

-- Vài lượt Like mẫu
INSERT IGNORE INTO likes (user_id, post_id)
SELECT u.id, p.id FROM users u, posts p WHERE u.username = 'tech_guru' AND p.title = 'Tìm hiểu React Hooks từ A đến Z';
INSERT IGNORE INTO likes (user_id, post_id)
SELECT u.id, p.id FROM users u, posts p WHERE u.username = 'code_ninja' AND p.title = 'Tìm hiểu React Hooks từ A đến Z';
INSERT IGNORE INTO likes (user_id, post_id)
SELECT u.id, p.id FROM users u, posts p WHERE u.username = 'data_queen' AND p.title = 'Tại sao nên dùng PHP 8.3 cho dự án mới?';

-- Vài đánh giá sao mẫu
INSERT INTO ratings (user_id, post_id, stars, created_at)
SELECT u.id, p.id, 5, NOW() FROM users u, posts p WHERE u.username = 'dev_pro' AND p.title = 'Database Design: Nghệ thuật thiết kế bảng quan hệ'
ON DUPLICATE KEY UPDATE stars = 5;
INSERT INTO ratings (user_id, post_id, stars, created_at)
SELECT u.id, p.id, 4, NOW() FROM users u, posts p WHERE u.username = 'code_ninja' AND p.title = 'Clean Code: 10 quy tắc vàng nhất định phải biết'
ON DUPLICATE KEY UPDATE stars = 4;
INSERT INTO ratings (user_id, post_id, stars, created_at)
SELECT u.id, p.id, 5, NOW() FROM users u, posts p WHERE u.username = 'user1' AND p.title = 'MySQL Performance Tuning: Tối ưu query chạy nhanh gấp 10 lần'
ON DUPLICATE KEY UPDATE stars = 5;
