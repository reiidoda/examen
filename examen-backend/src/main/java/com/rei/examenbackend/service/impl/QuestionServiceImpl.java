package com.rei.examenbackend.service.impl;

import com.rei.examenbackend.dto.answer.AnswerResponse;
import com.rei.examenbackend.dto.category.CategoryResponse;
import com.rei.examenbackend.dto.question.QuestionRequest;
import com.rei.examenbackend.dto.question.QuestionResponse;
import com.rei.examenbackend.exception.ApiException;
import com.rei.examenbackend.model.Category;
import com.rei.examenbackend.model.Question;
import com.rei.examenbackend.model.QuestionType;
import com.rei.examenbackend.model.User;
import com.rei.examenbackend.repository.CategoryRepository;
import com.rei.examenbackend.repository.QuestionRepository;
import com.rei.examenbackend.service.QuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class QuestionServiceImpl implements QuestionService {

    private final QuestionRepository questionRepository;
    private final CategoryRepository categoryRepository;
    private static final List<String> DEFAULT_QUESTIONS = List.of(
            "Where did I notice gratitude most clearly today?",
            "When did I act out of love versus fear?",
            "Which habit or vice surfaced today, and how did I respond?",
            "Where did I feel closest to God/meaning, and where did I feel distant?",
            "What is one concrete step I will take tomorrow to grow?"
    );

    @Override
    public QuestionResponse create(QuestionRequest request) {

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Category not found"));

        Question question = Question.builder()
                .text(request.getText())
                .orderNumber(request.getOrderNumber())
                .difficulty(request.getDifficulty())
                .responseType(request.getResponseType() == null ? QuestionType.SCALE_1_5 : request.getResponseType())
                .category(category)
                .build();

        questionRepository.save(question);

        return toResponse(question);
    }

    @Override
    public QuestionResponse createCustom(QuestionRequest request, User owner) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Category not found"));

        Question question = Question.builder()
                .text(request.getText())
                .orderNumber(request.getOrderNumber())
                .difficulty(request.getDifficulty())
                .responseType(request.getResponseType() == null ? QuestionType.SCALE_1_5 : request.getResponseType())
                .category(category)
                .owner(owner)
                .custom(true)
                .build();

        questionRepository.save(question);
        return toResponse(question);
    }


    @Override
    public QuestionResponse update(Long id, QuestionRequest request) {

        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Question not found"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Category not found"));

        question.setText(request.getText());
        question.setOrderNumber(request.getOrderNumber());
        question.setDifficulty(request.getDifficulty());
        question.setResponseType(request.getResponseType() == null ? QuestionType.SCALE_1_5 : request.getResponseType());
        question.setCategory(category);

        questionRepository.save(question);

        return toResponse(question);
    }


    @Override
    public void delete(Long id) {
        long total = questionRepository.count();
        if (total <= 5) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "At least 5 standard questions must remain.");
        }
        questionRepository.deleteById(id);
    }

    @Override
    public QuestionResponse getById(Long id) {
        Question q = questionRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Question not found"));
        return toResponse(q);
    }

    @Override
    public Page<QuestionResponse> getAll(Pageable pageable) {
        ensureDefaults();
        return questionRepository
                .findAll(pageable)
                .map(this::toResponse);
    }

    @Override
    public List<QuestionResponse> getByCategory(Long categoryId) {
        ensureDefaults();
        return questionRepository
                .findByCategoryId(categoryId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<QuestionResponse> getMine(User owner) {
        return questionRepository.findByOwnerId(owner.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public void deleteMine(Long id, User owner) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Question not found"));
        if (question.getOwner() == null || !question.getOwner().getId().equals(owner.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You cannot delete this question");
        }
        long total = questionRepository.count();
        if (total <= 5) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "At least 5 standard questions must remain.");
        }
        questionRepository.delete(question);
    }

    @Override
    public QuestionResponse updateMine(Long id, QuestionRequest request, User owner) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Question not found"));
        if (question.getOwner() == null || !question.getOwner().getId().equals(owner.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You cannot edit this question");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Category not found"));

        question.setText(request.getText());
        question.setOrderNumber(request.getOrderNumber());
        question.setDifficulty(request.getDifficulty());
        question.setResponseType(request.getResponseType() == null ? QuestionType.SCALE_1_5 : request.getResponseType());
        question.setCategory(category);

        questionRepository.save(question);
        return toResponse(question);
    }

    private QuestionResponse toResponse(Question q) {
        return QuestionResponse.builder()
                .id(q.getId())
                .text(q.getText())
                .orderNumber(q.getOrderNumber())
                .difficulty(q.getDifficulty())
                .responseType(q.getResponseType() == null ? QuestionType.SCALE_1_5 : q.getResponseType())
                .custom(q.isCustom())
                .defaultQuestion(!q.isCustom())
                .category(
                        CategoryResponse.builder()
                                .id(q.getCategory().getId())
                                .name(q.getCategory().getName())
                                .description(q.getCategory().getDescription())
                                .build()
                )
                .answers(
                        q.getAnswers() == null ? null :
                                q.getAnswers().stream().map(a ->
                                        AnswerResponse.builder()
                                                .id(a.getId())
                                                .answerText(a.getAnswerText())
                                                .correct(a.isCorrect())
                                                .build()
                                ).toList()
                )
                .build();
    }

    private void ensureDefaults() {
        long total = questionRepository.count();
        if (total >= DEFAULT_QUESTIONS.size()) {
            return;
        }
        Category category = categoryRepository.findByNameIgnoreCase("Reflection")
                .orElseGet(() -> categoryRepository.save(Category.builder()
                        .name("Reflection")
                        .description("Core examen prompts")
                        .build()));

        Set<String> existing = questionRepository.findAll().stream()
                .map(Question::getText)
                .collect(java.util.stream.Collectors.toSet());

        int order = (int) (questionRepository.count() + 1);
        for (String text : DEFAULT_QUESTIONS) {
            if (existing.contains(text)) continue;
            Question q = new Question();
            q.setText(text);
            q.setOrderNumber(order++);
            q.setResponseType(QuestionType.SCALE_1_5);
            q.setCategory(category);
            q.setCustom(false);
            questionRepository.save(q);
        }
    }
}
