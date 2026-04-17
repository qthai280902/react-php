<?php
/**
 * [ID HARDENING HELPER V2]
 * Hệ thống mã hóa định danh tập trung (Source of Truth).
 * Đảm bảo đồng bộ 100% giữa URL và Database.
 */

// Salt cố định - KHÔNG ĐƯỢC THAY ĐỔI để tránh làm hỏng các link đã index
if (!defined('ID_SALT')) {
    define('ID_SALT', 'SOCIAL-BLOG-HARDENING-2026-XP');
}

/**
 * Mã hóa ID số thành chuỗi băm (Hashed UID)
 */
function encodeId($id) {
    if (!$id) return null;
    $payload = ID_SALT . $id;
    // URL-safe Base64 encoding
    return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
}

/**
 * Giải mã chuỗi băm về ID số nguyên
 */
function decodeId($hash) {
    if (!$hash) return null;
    try {
        // Restore Base64 padding
        $padded_hash = str_replace(['-', '_'], ['+', '/'], $hash);
        $decoded = base64_decode($padded_hash);
        
        // Kiểm tra tính hợp lệ của Salt
        if (strpos($decoded, ID_SALT) === 0) {
            return (int)substr($decoded, strlen(ID_SALT));
        }
    } catch (Exception $e) {
        return null;
    }
    return null;
}
?>
