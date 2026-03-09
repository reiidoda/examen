package com.rei.examenbackend.service;

import com.rei.examenbackend.dto.answer.AnswerRequest;
import com.rei.examenbackend.dto.answer.AnswerResponse;

import java.util.List;

public interface AnswerService {

    AnswerResponse create(AnswerRequest request);

    AnswerResponse update(Long id, AnswerRequest request);

    void delete(Long id);

    AnswerResponse getById(Long id);

    List<AnswerResponse> getByQuestion(Long questionId);

    List<AnswerResponse> getBySession(Long sessionId);
}
