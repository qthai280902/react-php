<?php
function get_auth_user() {
    // Đánh chặn Preflight Request (OPTIONS) để tránh lỗi 401 oan uổng
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }

    $auth_header = null;
    
    // 1. Thử dùng apache_request_headers()
    if (function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        foreach ($headers as $key => $value) {
            if (strtolower($key) == 'authorization') {
                $auth_header = $value;
                break;
            }
        }
    }

    // 2. Thử dùng $_SERVER['HTTP_AUTHORIZATION']
    if (!$auth_header && isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $auth_header = $_SERVER['HTTP_AUTHORIZATION'];
    }

    // 3. Thử dùng $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] (cho cấu hình FastCGI/Nginx)
    if (!$auth_header && isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $auth_header = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    }

    if (!$auth_header) {
        return null;
    }

    // Định dạng: Bearer <base64_token>
    $parts = explode(" ", $auth_header);
    if (count($parts) != 2 || strtolower($parts[0]) != 'bearer') {
        return null;
    }

    $token = $parts[1];
    
    try {
        $decoded = json_decode(base64_decode($token), true);
        if (!$decoded || !isset($decoded['id'])) {
            return null;
        }
        return $decoded;
    } catch (Exception $e) {
        return null;
    }
}
?>
