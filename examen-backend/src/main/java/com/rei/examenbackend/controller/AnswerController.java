package com.rei.examenbackend.controller;

import com.rei.examenbackend.dto.answer.AnswerRequest;
import com.rei.examenbackend.dto.answer.AnswerResponse;
import com.rei.examenbackend.service.AnswerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/answers")
@RequiredArgsConstructor
public class AnswerController {

    private final AnswerService answerService;

    @PostMapping
    public ResponseEntity<AnswerResponse> create(@RequestBody AnswerRequest request) {
        return ResponseEntity.ok(answerService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AnswerResponse> update(
            @PathVariable Long id,
            @RequestBody AnswerRequest request
    ) {
        return ResponseEntity.ok(answerService.update(id, request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AnswerResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(answerService.getById(id));
    }

    @GetMapping("/question/{questionId}")
    public ResponseEntity<List<AnswerResponse>> getByQuestion(@PathVariable Long questionId) {
        return ResponseEntity.ok(answerService.getByQuestion(questionId));
    }

    @GetMapping("/session/{sessionId}")
    public ResponseEntity<List<AnswerResponse>> getBySession(@PathVariable Long sessionId) {
        return ResponseEntity.ok(answerService.getBySession(sessionId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        answerService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
