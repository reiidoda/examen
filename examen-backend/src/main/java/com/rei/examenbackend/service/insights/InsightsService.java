package com.rei.examenbackend.service.insights;

import com.rei.examenbackend.dto.insights.InsightsSummaryResponse;
import com.rei.examenbackend.dto.insights.QuestionSuggestionRequest;
import com.rei.examenbackend.dto.insights.QuestionSuggestionResponse;
import com.rei.examenbackend.dto.insights.SessionInsightResponse;
import com.rei.examenbackend.exception.ApiException;
import com.rei.examenbackend.model.Answer;
import com.rei.examenbackend.model.ExaminationSession;
import com.rei.examenbackend.model.User;
import com.rei.examenbackend.repository.AnswerRepository;
import com.rei.examenbackend.repository.ExaminationSessionRepository;
import com.rei.examenbackend.repository.QuestionRepository;
import com.rei.examenbackend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class InsightsService {
    private final InsightsClient insightsClient;
    private final UserRepository userRepository;
    private final ExaminationSessionRepository sessionRepository;
    private final AnswerRepository answerRepository;
    private final QuestionRepository questionRepository;

    public InsightsService(InsightsClient insightsClient,
                           UserRepository userRepository,
                           ExaminationSessionRepository sessionRepository,
                           AnswerRepository answerRepository,
                           QuestionRepository questionRepository) {
        this.insightsClient = insightsClient;
        this.userRepository = userRepository;
        this.sessionRepository = sessionRepository;
        this.answerRepository = answerRepository;
        this.questionRepository = questionRepository;
    }

    public InsightsSummaryResponse summary(User user, int days) {
        User persisted = userRepository.findById(user.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        int safeDays = Math.min(Math.max(days, 1), 90);
        LocalDateTime end = LocalDateTime.now();
        LocalDateTime start = end.minusDays(safeDays);

        List<ExaminationSession> sessions = sessionRepository
                .findAllByUserAndCompletedAtBetweenOrderByCompletedAtDesc(persisted, start, end)
                .stream()
                .filter(session -> session.getCompletedAt() != null)
                .toList();

        Double averageFeeling = sessions.stream()
                .map(ExaminationSession::getMoodScore)
                .filter(Objects::nonNull)
                .mapToInt(Integer::intValue)
                .average()
                .orElse(Double.NaN);

        Double normalizedFeeling = Double.isNaN(averageFeeling) ? null : averageFeeling;

        InsightsSummaryContext context = new InsightsSummaryContext(
                persisted,
                safeDays,
                sessions.size(),
                normalizedFeeling,
                start.toLocalDate(),
                end.toLocalDate()
        );

        return insightsClient.buildSummary(context);
    }

    public SessionInsightResponse analyzeSession(User user, Long sessionId) {
        if (sessionId == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Session id is required");
        }

        User persisted = userRepository.findById(user.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        ExaminationSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Session not found"));

        if (!session.getUser().getId().equals(persisted.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Session does not belong to user");
        }

        List<Answer> answers = answerRepository.findByExaminationSession(session);
        Double averageFeeling = answers.stream()
                .map(Answer::getFeelingScore)
                .filter(Objects::nonNull)
                .mapToInt(Integer::intValue)
                .average()
                .orElse(Double.NaN);

        Double normalizedFeeling = Double.isNaN(averageFeeling) ? null : averageFeeling;
        if (normalizedFeeling == null && session.getMoodScore() != null) {
            normalizedFeeling = session.getMoodScore().doubleValue();
        }

        Map<String, Double> categoryAverages = answers.stream()
                .filter(answer -> answer.getFeelingScore() != null)
                .collect(Collectors.groupingBy(
                        answer -> answer.getQuestion().getCategory().getName(),
                        Collectors.averagingInt(Answer::getFeelingScore)
                ));

        List<String> strongest = categoryAverages.entrySet().stream()
                .sorted(Map.Entry.<String, Double>comparingByValue(Comparator.reverseOrder()))
                .limit(2)
                .map(Map.Entry::getKey)
                .toList();

        List<String> needsAttention = categoryAverages.entrySet().stream()
                .sorted(Map.Entry.comparingByValue())
                .limit(2)
                .map(Map.Entry::getKey)
                .toList();

        SessionInsightContext context = new SessionInsightContext(
                persisted,
                session,
                normalizedFeeling,
                strongest,
                needsAttention
        );

        return insightsClient.buildSessionInsight(context);
    }

    public QuestionSuggestionResponse suggestQuestions(User user, QuestionSuggestionRequest request) {
        User persisted = userRepository.findById(user.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        String focus = request == null ? null : request.getFocus();
        int count = request == null || request.getCount() == null ? 5 : request.getCount();
        int safeCount = Math.min(Math.max(count, 1), 10);

        List<String> existing = questionRepository.findByOwnerIsNull().stream()
                .map(q -> q.getText() == null ? null : q.getText().trim())
                .filter(text -> text != null && !text.isBlank())
                .map(text -> text.toLowerCase(Locale.US))
                .toList();

        QuestionSuggestionContext context = new QuestionSuggestionContext(
                persisted,
                focus,
                safeCount,
                existing
        );

        QuestionSuggestionResponse response = insightsClient.buildQuestionSuggestions(context);
        response.setFocus(response.getFocus() == null ? null : response.getFocus().trim());
        return response;
    }
}
