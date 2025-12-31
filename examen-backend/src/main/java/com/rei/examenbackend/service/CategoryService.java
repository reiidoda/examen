package com.rei.examenbackend.service;

import com.rei.examenbackend.dto.category.CategoryRequest;
import com.rei.examenbackend.dto.category.CategoryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CategoryService {

    CategoryResponse create(CategoryRequest request);

    CategoryResponse update(Long id, CategoryRequest request);

    void delete(Long id);

    CategoryResponse getById(Long id);

    Page<CategoryResponse> getAll(Pageable pageable);
}
