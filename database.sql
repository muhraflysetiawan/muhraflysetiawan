-- Database: birthdayweb
CREATE DATABASE IF NOT EXISTS birthdayweb;
USE birthdayweb;

-- Table: settings
CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(50) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default values
INSERT INTO settings (setting_key, setting_value) VALUES 
('countdown_date', '2025-12-31 00:00:00'),
('video_path', 'assets/videos/default.mp4')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);
