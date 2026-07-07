package com.interview.prep.controller;

import com.interview.prep.dto.ApiResponse;
import com.interview.prep.dto.SmallItemRequest;
import com.interview.prep.dto.SmallItemResponse;
import com.interview.prep.service.SmallItemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * CRUD REST API for the relational main resource ({@code SmallItem}).
 */
@Tag(name = "SmallItem", description = "Relational CRUD (PostgreSQL / H2)")
@RestController
@RequestMapping("/api/v1/small-items")
@RequiredArgsConstructor
public class SmallItemController {

    private final SmallItemService service;

    @Operation(summary = "List all items")
    @GetMapping
    public ResponseEntity<List<SmallItemResponse>> list() {
        return ResponseEntity.ok(service.findAll());
    }

    @Operation(summary = "Get item by id")
    @GetMapping("/{id}")
    public ResponseEntity<SmallItemResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @Operation(summary = "Create item")
    @PostMapping
    public ResponseEntity<ApiResponse<SmallItemResponse>> create(@Valid @RequestBody SmallItemRequest request) {
        SmallItemResponse created = service.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.of("SmallItem created", created));
    }

    @Operation(summary = "Update item")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SmallItemResponse>> update(@PathVariable Long id,
                                                                 @Valid @RequestBody SmallItemRequest request) {
        return ResponseEntity.ok(ApiResponse.of("SmallItem updated", service.update(id, request)));
    }

    @Operation(summary = "Delete item")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<SmallItemResponse>> delete(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.of("SmallItem deleted", service.delete(id)));
    }
}
