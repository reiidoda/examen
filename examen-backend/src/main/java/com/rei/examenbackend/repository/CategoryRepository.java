package com.rei.examenbackend.repository;

import com.rei.examenbackend.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    boolean existsByNameIgnoreCase(String name);

    java.util.Optional<Category> findByNameIgnoreCase(String name);
}
