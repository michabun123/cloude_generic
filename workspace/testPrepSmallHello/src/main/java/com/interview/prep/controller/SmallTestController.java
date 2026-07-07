package com.interview.prep.controller;

import com.interview.prep.dto.ApiResponse;
import com.interview.prep.dto.SmallTestRequest;
import com.interview.prep.dto.SmallTestResponse;
import com.interview.prep.service.SmallTestService;
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
 * CRUD REST API for the flexible-schema Mongo document ({@code SmallTest}).
 */
@Tag(name = "SmallTest", description = "Flexible-schema document CRUD (MongoDB)")
@RestController
@RequestMapping("/api/v1/small-tests")
@RequiredArgsConstructor
public class SmallTestController {

    private final SmallTestService service;

    @Operation(summary = "List all documents")
    @GetMapping
    public ResponseEntity<List<SmallTestResponse>> list() {
        return ResponseEntity.ok(service.findAll());
    }

    @Operation(summary = "Get document by id")
    @GetMapping("/{id}")
    public ResponseEntity<SmallTestResponse> getById(@PathVariable String id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @Operation(summary = "Create document")
    @PostMapping
    public ResponseEntity<ApiResponse<SmallTestResponse>> create(@Valid @RequestBody SmallTestRequest request) {
        SmallTestResponse created = service.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.of("SmallTest created", created));
    }

    @Operation(summary = "Update document")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SmallTestResponse>> update(@PathVariable String id,
                                                                 @Valid @RequestBody SmallTestRequest request) {
        return ResponseEntity.ok(ApiResponse.of("SmallTest updated", service.update(id, request)));
    }

    @Operation(summary = "Delete document")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<SmallTestResponse>> delete(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.of("SmallTest deleted", service.delete(id)));
    }
}
