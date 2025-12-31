package com.rei.examenbackend.dto.answer;

public class AnswerResponse {
    private Long id;
    private String answerText;
    private boolean correct;
    private Long questionId;
    private Long examinationSessionId;

    public AnswerResponse() {}

    public AnswerResponse(Long id, String answerText, boolean correct, Long questionId, Long examinationSessionId) {
        this.id = id;
        this.answerText = answerText;
        this.correct = correct;
        this.questionId = questionId;
        this.examinationSessionId = examinationSessionId;
    }

    public static Builder builder() {
        return new Builder();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getAnswerText() { return answerText; }
    public void setAnswerText(String answerText) { this.answerText = answerText; }

    public boolean isCorrect() { return correct; }
    public void setCorrect(boolean correct) { this.correct = correct; }

    public Long getQuestionId() { return questionId; }
    public void setQuestionId(Long questionId) { this.questionId = questionId; }

    public Long getExaminationSessionId() { return examinationSessionId; }
    public void setExaminationSessionId(Long examinationSessionId) { this.examinationSessionId = examinationSessionId; }

    public static class Builder {
        private Long id;
        private String answerText;
        private boolean correct;
        private Long questionId;
        private Long examinationSessionId;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder answerText(String answerText) { this.answerText = answerText; return this; }
        public Builder correct(boolean correct) { this.correct = correct; return this; }
        public Builder questionId(Long questionId) { this.questionId = questionId; return this; }
        public Builder examinationSessionId(Long examinationSessionId) { this.examinationSessionId = examinationSessionId; return this; }

        public AnswerResponse build() {
            return new AnswerResponse(id, answerText, correct, questionId, examinationSessionId);
        }
    }
}
