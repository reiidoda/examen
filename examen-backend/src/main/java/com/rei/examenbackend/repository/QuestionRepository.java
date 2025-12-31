package com.rei.examenbackend.repository;

import com.rei.examenbackend.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {

    List<Question> findByCategoryId(Long categoryId);

    List<Question> findByOwnerId(Long ownerId);

    List<Question> findByOwnerIsNull();
}
