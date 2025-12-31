package com.rei.examenbackend.service.impl;

import com.rei.examenbackend.dto.answer.AnswerRequest;
import com.rei.examenbackend.dto.answer.AnswerResponse;
import com.rei.examenbackend.model.Answer;
import com.rei.examenbackend.model.ExaminationSession;
import com.rei.examenbackend.model.Question;
import com.rei.examenbackend.repository.AnswerRepository;
import com.rei.examenbackend.repository.ExaminationSessionRepository;
import com.rei.examenbackend.repository.QuestionRepository;
import com.rei.examenbackend.service.AnswerService;
import lombok.RequiredArgsConstructor;
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

        Question question = questionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new RuntimeException("Question not found"));

        ExaminationSession session = examinationSessionRepository.findById(request.getExaminationSessionId())
                .orElseThrow(() -> new RuntimeException("Session not found"));

        Answer answer = Answer.builder()
                .answerText(request.getAnswerText())
                .correct(request.isCorrect())
                .question(question)
                .examinationSession(session)
                .build();

        answerRepository.save(answer);

        return toResponse(answer);
    }


    @Override
    public AnswerResponse update(Long id, AnswerRequest request) {

        Answer answer = answerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Answer not found"));

        Question question = questionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new RuntimeException("Question not found"));

        ExaminationSession session = examinationSessionRepository.findById(request.getExaminationSessionId())
                .orElseThrow(() -> new RuntimeException("Session not found"));

        answer.setAnswerText(request.getAnswerText());
        answer.setCorrect(request.isCorrect());
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
        Answer answer = answerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Answer not found"));

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
        ExaminationSession session = examinationSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

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
                .questionId(a.getQuestion().getId())
                .examinationSessionId(a.getExaminationSession().getId())
                .build();
    }
}
