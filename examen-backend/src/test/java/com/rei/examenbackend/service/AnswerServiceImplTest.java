package com.rei.examenbackend.service;

import com.rei.examenbackend.dto.answer.AnswerRequest;
import com.rei.examenbackend.exception.ApiException;
import com.rei.examenbackend.repository.AnswerRepository;
import com.rei.examenbackend.repository.ExaminationSessionRepository;
import com.rei.examenbackend.repository.QuestionRepository;
import com.rei.examenbackend.service.impl.AnswerServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AnswerServiceImplTest {

    private AnswerRepository answerRepository;
    private QuestionRepository questionRepository;
    private ExaminationSessionRepository sessionRepository;
    private AnswerServiceImpl answerService;

    @BeforeEach
    void setUp() {
        answerRepository = mock(AnswerRepository.class);
        questionRepository = mock(QuestionRepository.class);
        sessionRepository = mock(ExaminationSessionRepository.class);
        answerService = new AnswerServiceImpl(answerRepository, questionRepository, sessionRepository);
    }

    @Test
    void getByIdReturnsNotFoundWhenMissing() {
        when(answerRepository.findById(42L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> answerService.getById(42L))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Answer not found")
                .satisfies(ex -> assertThat(((ApiException) ex).getStatus()).isEqualTo(HttpStatus.NOT_FOUND));
    }

    @Test
    void createReturnsNotFoundWhenQuestionMissing() {
        AnswerRequest request = new AnswerRequest();
        request.setQuestionId(100L);
        request.setExaminationSessionId(200L);
        request.setAnswerText("Text");
        request.setCorrect(false);

        when(questionRepository.findById(100L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> answerService.create(request))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Question not found")
                .satisfies(ex -> assertThat(((ApiException) ex).getStatus()).isEqualTo(HttpStatus.NOT_FOUND));
    }
}
