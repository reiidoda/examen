package com.rei.examenbackend.service;

import com.rei.examenbackend.dto.question.QuestionRequest;
import com.rei.examenbackend.dto.question.QuestionResponse;
import com.rei.examenbackend.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface QuestionService {

    QuestionResponse create(QuestionRequest request);

    QuestionResponse update(Long id, QuestionRequest request);

    void delete(Long id);

    QuestionResponse getById(Long id);

    Page<QuestionResponse> getAll(Pageable pageable);

    List<QuestionResponse> getByCategory(Long categoryId);

    QuestionResponse createCustom(QuestionRequest request, User owner);

    List<QuestionResponse> getMine(User owner);

    void deleteMine(Long id, User owner);
}
