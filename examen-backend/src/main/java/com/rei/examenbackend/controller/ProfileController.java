package com.rei.examenbackend.controller;

import com.rei.examenbackend.dto.profile.ProfileSummaryResponse;
import com.rei.examenbackend.exception.ApiException;
import com.rei.examenbackend.model.Answer;
import com.rei.examenbackend.model.ExaminationSession;
import com.rei.examenbackend.model.QuestionType;
import com.rei.examenbackend.model.User;
import com.rei.examenbackend.dto.profile.ProfileProgressResponse;
import com.rei.examenbackend.dto.profile.PeriodSummaryResponse;
import com.rei.examenbackend.dto.profile.ProfileAnalyticsResponse;
import com.rei.examenbackend.repository.DailyExaminationRepository;
import com.rei.examenbackend.repository.ExaminationSessionRepository;
import com.rei.examenbackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final UserRepository userRepository;
    private final ExaminationSessionRepository sessionRepository;
    private final DailyExaminationRepository dailyExaminationRepository;

    @GetMapping("/summary")
    public ResponseEntity<ProfileSummaryResponse> summary(@AuthenticationPrincipal User user) {
        User persisted = userRepository.findById(user.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        var allSessions = sessionRepository.findAllByUserOrderByCompletedAtDesc(persisted);

        long completedSessions = allSessions.stream()
                .filter(session -> session.getCompletedAt() != null)
                .count();

        long streak = computeStreakDays(persisted);

        long categoriesUsed = allSessions.stream()
                .flatMap(session -> session.getAnswers() == null ? java.util.stream.Stream.empty() : session.getAnswers().stream())
                .map(answer -> answer.getQuestion().getCategory().getId())
                .distinct()
                .count();

        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        java.time.LocalDateTime weekAgo = now.minusDays(7);
        java.time.LocalDateTime monthAgo = now.minusDays(30);

        long sessionsThisWeek = sessionRepository.findAllByUserAndCompletedAtBetweenOrderByCompletedAtDesc(persisted, weekAgo, now)
                .stream()
                .filter(s -> s.getCompletedAt() != null)
                .count();

        long sessionsThisMonth = sessionRepository.findAllByUserAndCompletedAtBetweenOrderByCompletedAtDesc(persisted, monthAgo, now)
                .stream()
                .filter(s -> s.getCompletedAt() != null)
                .count();

        Double avgMood = sessionRepository.findAllByUserAndCompletedAtBetweenOrderByCompletedAtDesc(persisted, monthAgo, now)
                .stream()
                .filter(s -> s.getMoodScore() != null)
                .mapToInt(ExaminationSession::getMoodScore)
                .average()
                .orElse(Double.NaN);

        Integer todayMood = allSessions.stream()
                .filter(s -> s.getCompletedAt() != null && s.getCompletedAt().toLocalDate().isEqual(java.time.LocalDate.now()))
                .map(ExaminationSession::getMoodScore)
                .filter(java.util.Objects::nonNull)
                .findFirst()
                .orElse(null);

        java.time.LocalDate endDate = java.time.LocalDate.now();
        java.time.LocalDate startDate = endDate.minusDays(13);
        var moodTrend = dailyExaminationRepository.findByUserAndExamDateBetweenOrderByExamDateDesc(persisted, startDate, endDate)
                .stream()
                .map(d -> new ProfileSummaryResponse.MoodPoint(d.getExamDate(), d.getMoodScore()))
                .toList();

        Double spiritualScore = computeSpiritualScore(
                Double.isNaN(avgMood) ? null : avgMood,
                streak,
                sessionsThisMonth,
                categoriesUsed
        );

        ProfileSummaryResponse response = ProfileSummaryResponse.builder()
                .examinationsCompleted(completedSessions)
                .todosCompleted(0)
                .categoriesUsed(categoriesUsed)
                .streakDays(streak)
                .spiritualProgressScore(spiritualScore)
                .sessionsThisWeek(sessionsThisWeek)
                .sessionsThisMonth(sessionsThisMonth)
                .averageMoodLast30Days(Double.isNaN(avgMood) ? null : avgMood)
                .todayMood(todayMood)
                .todayCompleted(todayMood != null || dailyExaminationRepository.findByUserAndExamDate(persisted, java.time.LocalDate.now()).isPresent())
                .recentMoodTrend(moodTrend)
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/progress")
    public ResponseEntity<ProfileProgressResponse> progress(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "14") int days
    ) {
        User persisted = userRepository.findById(user.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        var end = java.time.LocalDate.now();
        var start = end.minusDays(days - 1L);

        var daily = dailyExaminationRepository.findByUserAndExamDateBetweenOrderByExamDateDesc(persisted, start, end)
                .stream()
                .collect(java.util.stream.Collectors.toMap(
                        com.rei.examenbackend.model.DailyExamination::getExamDate,
                        d -> d
                ));

        var sessionMap = sessionRepository.findAllByUserAndCompletedAtIsNotNullAndCompletedAtAfterOrderByCompletedAtDesc(
                        persisted, start.atStartOfDay())
                .stream()
                .collect(java.util.stream.Collectors.groupingBy(s -> s.getCompletedAt().toLocalDate()));

        java.util.List<ProfileProgressResponse.ProgressPoint> points = new java.util.ArrayList<>();

        for (int i = 0; i < days; i++) {
            var date = end.minusDays(i);
            var dailyEntry = daily.get(date);
            boolean completed = dailyEntry != null || sessionMap.containsKey(date);
            Integer mood = dailyEntry != null ? dailyEntry.getMoodScore() : sessionMap.getOrDefault(date, java.util.Collections.emptyList())
                    .stream()
                    .map(ExaminationSession::getMoodScore)
                    .filter(java.util.Objects::nonNull)
                    .findFirst()
                    .orElse(null);
            points.add(ProfileProgressResponse.ProgressPoint.builder()
                    .date(date)
                    .completed(completed)
                    .mood(mood)
                    .build());
        }

        points.sort(java.util.Comparator.comparing(ProfileProgressResponse.ProgressPoint::getDate));

        return ResponseEntity.ok(ProfileProgressResponse.builder()
                .points(points)
                .build());
    }

    @GetMapping("/summary/weekly")
    public ResponseEntity<PeriodSummaryResponse> weekly(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(periodSummary(user, 7, "week"));
    }

    @GetMapping("/summary/monthly")
    public ResponseEntity<PeriodSummaryResponse> monthly(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(periodSummary(user, 30, "month"));
    }

    @GetMapping("/analytics")
    @Transactional(readOnly = true)
    public ResponseEntity<ProfileAnalyticsResponse> analytics(@AuthenticationPrincipal User user) {
        User persisted = userRepository.findById(user.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        var now = java.time.LocalDateTime.now();
        var since = now.minusDays(30);

        var sessions = sessionRepository.findAllByUserAndCompletedAtBetweenOrderByCompletedAtDesc(persisted, since, now);

        var answers = sessions.stream()
                .filter(s -> s.getAnswers() != null)
                .flatMap(s -> s.getAnswers().stream())
                .toList();

        Double overallAvgScore = answers.stream()
                .map(this::calculateAnswerScore)
                .flatMapToDouble(java.util.OptionalDouble::stream)
                .average()
                .orElse(Double.NaN);

        Double overallMood = sessions.stream()
                .map(ExaminationSession::getMoodScore)
                .filter(java.util.Objects::nonNull)
                .mapToInt(Integer::intValue)
                .average()
                .orElse(Double.NaN);

        var categories = answers.stream()
                .collect(java.util.stream.Collectors.groupingBy(answer -> answer.getQuestion().getCategory()))
                .entrySet()
                .stream()
                .map(entry -> {
                    var answerList = entry.getValue();
                    Double avg = answerList.stream()
                            .map(this::calculateAnswerScore)
                            .flatMapToDouble(java.util.OptionalDouble::stream)
                            .average()
                            .orElse(Double.NaN);
                    long yesTotal = answerList.stream()
                            .filter(a -> a.getQuestion().getResponseType() == QuestionType.YES_NO)
                            .count();
                    long yesCount = answerList.stream()
                            .filter(a -> a.getQuestion().getResponseType() == QuestionType.YES_NO)
                            .filter(this::isYes)
                            .count();
                    Double yesRate = yesTotal > 0 ? (yesCount * 100d / yesTotal) : null;

                    return ProfileAnalyticsResponse.CategoryBreakdown.builder()
                            .categoryId(entry.getKey().getId())
                            .categoryName(entry.getKey().getName())
                            .answers((long) answerList.size())
                            .averageScore(Double.isNaN(avg) ? null : avg)
                            .yesRate(yesRate)
                            .build();
                })
                .sorted(java.util.Comparator.comparing(ProfileAnalyticsResponse.CategoryBreakdown::getAverageScore,
                        java.util.Comparator.nullsLast(java.util.Comparator.reverseOrder())))
                .toList();

        var weekly = sessions.stream()
                .filter(s -> s.getCompletedAt() != null)
                .collect(java.util.stream.Collectors.groupingBy(s ->
                        s.getCompletedAt().toLocalDate().with(java.time.temporal.TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY))
                ))
                .entrySet()
                .stream()
                .map(entry -> {
                    Double moodAvg = entry.getValue().stream()
                            .map(ExaminationSession::getMoodScore)
                            .filter(java.util.Objects::nonNull)
                            .mapToInt(Integer::intValue)
                            .average()
                            .orElse(Double.NaN);
                    return new ProfileAnalyticsResponse.WeeklyTrendPoint(entry.getKey(), entry.getValue().size(),
                            Double.isNaN(moodAvg) ? null : moodAvg);
                })
                .sorted(java.util.Comparator.comparing(ProfileAnalyticsResponse.WeeklyTrendPoint::weekStart))
                .toList();

        ProfileAnalyticsResponse response = ProfileAnalyticsResponse.builder()
                .overallAverageScore(Double.isNaN(overallAvgScore) ? null : overallAvgScore)
                .overallMood(Double.isNaN(overallMood) ? null : overallMood)
                .categories(categories)
                .weeklyTrend(weekly)
                .build();

        return ResponseEntity.ok(response);
    }

    private PeriodSummaryResponse periodSummary(User user, int days, String label) {
        User persisted = userRepository.findById(user.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        var end = java.time.LocalDate.now();
        var start = end.minusDays(days);

        var daily = dailyExaminationRepository.findByUserAndExamDateBetweenOrderByExamDateDesc(persisted, start, end);
        long completedDays = daily.size();

        Double avgMood = daily.stream()
                .filter(d -> d.getMoodScore() != null)
                .mapToInt(com.rei.examenbackend.model.DailyExamination::getMoodScore)
                .average()
                .orElse(Double.NaN);

        long sessions = sessionRepository.findAllByUserAndCompletedAtBetweenOrderByCompletedAtDesc(
                        persisted, start.atStartOfDay(), end.atTime(23,59,59))
                .stream()
                .filter(s -> s.getCompletedAt() != null)
                .count();

        return PeriodSummaryResponse.builder()
                .period(label)
                .sessions(sessions)
                .completedDays(completedDays)
                .averageMood(Double.isNaN(avgMood) ? null : avgMood)
                .build();
    }

    private long computeStreakDays(User user) {
        var sessions = sessionRepository.findAllByUserOrderByCompletedAtDesc(user)
                .stream()
                .filter(s -> s.getCompletedAt() != null)
                .toList();
        if (sessions.isEmpty()) {
            return 0;
        }

        long streak = 0;
        java.time.LocalDate current = java.time.LocalDate.now();

        java.util.Set<java.time.LocalDate> uniqueDays = new java.util.LinkedHashSet<>();
        sessions.forEach(s -> uniqueDays.add(s.getCompletedAt().toLocalDate()));

        for (java.time.LocalDate day : uniqueDays) {
            if (day.isEqual(current)) {
                streak++;
                current = current.minusDays(1);
            } else if (day.isBefore(current)) {
                // break streak when a day is missing
                break;
            }
        }
        return streak;
    }

    private java.util.OptionalDouble calculateAnswerScore(Answer answer) {
        var question = answer.getQuestion();
        var response = answer.getAnswerText();
        if (response == null) {
            return java.util.OptionalDouble.empty();
        }

        var type = question.getResponseType() == null ? QuestionType.SCALE_1_5 : question.getResponseType();

        if (type == QuestionType.YES_NO) {
            String normalized = response.trim().toLowerCase();
            if (normalized.equals("yes") || normalized.equals("true") || normalized.equals("1")) {
                return java.util.OptionalDouble.of(100);
            }
            if (normalized.equals("no") || normalized.equals("false") || normalized.equals("0")) {
                return java.util.OptionalDouble.of(0);
            }
        } else if (type == QuestionType.SCALE_1_5) {
            try {
                int value = Integer.parseInt(response.trim());
                if (value >= 1 && value <= 5) {
                    double normalized = ((double) (value - 1) / 4d) * 100d;
                    return java.util.OptionalDouble.of(normalized);
                }
            } catch (NumberFormatException ignored) {
                return java.util.OptionalDouble.empty();
            }
        }
        return java.util.OptionalDouble.empty();
    }

    private boolean isYes(Answer answer) {
        if (answer.getAnswerText() == null) {
            return false;
        }
        String normalized = answer.getAnswerText().trim().toLowerCase();
        return normalized.equals("yes") || normalized.equals("true") || normalized.equals("1");
    }

    private Double computeSpiritualScore(Double mood, long streakDays, long sessionsThisMonth, long categoriesUsed) {
        double moodScore = mood == null ? 0 : Math.min(5.0, Math.max(0.0, mood)) * 10; // 0-50
        double streakScore = Math.min(30, streakDays) / 30.0 * 20; // up to 20
        double sessionsScore = Math.min(20, sessionsThisMonth * 2); // 2 pts per session, capped 20
        double diversityScore = Math.min(10, categoriesUsed * 2); // breadth up to 10
        double total = moodScore + streakScore + sessionsScore + diversityScore;
        return Math.round(total * 10.0) / 10.0; // one decimal place
    }
}
