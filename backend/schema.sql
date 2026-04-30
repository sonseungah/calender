-- ============================================================
-- 스케줄링 · MySQL Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS scheduling
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE scheduling;

-- 스트리머
CREATE TABLE IF NOT EXISTS streamers (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  channel_id     VARCHAR(100) UNIQUE NOT NULL,
  name           VARCHAR(50)  NOT NULL,
  handle         VARCHAR(50)  UNIQUE NOT NULL,
  avatar_url     TEXT,
  follower_count INT          NOT NULL DEFAULT 0,
  is_verified    TINYINT(1)   NOT NULL DEFAULT 0,
  created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_handle (handle),
  INDEX idx_follower (follower_count DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 유저 (팬 + 스트리머 공용)
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255)        NOT NULL,
  streamer_id   INT                 DEFAULT NULL,
  created_at    DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (streamer_id) REFERENCES streamers(id) ON DELETE SET NULL,
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 방송 일정
CREATE TABLE IF NOT EXISTS events (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  streamer_id INT          NOT NULL,
  date        DATE         NOT NULL,
  start_time  TIME         NOT NULL,
  title       VARCHAR(100) NOT NULL,
  category    ENUM('game','chat','collab','member','off') NOT NULL,
  description TEXT,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (streamer_id) REFERENCES streamers(id) ON DELETE CASCADE,
  INDEX idx_streamer_date (streamer_id, date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 팔로우
CREATE TABLE IF NOT EXISTS follows (
  user_id      INT      NOT NULL,
  streamer_id  INT      NOT NULL,
  followed_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, streamer_id),
  FOREIGN KEY (user_id)     REFERENCES users(id)     ON DELETE CASCADE,
  FOREIGN KEY (streamer_id) REFERENCES streamers(id) ON DELETE CASCADE,
  INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
