package com.rei.examenbackend.dto.answer;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class AnswerRequest {

    @NotBlank
    private String answerText;
    private boolean correct;
    @NotNull
    private Long questionId;

    @NotNull
    private Long examinationSessionId;

    public AnswerRequest() {}

    public AnswerRequest(String answerText, boolean correct, Long questionId, Long examinationSessionId) {
        this.answerText = answerText;
        this.correct = correct;
        this.questionId = questionId;
        this.examinationSessionId = examinationSessionId;
    }

    public String getAnswerText() {
        return answerText;
    }

    public void setAnswerText(String answerText) {
        this.answerText = answerText;
    }

    public boolean isCorrect() {
        return correct;
    }

    public void setCorrect(boolean correct) {
        this.correct = correct;
    }

    public Long getQuestionId() {
        return questionId;
    }

    public void setQuestionId(Long questionId) {
        this.questionId = questionId;
    }

    public Long getExaminationSessionId() {
        return examinationSessionId;
    }

    public void setExaminationSessionId(Long examinationSessionId) {
        this.examinationSessionId = examinationSessionId;
    }
}
