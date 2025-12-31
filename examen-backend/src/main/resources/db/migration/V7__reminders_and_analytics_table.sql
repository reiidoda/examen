ALTER TABLE user_settings
    ADD COLUMN IF NOT EXISTS email_reminder BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS in_app_reminder BOOLEAN DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS user_metrics (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    sessions_completed INT,
    average_mood DOUBLE PRECISION,
    average_score DOUBLE PRECISION,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (user_id, metric_date)
);

CREATE INDEX IF NOT EXISTS idx_user_metrics_user_date ON user_metrics(user_id, metric_date);
