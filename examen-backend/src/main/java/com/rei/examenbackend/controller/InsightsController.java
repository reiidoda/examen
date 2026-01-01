package com.rei.examenbackend.controller;

import com.rei.examenbackend.dto.insights.InsightsSummaryResponse;
import com.rei.examenbackend.dto.insights.QuestionSuggestionRequest;
import com.rei.examenbackend.dto.insights.QuestionSuggestionResponse;
import com.rei.examenbackend.dto.insights.SessionInsightRequest;
import com.rei.examenbackend.dto.insights.SessionInsightResponse;
import com.rei.examenbackend.model.User;
import com.rei.examenbackend.service.insights.InsightsService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/insights")
public class InsightsController {
    private final InsightsService insightsService;

    public InsightsController(InsightsService insightsService) {
        this.insightsService = insightsService;
    }

    @GetMapping("/summary")
    public ResponseEntity<InsightsSummaryResponse> summary(@AuthenticationPrincipal User user,
                                                           @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(insightsService.summary(user, days));
    }

    @PostMapping("/session")
    public ResponseEntity<SessionInsightResponse> analyzeSession(@AuthenticationPrincipal User user,
                                                                 @Valid @RequestBody SessionInsightRequest request) {
        return ResponseEntity.ok(insightsService.analyzeSession(user, request.getSessionId()));
    }

    @PostMapping("/questions")
    public ResponseEntity<QuestionSuggestionResponse> suggestQuestions(@AuthenticationPrincipal User user,
                                                                       @Valid @RequestBody QuestionSuggestionRequest request) {
        return ResponseEntity.ok(insightsService.suggestQuestions(user, request));
    }
}
