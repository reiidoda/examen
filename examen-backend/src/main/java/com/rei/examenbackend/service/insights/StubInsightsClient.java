package com.rei.examenbackend.service.insights;

import com.rei.examenbackend.dto.insights.InsightsSummaryResponse;
import com.rei.examenbackend.dto.insights.QuestionSuggestionResponse;
import com.rei.examenbackend.dto.insights.SessionInsightResponse;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class StubInsightsClient implements InsightsClient {

    private static final Map<String, List<String>> SUGGESTION_BANK = Map.of(
            "gratitude", List.of(
                    "Where did I notice gratitude today?",
                    "Who or what am I thankful for right now?",
                    "How did I express gratitude in action?",
                    "What small gift did I overlook today?"
            ),
            "prayer", List.of(
                    "When did I feel most present in prayer?",
                    "Where did I rush past silence or stillness?",
                    "How did I invite God or meaning into my choices today?",
                    "What word or phrase stayed with me in prayer?"
            ),
            "relationships", List.of(
                    "Where did I choose patience in a relationship?",
                    "Who did I need to forgive or ask forgiveness from?",
                    "How did I show care in a small but real way?",
                    "Where did I withdraw instead of engaging with love?"
            ),
            "service", List.of(
                    "Where did I choose generosity over comfort today?",
                    "How did I serve with attention, not just action?",
                    "Who did I overlook who needed help?",
                    "What act of service brought me joy?"
            ),
            "integrity", List.of(
                    "Where did I speak truthfully and clearly today?",
                    "Where did I avoid responsibility?",
                    "How did I act with integrity under pressure?",
                    "What commitment did I honor today?"
            ),
            "stewardship", List.of(
                    "How did I steward my time today?",
                    "Where did I waste energy or attention?",
                    "How did I care for my body and mind?",
                    "What would a balanced rhythm look like tomorrow?"
            )
    );

    @Override
    public InsightsSummaryResponse buildSummary(InsightsSummaryContext context) {
        String summary;
        List<String> highlights = new ArrayList<>();

        if (context.sessionsCompleted() == 0) {
            summary = "No completed sessions in this period. Start a new examination to build momentum.";
        } else {
            String avg = context.averageFeeling() == null
                    ? "no recorded feeling"
                    : String.format(Locale.US, "%.1f/5", context.averageFeeling());
            summary = String.format(
                    "In the last %d days you completed %d sessions with an average feeling of %s.",
                    context.periodDays(),
                    context.sessionsCompleted(),
                    avg
            );
        }

        highlights.add("Period days: " + context.periodDays());
        highlights.add("Sessions completed: " + context.sessionsCompleted());
        highlights.add("Average feeling: " + (context.averageFeeling() == null
                ? "-"
                : String.format(Locale.US, "%.1f/5", context.averageFeeling())));

        return new InsightsSummaryResponse(
                summary,
                highlights,
                context.periodDays(),
                context.sessionsCompleted(),
                context.averageFeeling(),
                LocalDateTime.now()
        );
    }

    @Override
    public SessionInsightResponse buildSessionInsight(SessionInsightContext context) {
        String summary;
        List<String> insights = new ArrayList<>();
        List<String> nextSteps = new ArrayList<>();

        if (context.averageFeeling() == null) {
            summary = "Session completed with no recorded feeling score.";
        } else {
            summary = String.format(Locale.US, "Session average feeling: %.1f/5.", context.averageFeeling());
        }

        if (!context.strongestCategories().isEmpty()) {
            insights.add("Strongest areas: " + String.join(", ", context.strongestCategories()) + ".");
        }
        if (!context.needsAttentionCategories().isEmpty()) {
            insights.add("Growth opportunities: " + String.join(", ", context.needsAttentionCategories()) + ".");
        }
        if (insights.isEmpty()) {
            insights.add("Complete more reflections to reveal your strongest and weakest areas.");
        }

        nextSteps.add("Choose one concrete action for tomorrow.");
        nextSteps.add("Revisit one question that felt difficult today.");
        nextSteps.add("Close with a short gratitude or prayer.");

        return new SessionInsightResponse(
                context.session().getId(),
                summary,
                insights,
                nextSteps,
                context.averageFeeling(),
                LocalDateTime.now()
        );
    }

    @Override
    public QuestionSuggestionResponse buildQuestionSuggestions(QuestionSuggestionContext context) {
        String focus = normalizeFocus(context.focus());
        int count = context.count();
        List<String> existing = context.existingQuestions();
        List<String> existingNormalized = existing == null
                ? List.of()
                : existing.stream()
                .map(item -> item == null ? null : item.toLowerCase(Locale.US))
                .filter(item -> item != null && !item.isBlank())
                .toList();

        List<String> base = new ArrayList<>(
                SUGGESTION_BANK.getOrDefault(focus, SUGGESTION_BANK.get("gratitude"))
        );
        List<String> suggestions = new ArrayList<>();

        for (String candidate : base) {
            if (suggestions.size() >= count) {
                break;
            }
            String normalizedCandidate = candidate.toLowerCase(Locale.US);
            if (existingNormalized.contains(normalizedCandidate)) {
                continue;
            }
            suggestions.add(candidate);
        }

        while (suggestions.size() < count) {
            String fallback = "Where did I practice " + focus + " today?";
            String normalizedFallback = fallback.toLowerCase(Locale.US);
            if (!suggestions.contains(fallback) && !existingNormalized.contains(normalizedFallback)) {
                suggestions.add(fallback);
            } else {
                suggestions.add("What is one step I can take to grow in " + focus + "?");
            }
        }

        return new QuestionSuggestionResponse(focus, suggestions, LocalDateTime.now());
    }

    private String normalizeFocus(String focus) {
        if (focus == null || focus.isBlank()) {
            return "gratitude";
        }
        return focus.trim().toLowerCase(Locale.US);
    }
}
