package com.rei.examenbackend.config;

import com.rei.examenbackend.model.Category;
import com.rei.examenbackend.model.Question;
import com.rei.examenbackend.model.QuestionType;
import com.rei.examenbackend.repository.CategoryRepository;
import com.rei.examenbackend.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Configuration
@RequiredArgsConstructor
public class DataSeeder {

    private final CategoryRepository categoryRepository;
    private final QuestionRepository questionRepository;

    @Bean
    @Transactional
    public ApplicationRunner seedDefaults() {
        return args -> {
            if (categoryRepository.count() > 0 || questionRepository.count() > 0) {
                return;
            }

            Category emotions = categoryRepository.save(Category.builder()
                    .name("Emotions")
                    .description("How you felt today")
                    .build());
            Category habits = categoryRepository.save(Category.builder()
                    .name("Habits")
                    .description("Habits and routines")
                    .build());
            Category work = categoryRepository.save(Category.builder()
                    .name("Work")
                    .description("Focus and output")
                    .build());

            Map<Category, List<String>> seeds = Map.of(
                    emotions, List.of(
                            "Did you feel calm most of the day?",
                            "Did you acknowledge your emotions without judgment?",
                            "On a scale of 1-5, how balanced did you feel?"
                    ),
                    habits, List.of(
                            "Did you complete your planned habit today?",
                            "Did you make time for rest?",
                            "On a scale of 1-5, how disciplined were you?"
                    ),
                    work, List.of(
                            "Did you focus on the most important task?",
                            "Did you avoid unnecessary distractions?",
                            "On a scale of 1-5, how satisfied are you with your output?"
                    )
            );

            seeds.forEach((category, qs) -> {
                for (int i = 0; i < qs.size(); i++) {
                    String text = qs.get(i);
                    QuestionType type = text.startsWith("On a scale") ? QuestionType.SCALE_1_5 : QuestionType.YES_NO;
                    Question question = Question.builder()
                            .text(text)
                            .orderNumber(i + 1)
                            .responseType(type)
                            .category(category)
                            .custom(false)
                            .build();
                    questionRepository.save(question);
                }
            });
        };
    }
}
