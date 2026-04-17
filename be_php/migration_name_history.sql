-- =============================================
-- USER NAME HISTORY SYSTEM MIGRATION
-- =============================================

CREATE TABLE IF NOT EXISTS `user_name_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `old_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `new_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `changed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_name_history_user_id` (`user_id`),
  CONSTRAINT `fk_name_history_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
