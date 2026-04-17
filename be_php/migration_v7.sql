-- =============================================
-- GIAI ĐOẠN 7: MIGRATION V7
-- Chạy file này trong phpMyAdmin
-- =============================================

-- 1. Thêm cột cover_image cho ảnh bìa bài viết
ALTER TABLE posts ADD COLUMN cover_image VARCHAR(255) DEFAULT NULL AFTER content;

-- 2. Thêm cột is_hidden để ẩn bài viết
ALTER TABLE posts ADD COLUMN is_hidden TINYINT(1) NOT NULL DEFAULT 0 AFTER cover_image;

-- 3. Thêm cột deleted_at cho Soft Delete
ALTER TABLE posts ADD COLUMN deleted_at DATETIME DEFAULT NULL AFTER is_hidden;

-- 4. Tạo bảng lưu nhiều ảnh đính kèm bài viết
CREATE TABLE IF NOT EXISTS post_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Đánh index cho hiệu năng lọc bài viết
CREATE INDEX idx_posts_hidden ON posts (is_hidden);
CREATE INDEX idx_posts_deleted ON posts (deleted_at);
CREATE INDEX idx_post_images_post ON post_images (post_id);
