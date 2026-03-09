CREATE TABLE IF NOT EXISTS daily_examinations (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    session_id BIGINT,
    exam_date DATE NOT NULL,
    mood_score INTEGER,
    notes VARCHAR(1000),
    CONSTRAINT fk_daily_exam_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_daily_exam_session FOREIGN KEY (session_id) REFERENCES examination_sessions(id) ON DELETE SET NULL,
    CONSTRAINT uq_daily_exam_user_date UNIQUE (user_id, exam_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_exam_user_date ON daily_examinations(user_id, exam_date);
