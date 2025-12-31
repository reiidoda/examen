package com.rei.examenbackend.config;

import com.rei.examenbackend.model.Category;
import com.rei.examenbackend.model.Question;
import com.rei.examenbackend.model.QuestionType;
import com.rei.examenbackend.repository.CategoryRepository;
import com.rei.examenbackend.repository.QuestionRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class DefaultExamDataLoader {

    private static final List<String> DEFAULT_QUESTIONS = List.of(
            "Where did I notice gratitude most clearly today?",
            "When did I act out of love versus fear?",
            "Which habit or vice surfaced today, and how did I respond?",
            "Where did I feel closest to God/meaning, and where did I feel distant?",
            "What is one concrete step I will take tomorrow to grow?"
    );

    @Bean
    CommandLineRunner seedQuestions(CategoryRepository categoryRepo, QuestionRepository questionRepo) {
        return args -> {
            if (questionRepo.count() > 0) return; // assume already configured

            Category category = categoryRepo.findByNameIgnoreCase("Reflection")
                    .orElseGet(() -> categoryRepo.save(Category.builder()
                            .name("Reflection")
                            .description("Core examen prompts")
                            .build()));

            int order = 1;
            for (String text : DEFAULT_QUESTIONS) {
                Question q = new Question();
                q.setText(text);
                q.setOrderNumber(order++);
                q.setResponseType(QuestionType.SCALE_1_5);
                q.setCategory(category);
                q.setCustom(false);
                questionRepo.save(q);
            }
        };
    }
}
