package com.rei.examenbackend.service.impl;

import com.rei.examenbackend.dto.answer.AnswerRequest;
import com.rei.examenbackend.dto.answer.AnswerResponse;
import com.rei.examenbackend.exception.ApiException;
import com.rei.examenbackend.model.Answer;
import com.rei.examenbackend.model.ExaminationSession;
import com.rei.examenbackend.model.Question;
import com.rei.examenbackend.repository.AnswerRepository;
import com.rei.examenbackend.repository.ExaminationSessionRepository;
import com.rei.examenbackend.repository.QuestionRepository;
import com.rei.examenbackend.service.AnswerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AnswerServiceImpl implements AnswerService {

    private final AnswerRepository answerRepository;
    private final QuestionRepository questionRepository;
    private final ExaminationSessionRepository examinationSessionRepository;

    @Override
    public AnswerResponse create(AnswerRequest request) {
        Question question = findQuestion(request.getQuestionId());
        ExaminationSession session = findSession(request.getExaminationSessionId());

        Answer answer = Answer.builder()
                .answerText(request.getAnswerText())
                .correct(request.isCorrect())
                .reflectionText(request.getReflectionText())
                .feelingScore(request.getFeelingScore())
                .question(question)
                .examinationSession(session)
                .build();

        answerRepository.save(answer);

        return toResponse(answer);
    }


    @Override
    public AnswerResponse update(Long id, AnswerRequest request) {
        Answer answer = findAnswer(id);
        Question question = findQuestion(request.getQuestionId());
        ExaminationSession session = findSession(request.getExaminationSessionId());

        answer.setAnswerText(request.getAnswerText());
        answer.setCorrect(request.isCorrect());
        answer.setReflectionText(request.getReflectionText());
        answer.setFeelingScore(request.getFeelingScore());
        answer.setQuestion(question);
        answer.setExaminationSession(session);

        answerRepository.save(answer);

        return toResponse(answer);
    }


    @Override
    public void delete(Long id) {
        answerRepository.deleteById(id);
    }

    @Override
    public AnswerResponse getById(Long id) {
        Answer answer = findAnswer(id);

        return toResponse(answer);
    }


    @Override
    public List<AnswerResponse> getByQuestion(Long questionId) {
        return answerRepository.findByQuestionId(questionId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<AnswerResponse> getBySession(Long sessionId) {
        ExaminationSession session = findSession(sessionId);

        return answerRepository.findByExaminationSession(session)
                .stream()
                .map(this::toResponse)
                .toList();
    }


    private AnswerResponse toResponse(Answer a) {
        return AnswerResponse.builder()
                .id(a.getId())
                .answerText(a.getAnswerText())
                .correct(a.isCorrect())
                .reflectionText(a.getReflectionText())
                .feelingScore(a.getFeelingScore())
                .questionId(a.getQuestion().getId())
                .examinationSessionId(a.getExaminationSession().getId())
                .build();
    }

    private Answer findAnswer(Long id) {
        return answerRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Answer not found"));
    }

    private Question findQuestion(Long id) {
        return questionRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Question not found"));
    }

    private ExaminationSession findSession(Long id) {
        return examinationSessionRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Session not found"));
    }
}
