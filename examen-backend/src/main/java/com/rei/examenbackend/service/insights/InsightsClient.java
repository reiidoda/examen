package com.rei.examenbackend.service.insights;

import com.rei.examenbackend.dto.insights.InsightsSummaryResponse;
import com.rei.examenbackend.dto.insights.QuestionSuggestionResponse;
import com.rei.examenbackend.dto.insights.SessionInsightResponse;

public interface InsightsClient {
    InsightsSummaryResponse buildSummary(InsightsSummaryContext context);

    SessionInsightResponse buildSessionInsight(SessionInsightContext context);

    QuestionSuggestionResponse buildQuestionSuggestions(QuestionSuggestionContext context);
}
