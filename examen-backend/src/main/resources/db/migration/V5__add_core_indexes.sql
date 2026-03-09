-- Add useful indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_answers_question ON answers(question_id);
CREATE INDEX IF NOT EXISTS idx_answers_session ON answers(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_completed ON examination_sessions(user_id, completed_at);
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category_id);
