package com.rei.examenbackend.service.insights;

import com.rei.examenbackend.model.User;

import java.util.List;

public record QuestionSuggestionContext(
        User user,
        String focus,
        int count,
        List<String> existingQuestions
) {}
