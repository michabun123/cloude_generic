package com.interview.prep.dto;

import java.time.Instant;

/**
 * Standard success envelope returned by mutating endpoints (POST/PUT/DELETE).
 *
 * @param <T> payload type
 */
public record ApiResponse<T>(String message, T data, Instant timestamp) {

    public static <T> ApiResponse<T> of(String message, T data) {
        return new ApiResponse<>(message, data, Instant.now());
    }
}
