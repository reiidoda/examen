ALTER TABLE password_reset_tokens
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();

UPDATE password_reset_tokens
SET created_at = COALESCE(created_at, expires_at - INTERVAL '1 hour');

CREATE INDEX IF NOT EXISTS idx_reset_token_user_created_at
    ON password_reset_tokens(user_id, created_at);
