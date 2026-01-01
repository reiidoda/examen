package com.rei.examenbackend.dto.insights;

import java.time.LocalDateTime;
import java.util.List;

public class QuestionSuggestionResponse {
    private String focus;
    private List<String> suggestions;
    private LocalDateTime generatedAt;

    public QuestionSuggestionResponse() {}

    public QuestionSuggestionResponse(String focus, List<String> suggestions, LocalDateTime generatedAt) {
        this.focus = focus;
        this.suggestions = suggestions;
        this.generatedAt = generatedAt;
    }

    public String getFocus() { return focus; }
    public void setFocus(String focus) { this.focus = focus; }

    public List<String> getSuggestions() { return suggestions; }
    public void setSuggestions(List<String> suggestions) { this.suggestions = suggestions; }

    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; }
}
