package com.rei.examenbackend.dto.insights;

import java.time.LocalDateTime;
import java.util.List;

public class InsightsSummaryResponse {
    private String summary;
    private List<String> highlights;
    private int periodDays;
    private long sessionsCompleted;
    private Double averageFeeling;
    private LocalDateTime generatedAt;

    public InsightsSummaryResponse() {}

    public InsightsSummaryResponse(String summary, List<String> highlights, int periodDays,
                                   long sessionsCompleted, Double averageFeeling, LocalDateTime generatedAt) {
        this.summary = summary;
        this.highlights = highlights;
        this.periodDays = periodDays;
        this.sessionsCompleted = sessionsCompleted;
        this.averageFeeling = averageFeeling;
        this.generatedAt = generatedAt;
    }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public List<String> getHighlights() { return highlights; }
    public void setHighlights(List<String> highlights) { this.highlights = highlights; }

    public int getPeriodDays() { return periodDays; }
    public void setPeriodDays(int periodDays) { this.periodDays = periodDays; }

    public long getSessionsCompleted() { return sessionsCompleted; }
    public void setSessionsCompleted(long sessionsCompleted) { this.sessionsCompleted = sessionsCompleted; }

    public Double getAverageFeeling() { return averageFeeling; }
    public void setAverageFeeling(Double averageFeeling) { this.averageFeeling = averageFeeling; }

    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; }
}
