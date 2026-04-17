-- =============================================
-- PROFILE SYSTEM V2 MIGRATION (FIXED)
-- =============================================

ALTER TABLE users 
ADD COLUMN full_name VARCHAR(255) DEFAULT NULL AFTER password,
ADD COLUMN avatar_image VARCHAR(255) DEFAULT NULL AFTER full_name,
ADD COLUMN cover_image VARCHAR(255) DEFAULT NULL AFTER avatar_image;
