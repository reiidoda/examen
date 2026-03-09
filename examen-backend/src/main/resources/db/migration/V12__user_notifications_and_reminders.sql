ALTER TABLE user_settings
    ADD COLUMN IF NOT EXISTS last_reminder_sent_date DATE;

CREATE TABLE IF NOT EXISTS user_notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(140) NOT NULL,
    message VARCHAR(500) NOT NULL,
    notification_type VARCHAR(40) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    read_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created_at
    ON user_notifications(user_id, created_at);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
    ON user_notifications(user_id, read_at);
