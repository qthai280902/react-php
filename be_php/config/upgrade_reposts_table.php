<?php
include_once 'database.php';

$database = new Database();
$db = $database->getConnection();

try {
    $sql = "ALTER TABLE reposts ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL";
    $db->exec($sql);
    echo "SUCCESS: Added deleted_at to reposts table.";
} catch (PDOException $e) {
    if (strpos($e->getMessage(), "Duplicate column name") !== false) {
        echo "INFO: Column already exists.";
    } else {
        echo "ERROR: " . $e->getMessage();
    }
}
?>
