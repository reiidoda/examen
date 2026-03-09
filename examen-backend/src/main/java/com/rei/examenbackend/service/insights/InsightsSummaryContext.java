package com.rei.examenbackend.service.insights;

import com.rei.examenbackend.model.User;

import java.time.LocalDate;

public record InsightsSummaryContext(
        User user,
        int periodDays,
        long sessionsCompleted,
        Double averageFeeling,
        LocalDate startDate,
        LocalDate endDate
) {}
